export type Deal = { code?: string; url?: string; expires?: string; note?: string };
export type DealMode = "telco"|"finance"|"car"|"stay"|"flight";
export const DEFAULT_DEALS: Record<DealMode, Record<string, Deal>> = {
  telco:  { AIRALO:{code:"VRABO5",note:"-5% nuovi clienti"}, HOLAFLY:{code:"VRABO",note:"sconto variabile"} },
  finance:{ REVOLUT:{note:"bonus benvenuto (variabile)"}, WISE:{note:"prime trasferte scontate"} },
  car:    { RENTALCARS:{note:"prezzi spesso migliori"}, DISCOVERCARS:{note:"sconti frequenti"} },
  stay:   { BOOKING:{note:"prezzi spesso imbattibili"}, EXPEDIA_HOTELS:{note:"pacchetti hotel+volo"} },
  flight: { SKYSCANNER:{note:"ricerca completa"}, KIWI:{note:"tariffe smart"} }
};
