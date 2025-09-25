export function buildCarURL(city?:string){
  // Prefer Localrent, poi Trip Cars; param "city" opzionale per futuri deep link
  const l1 = process.env.NEXT_PUBLIC_AFF_ID_CAR2 || "";
  const l2 = process.env.NEXT_PUBLIC_AFF_ID_CAR  || "";
  return l1 || l2 || "https://www.trip.com/car-rental/";
}
