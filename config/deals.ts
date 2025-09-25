export type Deal = { code?: string; url?: string; expires?: string; note?: string };
export const DEFAULT_DEALS: Record<"telco"|"finance"|"car", Record<string, Deal>> = {
  telco: {
    AIRALO:  { code:"VRABO5", note:"-5% nuovi clienti" },
    HOLAFLY: { code:"VRABO",  note:"sconto variabile"  },
  },
  finance: {
    REVOLUT: { note:"bonus benvenuto (variabile)" },
    WISE:    { note:"prime trasferte scontate"    },
  }
};

