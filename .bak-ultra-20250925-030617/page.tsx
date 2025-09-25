import { Suspense } from "react";
import Top6 from "@/components/Top6";
import Brand from "@/components/Brand";
import HeroBackdrop from "@/components/HeroBackdrop";
import SearchHubUltra from "@/components/SearchHubUltra";

import { PARTNERS } from "@/data/partners";
import { PartnerCard } from "@/components/PartnerCard";

export default function HomePage() {
  return (
    <>
      <section className="container-hero py-8">
        <HeroBackdrop>
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center rounded-full bg-black/30 p-2 border border-white/10">
                <Brand size={40}/>
              </div>
              <h1 className="text-3xl font-extrabold mt-2">VRABO</h1>
              <p className="text-white/70 mt-1">
                Il comparatore dei comparatori. Non sceglie per te, sceglie con te.
              </p>
            </div>
            <SearchHubUltra />
          </div>
        </HeroBackdrop>
      </section>

      <Suspense fallback={<section className="section"><p className="text-white/60">Caricamento offerte…</p></section>}>
        <Top6 className="mt-6" />
      </Suspense>

      <section className="section">
        <h2 className="text-xl font-semibold mb-3">Partners VRABO</h2>
        <div className="grid-auto-fit">
          {PARTNERS.map((p) => (
            <PartnerCard
              key={p.name}
              name={p.name}
              href={p.href}
              logo={p.logo}
              tag={(p as any).tag}
            />
          ))}
        </div>
      </section>
    </>
  );
}
