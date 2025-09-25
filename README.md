# VRABO Core — Enterprise Edition

Stack: Next.js 15 (App Router, TS) + Tailwind + i18next + Fuse.js + next-seo + Vercel Analytics.

## Setup
```bash
pnpm i
cp .env.example .env
# (opzionale) imposta NEXT_PUBLIC_PAYPAL_ME, NEXT_PUBLIC_CRYPTO_ADDRESS
pnpm dev
```

## Build & Deploy
```bash
pnpm build
# Vercel:
vercel --prod
```

### Video background
Sostituisci `public/bg.mp4` col tuo video (prato dall'alto). Il componente gestisce autoplay/muted/loop e overlay per leggibilità.

### Logo
Metti il tuo logo in `public/logo.png` (già referenziato da Header).

### Search
Indice fuzzy con Fuse.js alimentato da `data/sources.ts`.
Aggiungi/edita sorgenti per far apparire risultati, badge e CTA affiliati.

### I18n
Stringhe base in `locales/it` e `locales/en`. Auto‑detect lingua browser.
