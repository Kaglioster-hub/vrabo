// config/affiliates.js
// =============================================
// 🌍 VRABO Affiliate Links Config
// - Centralizzazione link affiliati
// - Safe fallback + validation
// - Helper per accesso rapido
// =============================================

/**
 * Crea un oggetto affiliato con fallback e validazione
 * @param {string} name - Nome del partner
 * @param {string|undefined} envVar - Variabile d'ambiente (URL affiliato)
 * @returns {{ name: string, url: string, valid: boolean }}
 */
function makeAff(name, envVar) {
  if (!envVar) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`⚠️ Affiliate link mancante per: ${name}`);
    }
    return { name, url: "#", valid: false };
  }
  return { name, url: envVar, valid: true };
}

const affiliates = {
  flights: [
    makeAff("Aviasales", process.env.NEXT_PUBLIC_AFF_ID_FLIGHT),
    makeAff("Kiwi", process.env.NEXT_PUBLIC_AFF_ID_FLIGHT2),
  ],
  hotels: [
    makeAff("Booking", process.env.NEXT_PUBLIC_AFF_ID_HOTEL),
  ],
  cars: [
    makeAff("Localrent", process.env.NEXT_PUBLIC_AFF_ID_CAR),
    makeAff("Economybookings", process.env.NEXT_PUBLIC_AFF_ID_CAR2),
    makeAff("QEEQ", process.env.NEXT_PUBLIC_AFF_ID_CAR3),
    makeAff("GetRentacar", process.env.NEXT_PUBLIC_AFF_ID_CAR4),
  ],
  transfers: [
    makeAff("Kiwitaxi", process.env.NEXT_PUBLIC_AFF_ID_TRANSFER1),
    makeAff("GetTransfer", process.env.NEXT_PUBLIC_AFF_ID_TRANSFER2),
    makeAff("Intui", process.env.NEXT_PUBLIC_AFF_ID_TRANSFER3),
  ],
  bus: [
    makeAff("TPK Bus", process.env.NEXT_PUBLIC_AFF_ID_BUS),
  ],
  tickets: [
    makeAff("Tiqets", process.env.NEXT_PUBLIC_AFF_ID_TICKETS1),
    makeAff("TicketNetwork", process.env.NEXT_PUBLIC_AFF_ID_TICKETS2),
  ],
  connectivity: [
    makeAff("Yesim", process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY1),
    makeAff("Airalo", process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY2),
    makeAff("DrimSim", process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY3),
  ],
  extra: [
    makeAff("Amazon", process.env.NEXT_PUBLIC_AFF_ID_AMAZON),
    makeAff("NordVPN", process.env.NEXT_PUBLIC_AFF_ID_SOFTWARE),
  ],
};

/**
 * Ottieni affiliati per categoria
 * @param {string} category - es. "flights" | "hotels"
 */
export const getAffiliatesByCategory = (category) =>
  affiliates[category] || [];

/**
 * Ottieni tutti gli affiliati come flat array
 */
export const getAllAffiliates = () =>
  Object.values(affiliates).flat();

export default affiliates;
