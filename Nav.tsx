"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Home,CandlestickChart,User} from "lucide-react";
import {t,Lang} from "@/lib/i18n";
export default function Nav({lang}:{lang:Lang}){
const r=useRouter();const s=t[lang];
const toggle=()=>{document.cookie=`lang=${lang==="ar"?"en":"ar"};path=/;max-age=31536000`;r.refresh();};
return(<>
<header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 glass">
<Link href="/" className="font-display text-lg tracking-wide">VANTI<span className="text-cyan">Χ</span> AI</Link>
<button onClick={toggle} className="rounded-full border border-cyan/30 px-3 py-1 text-sm">{lang==="ar"?"EN":"عربي"}</button></header>
<nav className="fixed inset-x-4 bottom-4 z-30 grid grid-cols-3 items-end rounded-2xl glass px-4 pb-2 pt-3 text-center text-xs sm:hidden" style={{paddingBottom:"max(.5rem,env(safe-area-inset-bottom))"}}>
<Link href="/account" className="flex flex-col items-center gap-1"><User size={20}/>{s.acct}</Link>
<Link href="/analysis" className="-mt-8 flex flex-col items-center gap-1"><span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-volt to-cyan shadow-[0_0_28px_#00D9FF88]"><CandlestickChart size={26} color="#03070D"/></span>{s.trade}</Link>
<Link href="/" className="flex flex-col items-center gap-1"><Home size={20}/>{s.home}</Link></nav></>);}
