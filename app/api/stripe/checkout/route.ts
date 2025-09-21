import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
export const runtime = "nodejs";

const secret = process.env.STRIPE_SECRET_KEY || "";
const stripe = secret ? new Stripe(secret, { apiVersion: "2024-06-20" }) : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) return NextResponse.json({ error: "Stripe non configurato" }, { status: 400 });
    const { amount } = await req.json().catch(()=>({}));

    const priceMap: Record<string, string | undefined> = {
      "5": process.env.STRIPE_PRICE_DONATION_5,
      "10": process.env.STRIPE_PRICE_DONATION_10,
      "25": process.env.STRIPE_PRICE_DONATION_25,
      "50": process.env.STRIPE_PRICE_DONATION_50,
    };

    if (amount && process.env.STRIPE_PAYMENT_LINK) {
      return NextResponse.json({ url: process.env.STRIPE_PAYMENT_LINK });
    }

    const chosen = priceMap[String(amount || "10")];
    if (!chosen) return NextResponse.json({ error: "Price ID non configurato" }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: chosen, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donate?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donate?canceled=1`,
      metadata: { project: "vrabo-core-total" }
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Errore Stripe" }, { status: 500 });
  }
}
