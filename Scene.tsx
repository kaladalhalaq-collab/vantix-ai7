"use client";
import {Canvas,useFrame} from "@react-three/fiber";
import {useEffect,useMemo,useRef,useState} from "react";
import * as THREE from "three";
import type {Tier} from "./Background";
function Particles({n}:{n:number}){
const ref=useRef<THREE.Points>(null);
const pos=useMemo(()=>{const a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*16;a[i*3+1]=(Math.random()-.5)*10;a[i*3+2]=(Math.random()-.5)*10;}return a;},[n]);
useFrame((s,d)=>{if(ref.current){ref.current.rotation.y+=d*.02;ref.current.position.y=Math.sin(s.clock.elapsedTime*.2)*.15;}});
return(<points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[pos,3]}/></bufferGeometry><pointsMaterial size={.035} color="#00D9FF" transparent opacity={.7} depthWrite={false} sizeAttenuation/></points>);}
function Holo({detail}:{detail:number}){
const g=useRef<THREE.Group>(null);
useFrame((_,d)=>{if(g.current){g.current.rotation.y+=d*.18;g.current.rotation.x+=d*.06;}});
return(<group ref={g} position={[2.2,.4,-1]}>
<mesh><icosahedronGeometry args={[1.5,detail]}/><meshBasicMaterial color="#1688FF" wireframe transparent opacity={.55}/></mesh>
<mesh scale={.62}><octahedronGeometry args={[1.5,0]}/><meshBasicMaterial color="#6C3BFF" wireframe transparent opacity={.8}/></mesh>
<mesh rotation={[Math.PI/2.4,0,0]}><torusGeometry args={[2.1,.008,6,96]}/><meshBasicMaterial color="#D8A93A"/></mesh></group>);}
function Waves({seg}:{seg:number}){
const lines=useRef<THREE.Line[]>([]);
const mk=(i:number)=>{const p=new Float32Array((seg+1)*3);const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(p,3));
return new THREE.Line(geo,new THREE.LineBasicMaterial({color:i%2?"#00D9FF":"#1688FF",transparent:true,opacity:.35}));};
const objs=useMemo(()=>[0,1,2].map(mk),[seg]);
useFrame(s=>{const t=s.clock.elapsedTime;objs.forEach((l,k)=>{const a=l.geometry.attributes.position as THREE.BufferAttribute;
for(let i=0;i<=seg;i++){const x=(i/seg-.5)*14;a.setXYZ(i,x,-2.3+k*.35+Math.sin(x*.6+t*(.5+k*.2))*.35+Math.sin(x*1.7-t)*.08,-2-k*.6);}a.needsUpdate=true;});});
return<>{objs.map((o,i)=><primitive key={i} object={o}/>)}</>;}
function Bars({n}:{n:number}){/* decorative, not market data */
const g=useRef<THREE.Group>(null);
useFrame(s=>{g.current?.children.forEach((m,i)=>{m.scale.y=.4+Math.abs(Math.sin(s.clock.elapsedTime*.5+i*.7))*1.2;});});
return(<group ref={g} position={[-3.6,-1.2,-2]}>{Array.from({length:n},(_,i)=><mesh key={i} position={[i*.28,0,0]}><boxGeometry args={[.08,1,.08]}/><meshBasicMaterial color={i%3?"#1688FF":"#D8A93A"} transparent opacity={.45}/></mesh>)}</group>);}
export default function Scene({tier}:{tier:Tier}){
const low=tier==="low";
const [vis,setVis]=useState(true);
useEffect(()=>{const f=()=>setVis(!document.hidden);document.addEventListener("visibilitychange",f);return()=>document.removeEventListener("visibilitychange",f);},[]);
return(<Canvas frameloop={vis?"always":"never"} dpr={low?[1,1.25]:[1,2]} gl={{antialias:!low,alpha:true,powerPreference:low?"low-power":"high-performance"}} camera={{position:[0,0,6],fov:55}} style={{width:"100%",height:"100%"}}>
<Particles n={low?500:2200}/><Holo detail={low?1:2}/><Waves seg={low?48:128}/>{!low&&<Bars n={14}/>}</Canvas>);}
