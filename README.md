# VRABO – Comparator of Comparators (Supreme Edition)

Production-ready Next.js 15 app for vrabo.it with:
- Worldwide airport search (Edge API loading Algolia Airports dataset; fallback sample included).
- Polished Tailwind UI (Aero Supreme Gold theme), responsive and fast.
- Affiliate deeplinks builder for Skyscanner, Kiwi, Booking, Rentalcars (configure your IDs in `.env`).
- Legal page & transparent disclosures.
- Vercel-ready.

## Run locally
```bash
pnpm i
pnpm dev
```

## Deploy
Connect the repo to Vercel and set environment variables from `.env.example`.
Primary domain: `vrabo.it`

## ENV
Copy `.env.example` to `.env` or set them in Vercel dashboard.

## Notes
- The Airports dataset is loaded on-demand from `NEXT_PUBLIC_AIRPORTS_DATA_URL` and cached at the edge for 24h.
- All affiliate links must comply with partners' terms. Replace placeholders with your real codes/IDs.
