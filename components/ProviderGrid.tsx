"use client";
import { providerLink } from "@/utils/affiliates";
import { type Provider } from "@/config/providers";
import { type Deal } from "@/config/deals";

export default function ProviderGrid({ items, deals }: { items: Provider[]; deals: Record<string, Deal>; }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(p => {
        const d = deals[p.key] || {};
        const href = d.url || providerLink(p.site, p.key, p.referralParam, p.extraParams);
        return (
          <div key={p.key} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={p.logo} alt={p.name} className="h-8 w-8 rounded" />
              <div className="font-semibold">{p.name}</div>
            </div>
            {p.desc && <div className="text-sm text-white/70">{p.desc}</div>}
            {(d.code || d.note) && (
              <div className="text-sm">
                {d.code && <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 mr-2">Coupon: <b className="ml-1">{d.code}</b></span>}
                {d.note && <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10">{d.note}</span>}
              </div>
            )}
            {d.expires && <div className="text-xs text-white/60">Scade: {d.expires}</div>}
            <div className="mt-2">
              <a className="btn btn-primary" href={href} target="_blank" rel="nofollow">Vai all&apos;offerta</a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
