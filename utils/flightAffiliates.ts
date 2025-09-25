import { FLIGHT_PROVIDERS, type FlightProvider } from "@/config/flightProviders";
import { withUTM, withRef } from "@/utils/utm";
import { fillTemplate } from "@/utils/template";
const env = (k:string)=> (process.env as any)[k] as string|undefined;
function seg(d?:string){ return (d && d !== "undefined") ? d : ""; } // handle oneway
export function flightLink(p: FlightProvider, from?: string, to?: string, depart?: string, ret?: string, adults?: number) {
  let url = p.site;
  const aff = p.affiliateEnv ? env(p.affiliateEnv) : undefined;
  if (p.searchTemplate && from && to && depart) {
    url = fillTemplate(p.searchTemplate, { from, to, depart, return: seg(ret) || depart, adults: String(adults||1), aff });
  }
  if (p.referralParam && aff) url = withRef(url, p.key, p.referralParam);
  return withUTM(url);
}
export { FLIGHT_PROVIDERS };
