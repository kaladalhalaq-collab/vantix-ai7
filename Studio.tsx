"use client";
import {useState} from "react";
const INST=["XAUUSD","EURUSD","GBPUSD","USDJPY","BTCUSD","ETHUSD","NASDAQ","US30"];
const TF=["M1","M5","M15","M30","H1","H4","D1"];
export default function Studio(){
const [file,setFile]=useState<File|null>(null);const [inst,setInst]=useState("XAUUSD");const [tf,setTf]=useState("H1");const [engine,setEngine]=useState("gemini");
const [busy,setBusy]=useState(false);const [err,setErr]=useState("");const [res,setRes]=useState<any>(null);
const preview=file?URL.createObjectURL(file):"";
async function run(){setBusy(true);setErr("");setRes(null);
const fd=new FormData();fd.set("image",file!);fd.set("instrument",inst);fd.set("timeframe",tf);fd.set("engine",engine);
const r=await fetch("/api/analyze",{method:"POST",body:fd});const j=await r.json();
if(!r.ok)setErr(j.error||"Request failed");else setRes(j);setBusy(false);}
const sel="rounded-lg border border-cyan/25 bg-navy px-3 py-2";
return(<div className="grid gap-5">
<label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();setFile(e.dataTransfer.files[0]??null);}} className="glass grid min-h-48 cursor-pointer place-items-center rounded-2xl p-4 text-center">
<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e=>setFile(e.target.files?.[0]??null)}/>
{preview?<img src={preview} alt="chart" className="max-h-72 rounded-lg"/>:<span>اسحب صورة الشارت أو اضغط للاختيار · Drop or tap to choose a chart</span>}</label>
<div className="grid grid-cols-3 gap-3">
<select className={sel} value={inst} onChange={e=>setInst(e.target.value)}>{INST.map(i=><option key={i}>{i}</option>)}</select>
<select className={sel} value={tf} onChange={e=>setTf(e.target.value)}>{TF.map(i=><option key={i}>{i}</option>)}</select>
<select className={sel} value={engine} onChange={e=>setEngine(e.target.value)}><option value="gemini">Gemini</option><option value="claude">Claude</option></select></div>
<button disabled={!file||busy} onClick={run} className="rounded-xl bg-gradient-to-r from-volt to-cyan px-6 py-3 font-semibold text-ink disabled:opacity-40">{busy?"…":"حلّل الشارت · Analyze"}</button>
{err&&<p role="alert" className="glass rounded-xl border-gold/40 p-4 text-gold">{err}</p>}
{res&&<div className="glass grid gap-2 rounded-2xl p-5">
<p className="font-display text-2xl">{res.direction}</p>
{["entry_zone","stop_loss","take_profit_1","take_profit_2","take_profit_3","risk_reward"].map(k=><p key={k}><span className="text-cyan">{k}: </span>{String(res[k]??"—")}</p>)}
<p className="text-snow/80">{res.explanation}</p><p className="text-sm text-gold">{res.invalidation}</p><p className="text-xs opacity-70">{res.limitations}</p></div>}
<p className="text-xs opacity-60">تحليل تعليمي فقط، وليس نصيحة مالية · Educational only, not financial advice.</p></div>);}
