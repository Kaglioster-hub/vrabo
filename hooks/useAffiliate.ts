"use client";

import { useMemo } from "react";
import affiliates from "@/config/affiliates";

type Category =
  | "bnb"
  | "flight"
  | "car"
  | "finance"
  | "trading"
  | "tickets"
  | "connectivity"
  | "amazon"
  | "vpn"
  | "software";

type Affiliate = {
  name: string;
  url: string;
  valid?: boolean;
};

/**
 * Restituisce gli affiliati validi per categoria,
 * filtrando quelli senza URL (env non configurato).
 */
export default function useAffiliate(category: Category): Affiliate[] {
  return useMemo(() => {
    let key: keyof typeof affiliates | null = null;

    switch (category) {
      case "bnb":
        key = "hotels";
        break;
      case "flight":
        key = "flights";
        break;
      case "car":
        key = "cars";
        break;
      case "tickets":
        key = "tickets";
        break;
      case "connectivity":
        key = "connectivity";
        break;
      case "finance":
        key = "finance";
        break;
      case "trading":
        key = "trading";
        break;
      case "amazon":
      case "software":
        key = "extra"; // 👈 stanno dentro extra
        break;
      case "vpn":
        key = "vpn";
        break;
      default:
        key = null;
    }

    if (!key || !affiliates[key]) return [];

    return affiliates[key]
      .map((a) => ({
        ...a,
        valid: Boolean(a && a.url && a.url.startsWith("http")),
      }))
      .filter((a) => a.valid);
  }, [category]);
}
