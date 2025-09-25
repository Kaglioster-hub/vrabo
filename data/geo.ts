export type City = { id:string; label:string; country:string; aliases?:string[] };
export type Airport = { code:string; city:string; name:string; aliases?:string[] };

export const cities: City[] = [
  { id:"rome",   label:"Roma",    country:"Italia", aliases:["rome"] },
  { id:"milan",  label:"Milano",  country:"Italia", aliases:["milan"] },
  { id:"naples", label:"Napoli",  country:"Italia", aliases:["naples"] },
  { id:"turin",  label:"Torino",  country:"Italia", aliases:["turin"] },
  { id:"bologna",label:"Bologna", country:"Italia" },
  { id:"florence",label:"Firenze",country:"Italia", aliases:["florence"] },
  { id:"venice", label:"Venezia", country:"Italia", aliases:["venice"] },
  { id:"pisa",   label:"Pisa",    country:"Italia" },
  { id:"bari",   label:"Bari",    country:"Italia" },
  { id:"palermo",label:"Palermo", country:"Italia" },
  { id:"catania",label:"Catania", country:"Italia" },
  { id:"bergamo",label:"Bergamo", country:"Italia" },
  { id:"verona", label:"Verona",  country:"Italia" },
  { id:"genova", label:"Genova",  country:"Italia", aliases:["genoa"] }
];

export const airports: Airport[] = [
  { code:"FCO", city:"Roma",   name:"Fiumicino — Leonardo da Vinci", aliases:["fiumicino","roma fiumicino"] },
  { code:"CIA", city:"Roma",   name:"Ciampino — G.B. Pastine",       aliases:["ciampino","roma ciampino"] },
  { code:"LIN", city:"Milano", name:"Linate",                         aliases:["linate"] },
  { code:"MXP", city:"Milano", name:"Malpensa",                       aliases:["malpensa"] },
  { code:"BGY", city:"Bergamo",name:"Orio al Serio",                  aliases:["bergamo","orio"] },
  { code:"TRN", city:"Torino", name:"Caselle",                        aliases:["caselle"] },
  { code:"BLQ", city:"Bologna",name:"Guglielmo Marconi" },
  { code:"FLR", city:"Firenze",name:"Amerigo Vespucci",               aliases:["peretola"] },
  { code:"VCE", city:"Venezia",name:"Marco Polo" },
  { code:"NAP", city:"Napoli", name:"Capodichino" },
  { code:"PSA", city:"Pisa",   name:"Galileo Galilei" },
  { code:"PMO", city:"Palermo",name:"Falcone e Borsellino",           aliases:["punta raisi"] },
  { code:"CTA", city:"Catania",name:"Fontanarossa" },
  { code:"BRI", city:"Bari",   name:"Karol Wojtyła" }
];

// util per match robusto
export function matchQuery(q:string, hay:string){
  const n = (s:string)=>s.normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase();
  return n(hay).includes(n(q));
}
