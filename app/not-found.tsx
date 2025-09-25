import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-3">Pagina non trovata</h1>
      <p className="text-white/70 mb-6">La risorsa richiesta non esiste o è stata spostata.</p>
      <Link href="/" className="btn btn-primary btn-sm">Torna alla Home</Link>
    </div>
  );
}
