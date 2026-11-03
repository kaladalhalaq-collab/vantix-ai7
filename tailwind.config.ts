import type {Config} from "tailwindcss";
export default {content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],theme:{extend:{colors:{ink:"#03070D",navy:"#061321",volt:"#1688FF",cyan:"#00D9FF",violet:"#6C3BFF",gold:"#D8A93A",snow:"#F4F8FF"},fontFamily:{display:["var(--f-display)"],body:["var(--f-body)"]}}},plugins:[]} satisfies Config;
