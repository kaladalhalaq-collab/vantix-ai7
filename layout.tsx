import type {Metadata,Viewport} from "next";
import {cookies} from "next/headers";
import {IBM_Plex_Sans_Arabic,Sora} from "next/font/google";
import "./globals.css";
import Background from "@/components/3d/Background";
import Nav from "@/components/layout/Nav";
const body=IBM_Plex_Sans_Arabic({subsets:["arabic","latin"],weight:["400","500","600"],variable:"--f-body",display:"swap"});
const display=Sora({subsets:["latin"],weight:["600","700"],variable:"--f-display",display:"swap"});
export const metadata:Metadata={title:"VANTIΧ AI",description:"Advanced Artificial Intelligence for Market Intelligence"};
export const viewport:Viewport={themeColor:"#03070D",width:"device-width",initialScale:1,viewportFit:"cover"};
export default async function Root({children}:{children:React.ReactNode}){
const lang=(await cookies()).get("lang")?.value==="en"?"en":"ar";
return(<html lang={lang} dir={lang==="ar"?"rtl":"ltr"} className={`${body.variable} ${display.variable}`}><body className="font-body">
<div className="fallback-bg" aria-hidden/><Background/><Nav lang={lang}/>
<main className="relative mx-auto max-w-5xl px-5 pb-28 pt-24">{children}</main></body></html>);}
