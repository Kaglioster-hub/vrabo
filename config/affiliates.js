// config/affiliates.js
// =============================================
// 🌍 VRABO Affiliate Links Config
// - Ogni tab corrisponde ad una categoria
// - Centralizzazione variabili ENV
// - Validazione + fallback sicuro
// =============================================

function makeAff(name, envVar) {
  if (!envVar) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`⚠️ Affiliate link mancante per: ${name}`);
    }
    return null;
  }
  return { name, url: envVar, valid: true };
}

const affiliates = {
  // === HOTEL / BnB ===
  hotels: [
    makeAff("Trip.com Hotels", process.env.NEXT_PUBLIC_AFF_ID_HOTEL),
    makeAff("Airbnb", process.env.NEXT_PUBLIC_AFF_ID_BNB),
  ],

  // === VOLI ===
  flights: [
    makeAff("Trip.com Flights", process.env.NEXT_PUBLIC_AFF_ID_FLIGHT),
    makeAff("Kiwi", process.env.NEXT_PUBLIC_AFF_ID_FLIGHT2),
    makeAff("Skyscanner", process.env.NEXT_PUBLIC_AFF_ID_FLIGHT3),
  ],

  // === AUTO ===
  cars: [
    makeAff("Trip.com Cars", process.env.NEXT_PUBLIC_AFF_ID_CAR),
    makeAff("Economybookings", process.env.NEXT_PUBLIC_AFF_ID_CAR2),
    makeAff("QEEQ", process.env.NEXT_PUBLIC_AFF_ID_CAR3),
    makeAff("GetRentacar", process.env.NEXT_PUBLIC_AFF_ID_CAR4),
    makeAff("Rentalcars", process.env.NEXT_PUBLIC_AFF_ID_CAR5),
  ],

  // === FINANZA ===
  finance: [
    makeAff("Revolut", process.env.NEXT_PUBLIC_AFF_ID_FINANCE1),
    makeAff("Wise", process.env.NEXT_PUBLIC_AFF_ID_FINANCE2),
    makeAff("N26", process.env.NEXT_PUBLIC_AFF_ID_FINANCE3),
  ],

  // === TRADING ===
  trading: [
    makeAff("eToro", process.env.NEXT_PUBLIC_AFF_ID_TRADING1),
    makeAff("Binance", process.env.NEXT_PUBLIC_AFF_ID_TRADING2),
    makeAff("Kraken", process.env.NEXT_PUBLIC_AFF_ID_TRADING3),
  ],

  // === TICKET / EVENTI ===
  tickets: [
    makeAff("Tiqets", process.env.NEXT_PUBLIC_AFF_ID_TICKETS1),
    makeAff("TicketNetwork", process.env.NEXT_PUBLIC_AFF_ID_TICKETS2),
    makeAff("GetYourGuide", process.env.NEXT_PUBLIC_AFF_ID_TICKETS3),
  ],

  // === CONNETTIVITÀ ===
  connectivity: [
    makeAff("Yesim", process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY1),
    makeAff("Airalo", process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY2),
    makeAff("DrimSim", process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY3),
  ],

  // === VPN ===
  vpn: [
    makeAff("NordVPN", process.env.NEXT_PUBLIC_AFF_ID_VPN1),
    makeAff("Surfshark", process.env.NEXT_PUBLIC_AFF_ID_VPN2),
    makeAff("ExpressVPN", process.env.NEXT_PUBLIC_AFF_ID_VPN3),
  ],

  // === EXTRA ===
  extra: [
    makeAff("Amazon", process.env.NEXT_PUBLIC_AFF_ID_AMAZON),
    makeAff("Software", process.env.NEXT_PUBLIC_AFF_ID_SOFTWARE),
  ],
};

// Helpers
export const getAffiliatesByCategory = (category) =>
  (affiliates[category] || []).filter(Boolean);

export const getAllAffiliates = () =>
  Object.values(affiliates).flat().filter(Boolean);

export default affiliates;
