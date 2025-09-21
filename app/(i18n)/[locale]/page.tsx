import Link from "next/link";

async function getJson<T>(path: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${base}${path}`, { cache: "force-cache" });
  return res.json();
}

export default async function Home() {
  const sites = await getJson<any[]>(process.env.NEXT_PUBLIC_SUBSITES_JSON!);
  const services = [
    { key: "flights",  title: "Voli",        to: "trip_flights",  desc:"Confronta i prezzi volo" },
    { key: "hotels",   title: "Hotel",       to: "trip_hotels",   desc:"Trova l’alloggio perfetto" },
    { key: "cars",     title: "Auto",        to: "trip_cars",     desc:"Noleggio al miglior prezzo" },
    { key: "trains",   title: "Treni",       to: "trainline",     desc:"Biglietti treno veloci" },
    { key: "events",   title: "Eventi",      to: "gyg",           desc:"Tour, musei e concerti" },
    { key: "connectivity", title: "eSIM",    to: "yesim",         desc:"Internet in viaggio" },
    { key: "shopping", title: "Shopping",    to: "amazon",        desc:"Offerte e idee" },
  ];
  return (
    <main className="container mx-auto px-6 py-12 space-y-12">
      <section>
        <h1 className="text-4xl font-bold mb-4">VRABO — Comparatore dei comparatori</h1>
        <p className="muted">Non sceglie per te: <strong>sceglie con te</strong>.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Servizi</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(s => (
            <div key={s.key} className="card">
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="muted mb-4">{s.desc}</p>
              <div className="flex items-center gap-2">
                <Link href={`/services/${s.key}`} className="btn btn-light">Pagina dedicata</Link>
                <a href={`/api/go?to=${s.to}&type=partner`} className="btn btn-cta">Confronta</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Sottodomini</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sites.filter(s=>s.live).map(s => (
            <a key={s.slug} href={s.url} title={`${s.slug}.vrabo.it`} className="card hover:bg-white/10 transition">
              <div className="text-lg font-semibold">{s.title}</div>
              <p className="muted mt-2">{s.description || ""}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
