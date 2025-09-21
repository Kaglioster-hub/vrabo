export const dynamic = "force-dynamic";
export default function VoliPage() {
  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-3">Voli</h1>
      <p className="muted mb-6">Confronta e risparmia.</p>
      <div className="flex gap-3">
        <a href="/api/go?to=trip_flights&type=partner" className="btn btn-cta">Vai al partner</a>
        <a href="/api/go?to=amazon&type=partner&q=valigie" className="btn btn-light">Consigli correlati</a>
      </div>
    </main>
  );
}

