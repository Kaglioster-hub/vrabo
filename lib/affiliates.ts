export const AFF = {
  hotels: { primary: process.env.NEXT_PUBLIC_AFF_ID_HOTEL ?? "" },
  flights:{ primary: process.env.NEXT_PUBLIC_AFF_ID_FLIGHT ?? "" },
  cars:   { primary: process.env.NEXT_PUBLIC_AFF_ID_CAR ?? "", local: process.env.NEXT_PUBLIC_AFF_ID_CAR2 ?? "" },
  tickets:{ t1: process.env.NEXT_PUBLIC_AFF_ID_TICKETS1 ?? "" },
  travelpayouts: process.env.TRAVELPAYOUTS_KEY ?? ""
} as const;
