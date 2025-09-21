"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

type Partner = { name:string; logo:string; url:string; affKey?:string };
type Site = { slug:string; title:string; url:string; logo:string; live?: boolean };

export default function FooterClient() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    fetch("/api/config/partners").then(r => r.json()).then(setPartners).catch(()=>setPartners([]));
    fetch("/api/config/sites").then(r => r.json()).then(setSites).catch(()=>setSites([]));
  }, []);

  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="container mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-lg font-semibold mb-4">Sottodomini</h3>
          <div className="flex flex-wrap gap-4">
            {sites.map(s => (
              <a key={s.slug} href={s.url} target="_blank" rel="noreferrer"
                 title={`${s.slug}.vrabo.it`}
                 className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition">
                <Image src={s.logo} alt={s.title} width={28} height={28} className="rounded-md" />
                <span className="text-sm">{s.title}</span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Partners</h3>
          <div className="flex flex-wrap gap-4">
            {partners.map(p => (
              <a key={p.name}
                 href={`/api/go?to=${encodeURIComponent(p.affKey || p.url)}&type=partner`}
                 title={p.name}
                 className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition">
                <Image src={p.logo} alt={p.name} width={28} height={28} className="rounded-md" />
                <span className="text-sm">{p.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="py-6 text-center text-white/60 text-sm">
        © {new Date().getFullYear()} VRABO — Servizio gratuito. <a className="underline" href="/donate">Sostienici</a>.
      </div>
    </footer>
  );
}
