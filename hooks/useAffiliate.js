"use client";

import { useMemo } from "react";
import affiliates from "@/config/affiliates";

/**
 * Restituisce gli affiliati validi per categoria,
 * filtrando quelli senza URL (env non configurato).
 *
 * @param {"bnb"|"flight"|"car"|"finance"|"trading"|"tickets"|"connectivity"} category
 * @returns {{ name: string, url: string, valid: boolean }[]}
 */
export default function useAffiliate(category) {
  return useMemo(() => {
    let key = null;

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
      case "trading":
        key = "extra";
        break;
      default:
        key = null;
    }

    if (!key || !affiliates[key]) return [];

    return affiliates[key]
      .map((a) => ({
        ...a,
        valid: Boolean(a.url && a.url.startsWith("http")),
      }))
      .filter((a) => a.valid);
  }, [category]);
}
