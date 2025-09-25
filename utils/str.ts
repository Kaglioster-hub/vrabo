export const pad2 = (n:number)=> String(n).padStart(2,"0");
export const ymd = (d:string)=> d; // d è già YYYY-MM-DD dalla UI
export const yymmdd = (d:string)=> { const [Y,M,D]=d.split("-"); return `${Y.slice(2)}${M}${D}`; };
