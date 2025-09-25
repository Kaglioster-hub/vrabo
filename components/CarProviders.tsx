"use client";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";

type CarProvider = { key:string; name:string; site:string; desc?:string; logo?:string };
const CAR: CarProvider[] = [
  { key:"RENTALCARS",     name:"Rentalcars",     site:"https://www.rentalcars.com/",     desc:"confronta le principali compagnie" },
  { key:"DISCOVERCARS",   name:"DiscoverCars",   site:"https://www.discovercars.com/",   desc:"offerte globali" },
  { key:"QEEQ",           name:"QEEQ",           site:"https://www.qeeq.com/",           desc:"prezzi competitivi" },
  { key:"ECONOMYBOOKINGS",name:"EconomyBookings",site:"https://www.economybookings.com/",desc:"ampia copertura" },
  { key:"AUTOEUROPE",     name:"AutoEurope",     site:"https://www.autoeurope.eu/",      desc:"servizio clienti top" },
  { key:"HERTZ",          name:"Hertz",          site:"https://www.hertz.com/",          desc:"rete mondiale" },
  { key:"AVIS",           name:"Avis",           site:"https://www.avis.com/",           desc:"offerte weekend" },
  { key:"EUROPCAR",       name:"Europcar",       site:"https://www.europcar.com/",       desc:"diffusa in EU" },
];

export default function CarProviders({ city, pickup, dropoff }:{
  city?: string; pickup?: string; dropoff?: string;
}) {
  const ready = !!(city && pickup && dropoff);
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CAR.map(p=>{
        const src = bestLogoFor(p.site, p.logo);
        const href = `/api/out?mode=car&prov=${p.key}&city=${encodeURIComponent(city||"")}&pickup=${pickup||""}&dropoff=${dropoff||""}`;
        return (
          <div key={p.key} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={src} alt={p.name} className="h-8 w-8 rounded" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = fallbackLogo(p.site); }}/>
              <div className="font-semibold">{p.name}</div>
            </div>
            {p.desc && <div className="text-sm text-white/70">{p.desc}</div>}
            <div className="mt-2">
              <a className={"btn "+(ready?"btn-primary":"")} href={href} onClick={(e)=>{ if(!ready) e.preventDefault(); }}>
                {ready ? "Cerca auto" : "Inserisci destinazione e date"}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
