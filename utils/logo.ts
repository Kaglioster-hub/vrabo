export function bestLogoFor(site: string, explicit?: string, size=64) {
  try {
    if (explicit) return explicit;
    const host = new URL(site).hostname;
    return `https://logo.clearbit.com/${host}`;
  } catch { return explicit || ""; }
}
export function fallbackLogo(site: string, size=64) {
  try {
    const host = new URL(site).hostname;
    return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${host}`;
  } catch { return ""; }
}
