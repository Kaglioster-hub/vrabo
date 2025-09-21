"use client";
import { useEffect, useState } from "react";

type Site = { slug:string; title:string; url:string; logo:string; live?: boolean };

export default function SitesGridClient() {
  const [sites, setSites] = useState<Site[]>([]);
  useEffect(() => {
    fetch("/api/config/sites").then(r=>r.json()).then(setSites).catch(()=>setSites([]));
  }, []);
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {sites.filter(s => s.live).map(s => (
        <a key={s.slug} href={s.url} title={`${s.slug}.vrabo.it`} className="card hover:bg-white/10 transition">
          <div className="text-lg font-semibold">{s.title}</div>
          <p className="muted mt-2">{(s as any).description || ""}</p>
        </a>
      ))}
    </div>
  );
}
