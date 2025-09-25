import Link from "next/link";
import { skyscannerLink, bookingHotelLink, kiwiLink, rentalcarsLink } from "@/utils/affiliates";

export const dynamic = "force-static";

function qs<T>(s: string | null, def: T): T {
  return (s as any) ?? def;
}

export default function Results({ searchParams }: { searchParams: any }) {
  const from = qs<string>(searchParams.from, "");
  const to = qs<string>(searchParams.to, "");
  const depart = qs<string>(searchParams.depart, "");
  const ret = searchParams.return as string | undefined;
  const adults = parseInt(qs<string>(searchParams.adults, "1"));

  const trip = { from, to, depart, return: ret || undefined, adults };

  const cityTo = to; // approx; for hotel/car links we use destination code/name

  const links = [
    { name: "Skyscanner (voli)", href: skyscannerLink(trip) },
    { name: "Kiwi.com (voli)", href: kiwiLink(trip) },
    { name: "Booking.com (hotel)", href: bookingHotelLink(cityTo, depart, ret || depart, Math.max(adults,1)) },
    { name: "Rentalcars (auto)", href: rentalcarsLink(cityTo, depart, ret || depart) },
  ];

  return (
    <main className="space-y-6">
      <section className="card p-6">
        <h1 className="h1-grad">Risultati · {from} → {to}</h1>
        <p className="text-white/70">Date: {depart}{ret ? " → " + ret : ""} · Adulti: {adults}</p>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {links.map(l => (
            <a key={l.name} href={l.href} target="_blank" className="card p-4 hover:bg-white/10">
              <div className="text-lg font-semibold">{l.name}</div>
              <div className="text-white/70 text-sm">Apri in nuova scheda</div>
            </a>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/" className="btn">← Modifica ricerca</Link>
        </div>
      </section>
    </main>
  );
}
