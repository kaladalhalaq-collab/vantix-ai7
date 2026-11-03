import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {createServerClient} from "@supabase/ssr";
import {createClient} from "@supabase/supabase-js";
import {z} from "zod";
export const runtime="nodejs";
const Body=z.object({instrument:z.enum(["XAUUSD","EURUSD","GBPUSD","USDJPY","BTCUSD","ETHUSD","NASDAQ","US30"]),timeframe:z.enum(["M1","M5","M15","M30","H1","H4","D1"]),engine:z.enum(["gemini","claude"])});
const hits=new Map<string,number[]>();
function limited(id:string){const n=Date.now(),a=(hits.get(id)||[]).filter(t=>n-t<60000);a.push(n);hits.set(id,a);return a.length>5;} // per-instance; use Redis/Upstash for production
function mime(b:Uint8Array){if(b[0]===0x89&&b[1]===0x50)return"image/png";if(b[0]===0xff&&b[1]===0xd8)return"image/jpeg";if(b[8]===0x57&&b[9]===0x45)return"image/webp";return null;}
const PROMPT=(i:string,tf:string)=>`You analyze a trading chart screenshot of ${i} on ${tf} for EDUCATION. Use only what is visible; never invent live prices, and use null when a level is not readable. Evaluate structure, trend, support/resistance, liquidity, BOS, CHoCH, FVG, order blocks, supply/demand. Reply with JSON only: {"direction":"BUY|SELL|NEUTRAL","entry_zone":string|null,"stop_loss":string|null,"take_profit_1":string|null,"take_profit_2":string|null,"take_profit_3":string|null,"risk_reward":string|null,"confidence":number,"explanation":string,"technical_reasons":string[],"invalidation":string,"limitations":string}`;
export async function POST(req:Request){
const jar=await cookies();
const sb=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>jar.getAll(),setAll:()=>{}}});
const {data:{user}}=await sb.auth.getUser();
if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
if(limited(user.id))return NextResponse.json({error:"Too many requests. Wait a minute."},{status:429});
const fd=await req.formData();const p=Body.safeParse(Object.fromEntries(fd));const f=fd.get("image");
if(!p.success||!(f instanceof File))return NextResponse.json({error:"Invalid input."},{status:400});
if(f.size>5*1024*1024)return NextResponse.json({error:"Image must be under 5 MB."},{status:413});
const buf=new Uint8Array(await f.arrayBuffer());const mt=mime(buf);
if(!mt)return NextResponse.json({error:"Only PNG, JPEG or WebP images."},{status:415});
const key=p.data.engine==="gemini"?process.env.GEMINI_API_KEY:process.env.ANTHROPIC_API_KEY;
const model=p.data.engine==="gemini"?process.env.GEMINI_MODEL:process.env.CLAUDE_MODEL;
if(!key||!model)return NextResponse.json({error:`${p.data.engine} is not configured. Set its API key and model in the environment variables.`},{status:503});
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
const cost=Number(process.env.ANALYSIS_POINT_COST||46);
const {data:ok,error:se}=await admin.rpc("spend_points",{p_user:user.id,p_cost:cost});
if(se||!ok)return NextResponse.json({error:"Not enough points, plan expired, or daily limit reached."},{status:402});
try{
const b64=Buffer.from(buf).toString("base64");const prompt=PROMPT(p.data.instrument,p.data.timeframe);let text="";
if(p.data.engine==="gemini"){
const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:"POST",headers:{"content-type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{parts:[{text:prompt},{inlineData:{mimeType:mt,data:b64}}]}],generationConfig:{responseMimeType:"application/json"}})});
if(!r.ok)throw new Error("gemini "+r.status);text=(await r.json()).candidates?.[0]?.content?.parts?.[0]?.text??"";
}else{
const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify({model,max_tokens:1500,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mt,data:b64}},{type:"text",text:prompt}]}]})});
if(!r.ok)throw new Error("claude "+r.status);text=(await r.json()).content?.find((c:any)=>c.type==="text")?.text??"";}
const out=JSON.parse(text.replace(/```json|```/g,"").trim());
await admin.from("analyses").insert({user_id:user.id,instrument:p.data.instrument,timeframe:p.data.timeframe,engine:p.data.engine,result:out,cost});
if(process.env.N8N_ANALYSIS_LOG_WEBHOOK)fetch(process.env.N8N_ANALYSIS_LOG_WEBHOOK,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({user:user.id,instrument:p.data.instrument,timeframe:p.data.timeframe,direction:out.direction})}).catch(()=>{});
return NextResponse.json(out);
}catch(e){
await admin.rpc("refund_points",{p_user:user.id,p_cost:cost});
return NextResponse.json({error:"The analysis provider failed. Your points were refunded."},{status:502});}}
