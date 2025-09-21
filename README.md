# VRABO Core — SUPER SUPREME TOTAL
Generated: 2025-09-21T18:19:15.893083Z

## Quick start
```bash
cd vrabo-core-total
npm i
npm run build
npm run start
```

## Deploy (Vercel)
```powershell
vercel link --yes --scope "kaglioster-hub's projects"
# Add ENV (repeat for each key you fill)
vercel env add NEXT_PUBLIC_BASE_URL production
vercel env add NEXT_PUBLIC_PAYPAL_EMAIL production
vercel env add NEXT_PUBLIC_PAYPAL_ME production
vercel env add NEXT_PUBLIC_CRYPTO_ADDRESS production
vercel env add NEXT_PUBLIC_SUBSITES_JSON production
vercel env add NEXT_PUBLIC_PARTNERS_JSON production
vercel env add NEXT_PUBLIC_NAV_JSON production
vercel env add NEXT_PUBLIC_ADMIN_WALLET production
vercel env add ADMIN_TOKEN production
# Stripe (if enabled)
vercel env add STRIPE_PUBLIC_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PRICE_DONATION_5 production
vercel env add STRIPE_PRICE_DONATION_10 production
vercel env add STRIPE_PRICE_DONATION_25 production
vercel env add STRIPE_PRICE_DONATION_50 production
vercel env add STRIPE_PAYMENT_LINK production
vercel --prod --yes --scope "kaglioster-hub's projects"
```

## What you MUST fill
- Affiliate URLs you already have (NEXT_PUBLIC_AFF_ID_*) — copy from your current .env.local
- Optional brand IDs for standard builders (AFF_*)
- Stripe keys (or a Payment Link)
- ADMIN_TOKEN (GUID) on Vercel
- Real logos in `public/logos/` with names used in `public/config/*.json`
