import { getMetro, METRO_CODES } from "@/data/metro";
export function isMetro(code?:string){ return !!(code && METRO_CODES.has(code.toUpperCase())); }
export function expandIfMetro(code?:string){ 
  if(!code) return { code:"", airports:[] as string[] };
  const m = getMetro(code);
  return m ? { code:m.code, airports:m.airports } : { code, airports:[] as string[] };
}
