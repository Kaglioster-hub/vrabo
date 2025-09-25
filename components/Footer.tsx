export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 py-10 text-sm">
      <div className="container-hero flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="text-white/70">
          <div className="font-semibold mb-1">VRABO</div>
          <div>© {year} — Tutti i diritti riservati.</div>
        </div>
        <div className="text-white/60 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
          <div>Contatti: <a className="underline" href="mailto:info@vrabo.it">info@vrabo.it</a></div>
          <div>PayPal: <a className="underline" href={process.env.NEXT_PUBLIC_PAYPAL_ME || "#"} target="_blank" rel="noreferrer">paypal.me/vrabo</a></div>
          <div className="col-span-2">Wallet: <span className="badge">{process.env.NEXT_PUBLIC_CRYPTO_ADDRESS || "0x..."}</span></div>
        </div>
      </div>
    </footer>
  );
}
