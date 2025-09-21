"use client";
import { useState } from "react";
export default function DonatePage() {
  const paypalMe = process.env.NEXT_PUBLIC_PAYPAL_ME!;
  const paypalEmail = process.env.NEXT_PUBLIC_PAYPAL_EMAIL!;
  const wallet = process.env.NEXT_PUBLIC_ADMIN_WALLET!;
  const [amt, setAmt] = useState(10);
  async function onStripe() {
    const r = await fetch("/api/stripe/checkout", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ amount: amt }) });
    const j = await r.json();
    if (j.url) location.href = j.url; else alert(j.error || "Stripe non configurato");
  }
  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Sostieni VRABO</h1>
      <p className="muted mb-6">Il servizio è gratuito. Se ti è utile, <strong>offrici un caffè</strong> ☕️.</p>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card"><h2 className="text-xl font-semibold mb-3">PayPal</h2>
          <a className="btn btn-cta" href={paypalMe || `https://www.paypal.com/donate?business=${encodeURIComponent(paypalEmail)}`} target="_blank">Dona con PayPal</a>
          <p className="text-xs text-white/60 mt-3">PayPal: {paypalEmail}</p></div>
        <div className="card"><h2 className="text-xl font-semibold mb-3">Carta (Stripe)</h2>
          <div className="flex items-center gap-2 mb-3">{[5,10,25,50].map(v=>(
            <button key={v} onClick={()=>setAmt(v)} className={`px-3 py-2 rounded-lg border ${amt===v?'bg-white text-black':'border-white/20 hover:bg-white/10'}`}>{v} €</button>
          ))}</div>
          <button onClick={onStripe} className="btn btn-cta">Paga con Carta</button>
          <p className="text-xs text-white/60 mt-2">Se Stripe non è configurato, apparirà un messaggio.</p></div>
      </div>
      <div className="mt-8 card"><h2 className="text-xl font-semibold mb-3">Crypto (creator wallet)</h2>
        <p className="text-sm text-white/80">Address: <span className="font-mono">{wallet}</span></p></div>
    </main>
  );
}
