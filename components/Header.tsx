"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [theme, setTheme] = useState("dark");
  const [locale, setLocale] = useState("it");
  useEffect(()=>{
    const t = localStorage.getItem("theme") || "dark";
    setTheme(t); document.documentElement.classList.toggle("dark", t==="dark");
    const seg = (globalThis.location?.pathname || "/").split("/")[1] || "it";
    setLocale(seg);
  },[]);
  function toggleTheme(){
    const t = theme==="dark" ? "light" : "dark";
    setTheme(t); localStorage.setItem("theme", t);
    document.documentElement.classList.toggle("dark", t==="dark");
  }
  const LOCALES = (process.env.NEXT_PUBLIC_LOCALES || "it,en").split(",");
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-6 py-3 flex items-center gap-4 justify-between">
        <Link href={`/${locale}`} className="font-bold text-lg">VRABO</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/services/flights">Voli</Link>
          <Link href="/services/hotels">Hotel</Link>
          <Link href="/services/cars">Auto</Link>
          <Link href="/services/trains">Treni</Link>
          <Link href="/services/events">Eventi</Link>
          <Link href="/services/connectivity">eSIM</Link>
          <Link href="/services/tickets">Biglietti</Link>
          <Link href="/services/shopping">Shopping</Link>
          <Link href="/donate" className="btn btn-cta !px-3 !py-1.5 !rounded-lg">Dona</Link>
          <button onClick={toggleTheme} className="text-xs border border-white/20 rounded-lg px-2 py-1">{theme==="dark"?"🌙":"☀️"}</button>
          <div className="hidden sm:flex items-center gap-1">
            {LOCALES.map(l => <Link key={l} href={`/${l}`} className={`text-xs px-2 py-1 rounded ${l===locale?'bg-white text-black':'border border-white/20'}`}>{l.toUpperCase()}</Link>)}
          </div>
        </nav>
      </div>
    </header>
  );
}
