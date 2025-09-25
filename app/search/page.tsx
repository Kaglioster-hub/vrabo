import Link from "next/link";
import { skyscannerLink, bookingHotelLink, kiwiLink, rentalcarsLink } from "@/utils/affiliates";
import ProviderGrid from "@/components/ProviderGrid";
import { TELCO_PROVIDERS, FINANCE_PROVIDERS } from "@/config/providers";
import { getDeals } from "@/lib/deals";

export const dynamic = "force-static";

function qs<T>(s: string | null, def: T): T { return (s as any) ?? def; }

export default async function Results({ searchParams }: { searchParams: any }) {
  const mode = qs<string>(searchParams.mode, "flight");
  const from = qs<string>(searchParams.from, "");
  const to = qs<string>(searchParams.to, "");
  const depart = qs<string>(searchParams.depart, "");
  const ret = searchParams.return as string | undefined;
  const oneWay = !!searchParams.oneway;
  const adults = parseInt(qs<string>(searchParams.adults, "1"));

  const trip = { from, to, depart, return: oneWay ? undefined : (ret || undefined), adults };
  const cityTo = to;

  let links: { name: string; href: string }[] = [];
  let grid: JSX.Element | null = null;

  if (mode === "flight") {
    links = [
      { name: "Skyscanner (voli)", href: skyscannerLink(trip) },
      { name: "Kiwi.com (voli)", href: kiwiLink(trip) },
    ];
  } else if (mode === "stay") {
    links = [
      { name: "Booking.com (hotel)", href: bookingHotelLink(cityTo, depart, ret || depart, Math.max(adults,1)) },
    ];
  } else if (mode === "car") {
    links = [
      { name: "Rentalcars (auto)", href: rentalcarsLink(cityTo, depart, ret || depart) },
    ];
  } else if (mode === "telco") {
    const deals = await getDeals("telco");
    grid = <ProviderGrid items={TELCO_PROVIDERS} deals={deals} />;
  } else if (mode === "finance") {
    const deals = await getDeals("finance");
    grid = <ProviderGrid items={FINANCE_PROVIDERS} deals={deals} />;
  }

  return (
    <main className="space-y-6">
      <section className="card p-6">
        <h1 className="h1-grad">Risultati · {mode.toUpperCase()}</h1>
        {(mode==="flight" || mode==="stay" || mode==="car") && (
          <p className="text-white/70">
            {mode==="flight" && <>Rotta: {from} → {to} · Date: {depart}{ret ? " → " + ret : ""} · Adulti: {adults}</>}
            {mode!=="flight" && <>Destinazione: {to} · Periodo: {depart}{ret ? " → " + ret : ""}</>}
          </p>
        )}

        {grid ? (
          <div className="mt-6">{grid}</div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {links.map(l => (
              <a key={l.name} href={l.href} target="_blank" className="card p-4 hover:bg-white/10">
                <div className="text-lg font-semibold">{l.name}</div>
                <div className="text-white/70 text-sm">Apri in nuova scheda</div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-6"><Link href="/" className="btn">← Modifica ricerca</Link></div>
      </section>
    </main>
  );
}
