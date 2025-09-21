import fs from "node:fs";
import path from "node:path";

function need(k: string) {
  const v = process.env[k];
  return { key: k, ok: !!(v && String(v).trim()) };
}

export const dynamic = "force-dynamic";

export default async function Admin({ searchParams }: any) {
  const token = (searchParams?.token || "");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return (<main className="container mx-auto px-6 py-12"><h1 className="text-2xl font-bold">401</h1><p>Unauthorized</p></main>);
  }

  const envMust = [
    "NEXT_PUBLIC_BASE_URL",
    "NEXT_PUBLIC_PAYPAL_EMAIL",
    "NEXT_PUBLIC_PAYPAL_ME",
    "NEXT_PUBLIC_CRYPTO_ADDRESS",
    "NEXT_PUBLIC_SUBSITES_JSON",
    "NEXT_PUBLIC_PARTNERS_JSON",
  ].map(need);

  const logosDir = path.join(process.cwd(), "public", "logos");
  const missingLogos: string[] = [];
  try {
    const partners = JSON.parse(fs.readFileSync(path.join(process.cwd(),"public","config","partners.json"),"utf-8"));
    for (const p of partners) {
      const f = path.join(logosDir, path.basename(p.logo));
      if (!fs.existsSync(f)) missingLogos.push(p.logo);
    }
  } catch {}

  return (
    <main className="container mx-auto px-6 py-12 space-y-8">
      <h1 className="text-3xl font-bold">VRABO — Admin Health</h1>
      <section>
        <h2 className="text-xl font-semibold mb-2">ENV critici</h2>
        <ul className="space-y-1">{envMust.map(e=>(
          <li key={e.key} className={`text-sm ${e.ok?'text-emerald-400':'text-amber-300'}`}>{e.ok?'OK':'MISSING'} — {e.key}</li>
        ))}</ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Loghi partner mancanti</h2>
        {missingLogos.length? <ul className="list-disc pl-6 text-sm">{missingLogos.map(x=>(<li key={x}>{x}</li>))}</ul> : <p className="text-sm text-emerald-400">Tutti presenti</p>}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Utility</h2>
        <a className="btn btn-cta" href="/api/health" target="_blank">/api/health</a>
      </section>
    </main>
  );
}
