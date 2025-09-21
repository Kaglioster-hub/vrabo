"use client";
import { useEffect, useState } from "react";
export default function Consent() {
  const [show, setShow] = useState(false);
  useEffect(()=>{
    const v = localStorage.getItem("consent");
    if (!v) setShow(true); else if (v==="all") loadAnalytics();
  },[]);
  function acceptAll(){ localStorage.setItem("consent","all"); loadAnalytics(); setShow(false); }
  function essential(){ localStorage.setItem("consent","essential"); setShow(false); }
  function loadAnalytics(){
    const d = document;
    if (document.getElementById("plausible")) return;
    const s = d.createElement("script");
    s.id="plausible"; s.defer=true; s.setAttribute("data-domain", process.env.PLAUSIBLE_DOMAIN || "vrabo.it"); s.src="https://plausible.io/js/script.js";
    d.head.appendChild(s);
  }
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(720px,92vw)] rounded-2xl border border-white/10 bg-black/70 backdrop-blur p-4">
      <p className="text-sm">Usiamo cookie tecnici e, con il tuo consenso, analytics anonimi per migliorare il servizio.</p>
      <div className="mt-3 flex gap-2 justify-end">
        <button onClick={essential} className="btn btn-light">Solo essenziali</button>
        <button onClick={acceptAll} className="btn btn-cta">Accetta tutto</button>
      </div>
    </div>
  );
}
