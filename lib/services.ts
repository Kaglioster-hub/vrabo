import { affiliates } from "@/config/affiliates";

/** Mappa id -> URL affiliato (case-insensitive, alias inclusi). */
export function urlForService(id: string): string {
  const key = (id || "").toLowerCase();
  switch (key) {
    // Crypto
    case "binance": case "bin": return affiliates.binance.url;
    case "kucoin":  case "kuc": return affiliates.kucoin.url;
    case "bybit":               return affiliates.bybit.url;
    case "okx":                 return affiliates.okx.url;
    // Finanza
    case "etoro":               return affiliates.etoro.url;
    case "revolut":             return affiliates.revolut.url;
    case "wise":                return affiliates.wise.url;
    case "n26":                 return affiliates.n26.url;
    // Telefonia
    case "vodafone": case "vodafone-esim": return affiliates.vodafoneEsim.url;
    case "airalo":                          return affiliates.airalo.url;
    // Assicurazioni
    case "travel-ins": case "assicurazione-viaggio": return affiliates.travelIns.url;
    default: return "#";
  }
}
