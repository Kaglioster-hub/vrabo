export const dynamic = "force-dynamic";

export default function EventsPage() {
  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-3">Eventi</h1>
      <p className="muted mb-6">Confronta tour, musei e concerti.</p>
      <div className="flex gap-3">
        <a href="/api/go?to=gyg&type=partner" className="btn btn-cta">Vai al partner</a>
        <a href="/api/go?to=amazon&type=partner&q=tappi+orecchie+concerti" className="btn btn-light">
          Consigli correlati
        </a>
      </div>
    </main>
  );
}
