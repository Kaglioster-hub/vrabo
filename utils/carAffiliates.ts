import { CAR_PROVIDERS, type CarProvider } from "@/config/carProviders";
import { withUTM, withRef } from "@/utils/utm";
import { fillTemplate } from "@/utils/template";

const env = (k:string)=> (process.env as any)[k] as string|undefined;

export function carLink(p: CarProvider, city?: string, pickup?: string, dropoff?: string) {
  let url = p.site;
  const aff = p.affiliateEnv ? env(p.affiliateEnv) : undefined;

  if (p.searchTemplate && city && pickup && dropoff) {
    url = fillTemplate(p.searchTemplate, { city, pickup, dropoff, aff });
  }
  if (p.referralParam && aff) {
    url = withRef(url, p.key, p.referralParam);
  }
  url = withUTM(url);
  return url;
}

export { CAR_PROVIDERS };
