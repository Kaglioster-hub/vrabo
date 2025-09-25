"use client";
import Link from "next/link";

export default function Header(){
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="container-hero py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="VRABO" width={28} height={28} />
          <span className="font-bold tracking-wide text-lg">VRABO</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/discover" className="btn btn-ghost btn-sm">Discover</Link>
          <Link href="/donate" className="btn btn-primary btn-sm">Dona</Link>
        </nav>
      </div>
    </header>
  );
}
