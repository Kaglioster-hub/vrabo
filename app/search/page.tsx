export const dynamic = "force-dynamic";
export const revalidate = 0;
import Link from "next/link";
import { getDeals } from "@/lib/deals";
import dynamic from "next/dynamic";
const FlightProviders = dynamic(() => import("@/components/FlightProviders").then(m => m.default), { ssr: false });
const HotelProviders  = dynamic(() => import("@/components/HotelProviders").then(m => m.default), { ssr: false });
const CarProviders    = dynamic(() => import("@/components/CarProviders").then(m => m.default),  { ssr: false });
type Params = { [k: string]: string | string[] | undefined };

export default async function SearchPage({ searchParams }: { searchParams: Params }) {
  const mode   = (searchParams.mode as string) || "flight";
  const from   = (searchParams.from as string) || "";
  const to     = (searchParams.to as string) || "";
  const depart = (searchParams.depart as string) || "";
  const ret    = (searchParams.return as string) || "";
  const adults = parseInt((searchParams.adults as string) || "1");

  let grid: JSX.Element | null = null;

  if (mode === "flight") {
    const deals = await getDeals("flight");
    grid = (
      <>
        <div className="mb-4 text-white/70 text-sm">Motori di ricerca voli</div>
        <FlightProviders from={from} to={to} depart={depart} ret={ret} adults={adults} deals={deals}/>
      </>
    );
  } else if (mode === "stay") {
    const deals = await getDeals("stay");
    grid = (
      <>
        <div className="mb-4 text-white/70 text-sm">Hotel consigliati</div>
        <HotelProviders city={to} checkin={depart} checkout={ret || depart} adults={adults} deals={deals}/>
      </>
    );
  } else if (mode === "car") {
    const deals = await getDeals("car");
    grid = (
      <>
        <div className="mb-4 text-white/70 text-sm">Partner consigliati</div>
        <CarProviders city={to} pickup={depart} dropoff={ret || depart} deals={deals}/>
      </>
    );
  } else {
    grid = <div className="text-white/70">Seleziona una modalità valida.</div>;
  }

  return (
    <main className="space-y-6">
      <section className="card p-6">
        <h1 className="h1-grad">Risultati</h1>
        <p className="text-white/70 text-sm mt-1">
          {mode==="flight" && <>Rotta <b>{from}</b> → <b>{to}</b> — {depart}{ret && (" / " + ret)} · {adults} adulto/i</>}
          {mode==="stay"   && <>Destinazione <b>{to}</b> — {depart} / {ret} · {adults} adulto/i</>}
          {mode==="car"    && <>Ritiro <b>{to}</b> — {depart} / {ret}</>}
        </p>
        <div className="mt-6">{grid}</div>
        <div className="mt-8">
          <Link href="/" className="btn">← Nuova ricerca</Link>
        </div>
      </section>
    </main>
  );
}

