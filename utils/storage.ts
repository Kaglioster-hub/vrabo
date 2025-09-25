export function saveRecent(key: string, value: any, limit = 6) {
  try{
    const arr = JSON.parse(localStorage.getItem(key)||"[]");
    const filtered = arr.filter((x:any)=>JSON.stringify(x)!==JSON.stringify(value));
    filtered.unshift(value);
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, limit)));
  }catch{}
}
export function loadRecent<T=any>(key: string, def: T[] = []): T[] {
  try{ return JSON.parse(localStorage.getItem(key)||"[]"); }catch{ return def; }
}
