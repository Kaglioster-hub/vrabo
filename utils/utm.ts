export function withUTM(url: string) {
  const u = new URL(url);
  u.searchParams.set("utm_source", process.env.AFF_SOURCE || "vrabo");
  u.searchParams.set("utm_medium", process.env.AFF_MEDIUM || "affiliate");
  u.searchParams.set("utm_campaign", process.env.AFF_CAMPAIGN || "global");
  return u.toString();
}
export function withRef(url: string, key: string, param?: string) {
  const env = `NEXT_PUBLIC_AFF_${key.toUpperCase()}`;
  const id = (process.env as any)[env] as string | undefined;
  if (!id || !param) return url;
  const u = new URL(url);
  u.searchParams.set(param, id);
  return u.toString();
}
