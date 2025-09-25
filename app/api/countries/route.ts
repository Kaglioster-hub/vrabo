import { NextResponse } from "next/server";
export const runtime = "edge";
const COUNTRIES = [
"Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Cambodia","Cameroon","Canada","Cape Verde","Chile","China","Colombia","Costa Rica","Cote d'Ivoire","Croatia","Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lithuania","Luxembourg","Macau","Madagascar","Malaysia","Maldives","Malta","Mauritius","Mexico","Moldova","Mongolia","Montenegro","Morocco","Mozambique","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Nigeria","North Macedonia","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Zambia","Zimbabwe"
];
const norm = (s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export async function GET(req: Request){
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if(!q) return NextResponse.json({ results: COUNTRIES.slice(0,50).map(n=>({code:n.slice(0,2).toUpperCase(), name:n})) });
  const nq = norm(q);
  const results = COUNTRIES.filter(c=>norm(c).includes(nq)).slice(0,50).map(n=>({code:n.slice(0,2).toUpperCase(), name:n}));
  return NextResponse.json({ results });
}
