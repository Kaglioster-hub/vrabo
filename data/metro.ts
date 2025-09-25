export type Metro = { code:string; name:string; country:string; airports:string[] };
export const METROS: Metro[] = [
  { code:"ROM", name:"Rome", country:"Italy", airports:["FCO","CIA"] },
  { code:"LON", name:"London", country:"United Kingdom", airports:["LHR","LGW","LTN","STN","LCY","SEN"] },
  { code:"NYC", name:"New York", country:"United States", airports:["JFK","EWR","LGA"] },
  { code:"PAR", name:"Paris", country:"France", airports:["CDG","ORY","BVA"] },
  { code:"MIL", name:"Milan", country:"Italy", airports:["MXP","LIN","BGY"] },
  { code:"CHI", name:"Chicago", country:"United States", airports:["ORD","MDW"] },
  { code:"WAS", name:"Washington", country:"United States", airports:["IAD","DCA","BWI"] },
  { code:"TYO", name:"Tokyo", country:"Japan", airports:["HND","NRT"] },
  { code:"SAO", name:"Sao Paulo", country:"Brazil", airports:["GRU","CGH","VCP"] },
  { code:"RIO", name:"Rio de Janeiro", country:"Brazil", airports:["GIG","SDU"] },
  { code:"YTO", name:"Toronto", country:"Canada", airports:["YYZ","YTZ","YHM"] },
  { code:"YMQ", name:"Montreal", country:"Canada", airports:["YUL","YHU"] },
  { code:"SEL", name:"Seoul", country:"South Korea", airports:["ICN","GMP"] },
  { code:"BUE", name:"Buenos Aires", country:"Argentina", airports:["EZE","AEP"] },
  { code:"MOW", name:"Moscow", country:"Russia", airports:["SVO","DME","VKO"] },
  { code:"STO", name:"Stockholm", country:"Sweden", airports:["ARN","BMA","NYO","VST"] },
];
export const METRO_CODES = new Set(METROS.map(m=>m.code));
export function findMetroByCityName(q:string){
  const s = q.trim().toLowerCase();
  return METROS.find(m => m.name.toLowerCase().startsWith(s));
}
export function getMetro(code:string){ return METROS.find(m => m.code.toUpperCase()===code.toUpperCase()); }
