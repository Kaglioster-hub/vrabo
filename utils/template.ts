export function fillTemplate(tpl: string, ctx: Record<string,string|undefined>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => encodeURIComponent(ctx[k] ?? ""));
}
