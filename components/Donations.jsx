"use client";
import { useState, useMemo } from "react";
import QRCode from "react-qr-code";

// ======================= CONFIG DONAZIONI =======================
const PAYPAL_EMAIL = "donations@vrabo.it";
const VRABO_WALLET = "0xe77E6C411F2ee01F1cfbccCb1c418c80F1a534fe";

// Stripe Payment Link predefinito (customer chooses price)
const STRIPE_LINK_DEFAULT =
  process.env.NEXT_PUBLIC_STRIPE_LINK ||
  "https://buy.stripe.com/test_xxxxxxxxxxxxxxx";

// Opzionali: Payment link fissi per importi specifici
const STRIPE_LINKS_BY_AMOUNT = {
  // 5: "https://buy.stripe.com/test_link5euro",
  // 10: "https://buy.stripe.com/test_link10euro",
};

const METAMASK_APP_BASE = "https://metamask.app.link/send";
const CHAINS = [
  { id: 1, symbol: "ETH", name: "Ethereum" },
  { id: 137, symbol: "MATIC", name: "Polygon" },
  { id: 56, symbol: "BNB", name: "BNB Smart Chain" },
];

// Helpers
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round2 = (x) => Math.round((Number(x) || 0) * 100) / 100;

// Amount → wei string
function amountToWeiStr(amount, decimals = 18) {
  const str = String(amount ?? "0").trim();
  if (!/^\d+(\.\d+)?$/.test(str)) return "0";
  const [int, frac = ""] = str.split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  const wei =
    BigInt(int || "0") * 10n ** BigInt(decimals) + BigInt(fracPadded || "0");
  return wei.toString();
}

// ======================= COMPONENTE =======================
export default function Donations() {
  const [amount, setAmount] = useState(10); // € default
  const [chain, setChain] = useState(CHAINS[0]); // ETH
  const [copied, setCopied] = useState(false);

  const quick = [5, 10, 25, 50];

  const onQuick = (v) => setAmount(v);
  const onSlide = (e) => setAmount(round2(e.target.value));
  const onInput = (e) =>
    setAmount(
      round2(clamp(Number(String(e.target.value).slice(0, 8)), 0, 10000))
    );

  // ------- PayPal -------
  const paypalUrl = useMemo(() => {
    const p = new URL("https://www.paypal.com/donate");
    p.searchParams.set("business", PAYPAL_EMAIL);
    p.searchParams.set("currency_code", "EUR");
    if (amount > 0) p.searchParams.set("amount", String(amount));
    p.searchParams.set("item_name", "Donazione VRABO");
    return p.toString();
  }, [amount]);

  // ------- Stripe -------
  function openStripe() {
    const link = STRIPE_LINKS_BY_AMOUNT[amount] || STRIPE_LINK_DEFAULT;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  // ------- Crypto / MetaMask -------
  const weiStr = amountToWeiStr(amount);
  const eip681 = `ethereum:${VRABO_WALLET}@${chain.id}?value=${weiStr}`;
  const metamaskMobile = `${METAMASK_APP_BASE}/${VRABO_WALLET}@${chain.id}?value=${weiStr}`;

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(VRABO_WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-2">💙 Sostieni VRABO</h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        Scegli un importo o usa lo slider. Puoi donare con carta (Stripe), PayPal
        o in crypto (MetaMask / qualsiasi wallet).
      </p>

      {/* Importi rapidi */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => onQuick(q)}
            className={`px-4 py-2 rounded-full border ${
              amount === q
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            }`}
          >
            {q}€
          </button>
        ))}
      </div>

      {/* Slider + input */}
      <div className="flex items-center gap-4 justify-center mb-2">
        <input
          type="range"
          min="1"
          max="500"
          step="1"
          value={amount}
          onChange={onSlide}
          className="w-72"
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="10000"
            step="1"
            value={amount}
            onChange={onInput}
            className="w-28 px-3 py-2 rounded-lg border text-black"
          />
          <span className="text-gray-500">€</span>
        </div>
      </div>

      {/* Bottoni donazione */}
      <div className="flex flex-wrap gap-3 justify-center my-6">
        <a
          href={paypalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow"
        >
          PayPal
        </a>

        <button
          onClick={openStripe}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold shadow"
        >
          Stripe
        </button>

        {/* Selettore rete + deep-link MetaMask */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
          <select
            value={chain.id}
            onChange={(e) =>
              setChain(
                CHAINS.find((c) => c.id === Number(e.target.value)) || CHAINS[0]
              )
            }
            className="px-2 py-1 rounded-md border text-black"
          >
            {CHAINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol} · {c.name}
              </option>
            ))}
          </select>

          <a
            href={metamaskMobile}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white text-sm"
            title="Apri MetaMask mobile"
          >
            MetaMask
          </a>
          <a
            href={eip681}
            className="px-3 py-2 bg-green-700 hover:bg-green-800 rounded-md text-white text-sm"
            title="Protocollo EIP-681"
          >
            ethereum:
          </a>
        </div>
      </div>

      {/* Card Crypto: QR + copia */}
      <div className="grid sm:grid-cols-[180px_1fr] gap-4 items-center">
        <div className="bg-white p-3 rounded-xl border shadow-sm w-[180px] h-[180px] flex items-center justify-center">
          <QRCode value={VRABO_WALLET} size={150} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <code className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg break-all">
              {VRABO_WALLET}
            </code>
            <button
              onClick={copyAddr}
              className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700"
            >
              {copied ? "Copiato ✓" : "Copia"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Invia {chain.symbol} sulla rete {chain.name}. L’importo scelto ({amount}
            €) viene convertito in **wei** nel deep-link (EIP-681).
          </p>
        </div>
      </div>
    </div>
  );
}
