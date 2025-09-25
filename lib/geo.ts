export type City = { city:string; country:string };
export type Airport = { city:string; country:string; name:string; code:string };

export const CITIES: City[] = [
  { city:"Roma", country:"Italia" }, { city:"Milano", country:"Italia" }, { city:"Napoli", country:"Italia" },
  { city:"Torino", country:"Italia" }, { city:"Bologna", country:"Italia" }, { city:"Firenze", country:"Italia" },
  { city:"Parigi", country:"Francia" }, { city:"Londra", country:"Regno Unito" },
  { city:"Barcellona", country:"Spagna" }, { city:"Madrid", country:"Spagna" }
];

export const AIRPORTS: Airport[] = [
  { city:"Roma",   country:"Italia", name:"Fiumicino", code:"FCO" },
  { city:"Roma",   country:"Italia", name:"Ciampino",  code:"CIA" },
  { city:"Milano", country:"Italia", name:"Malpensa",  code:"MXP" },
  { city:"Milano", country:"Italia", name:"Linate",    code:"LIN" },
  { city:"Napoli", country:"Italia", name:"Capodichino", code:"NAP" },
  { city:"Torino", country:"Italia", name:"Caselle", code:"TRN" },
  { city:"Bologna", country:"Italia", name:"Guglielmo Marconi", code:"BLQ" },
  { city:"Firenze", country:"Italia", name:"Amerigo Vespucci", code:"FLR" },
  { city:"Londra", country:"UK", name:"Heathrow", code:"LHR" },
  { city:"Parigi", country:"Francia", name:"Charles de Gaulle", code:"CDG" },
  { city:"Barcellona", country:"Spagna", name:"El Prat", code:"BCN" },
  { city:"Madrid", country:"Spagna", name:"Barajas", code:"MAD" },
];
