// config/affiliates.js
// Centralizzazione link affiliati Vrabo

const affiliates = {
  flights: [
    { name: "Aviasales", url: process.env.NEXT_PUBLIC_AFF_ID_FLIGHT },
    { name: "Kiwi", url: process.env.NEXT_PUBLIC_AFF_ID_FLIGHT2 },
  ],
  hotels: [
    { name: "Booking", url: process.env.NEXT_PUBLIC_AFF_ID_HOTEL },
  ],
  cars: [
    { name: "Localrent", url: process.env.NEXT_PUBLIC_AFF_ID_CAR },
    { name: "Economybookings", url: process.env.NEXT_PUBLIC_AFF_ID_CAR2 },
    { name: "QEEQ", url: process.env.NEXT_PUBLIC_AFF_ID_CAR3 },
    { name: "GetRentacar", url: process.env.NEXT_PUBLIC_AFF_ID_CAR4 },
  ],
  transfers: [
    { name: "Kiwitaxi", url: process.env.NEXT_PUBLIC_AFF_ID_TRANSFER1 },
    { name: "GetTransfer", url: process.env.NEXT_PUBLIC_AFF_ID_TRANSFER2 },
    { name: "Intui", url: process.env.NEXT_PUBLIC_AFF_ID_TRANSFER3 },
  ],
  bus: [
    { name: "TPK Bus", url: process.env.NEXT_PUBLIC_AFF_ID_BUS },
  ],
  tickets: [
    { name: "Tiqets", url: process.env.NEXT_PUBLIC_AFF_ID_TICKETS1 },
    { name: "TicketNetwork", url: process.env.NEXT_PUBLIC_AFF_ID_TICKETS2 },
  ],
  connectivity: [
    { name: "Yesim", url: process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY1 },
    { name: "Airalo", url: process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY2 },
    { name: "DrimSim", url: process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY3 },
  ],
  extra: [
    { name: "Amazon", url: process.env.NEXT_PUBLIC_AFF_ID_AMAZON },
    { name: "NordVPN", url: process.env.NEXT_PUBLIC_AFF_ID_SOFTWARE },
  ],
};

export default affiliates;
