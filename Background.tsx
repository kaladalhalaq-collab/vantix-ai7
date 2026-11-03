"use client";
import dynamic from "next/dynamic";
import {useEffect,useState} from "react";
import {motion,useScroll,useTransform} from "framer-motion";
const Scene=dynamic(()=>import("./Scene"),{ssr:false});
export type Tier="off"|"low"|"high";
function detect():Tier{
if(typeof window==="undefined")return"off";
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return"off";
try{const c=document.createElement("canvas");if(!(c.getContext("webgl2")||c.getContext("webgl")))return"off";}catch{return"off";}
const mobile=matchMedia("(pointer: coarse)").matches||innerWidth<768;
const weak=(navigator.hardwareConcurrency||4)<=4||((navigator as any).deviceMemory??4)<=2;
return mobile||weak?"low":"high";}
export default function Background(){
const [tier,setTier]=useState<Tier>("off");
const {scrollYProgress}=useScroll();
const y=useTransform(scrollYProgress,[0,1],["0%","-6%"]);
useEffect(()=>{
const idle=(window as any).requestIdleCallback||((f:any)=>setTimeout(f,400));
idle(()=>setTier(detect()));},[]);
if(tier==="off")return null;
return(<motion.div aria-hidden style={{y}} className="pointer-events-none fixed inset-0 -z-10 h-[112%]"><Scene tier={tier}/></motion.div>);}
