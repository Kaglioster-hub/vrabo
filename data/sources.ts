export type Item = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  affiliate?: { label: string; url: string }[];
};

export const sources: Item[] = [
  // ====== IN EVIDENZA ======
  {
    id: "fpmakeup",
    title: "FPMakeup — Beauty & Training",
    description: "Studio di trucco professionale per eventi, shooting e formazione. Servizi su misura e percorsi didattici modulari.",
    url: "https://fpmakeup.vrabo.it",
    category: "Beauty",
    tags: ["Makeup","Formazione","Servizi"]
  },
  {
    id: "arpongetti",
    title: "Arpongetti — Psicologa",
    description: "Consulenza psicologica e percorsi di supporto. Interventi individuali e di coppia orientati al benessere.",
    url: "https://arpongetti.vrabo.it",
    category: "Psicologia",
    tags: ["Consulenza","Benessere","Psicologia"]
  },
  {
    id: "studio-amedeo",
    title: "Studio Legale Amedeo",
    description: "Consulenza legale e tutela dei diritti. Mandato digitale, contatti rapidi e approccio orientato alla soluzione.",
    url: "https://legale.vrabo.it",
    category: "Legal",
    tags: ["Professioni","Mandato","Consulenza"]
  },
  {
    id: "adreuropa",
    title: "ADREuropa — Mediazione & Formazione",
    description: "Organismo di mediazione ed ente di formazione. Percorsi su ADR e progettazione europea, networking e aggiornamento.",
    url: "https://adreuropa.it",
    category: "Formazione",
    tags: ["Mediazione","Corsi","Bandi"]
  },
  {
    id: "nanocakes",
    title: "NanoCakes — Pasticceria",
    description: "Pasticceria artigianale: torte e dolci su ordinazione con personalizzazioni e consegna su richiesta.",
    url: "https://nanocakes.vrabo.it",
    category: "Food",
    tags: ["Torte","Artigianale","Ordini"]
  },
  {
    id: "kennyramp",
    title: "Kenny Ramp — Artista",
    description: "Musica, video e press kit. Booking per eventi e collaborazioni professionali.",
    url: "https://kennyramp.vrabo.it",
    category: "Music",
    tags: ["Artist","Booking","Video"]
  },

  // ====== PROGETTI / POWERED BY VRABO ======
  {
    id: "scoutee",
    title: "Scoutee — App Salva Turista",
    description: "Informazioni utili e strumenti di orientamento per chi è fuori sede. Non sostituisce i servizi di emergenza.",
    url: "https://scoutee.vrabo.it",
    category: "Travel",
    tags: ["Sicurezza","FuoriSede","App"]
  },
  {
    id: "skorpiogamerz",
    title: "SkorpioGamerz — Offerte Videogames",
    description: "Selezione di offerte e sconti su videogiochi e accessori. Community, streaming e guide all’acquisto.",
    url: "https://sg.vrabo.it",
    category: "Gaming Deals",
    tags: ["Offerte","Gaming","Guide"]
  },
  {
    id: "gmp",
    title: "GMP Music — Piattaforma tipo Spotify",
    description: "Catalogo e streaming in stile Spotify con strumenti editoriali e integrazioni per artisti e label.",
    url: "https://gmp.vrabo.it",
    category: "Music",
    tags: ["Streaming","Playlist","Tools"]
  },
  {
    id: "genesi",
    title: "Genesi — Origini della storia umana",
    description: "Percorsi tematici sulle origini dell’umanità: testi selezionati, mappe e riferimenti per l’approfondimento.",
    url: "https://genesi.vrabo.it",
    category: "Storia",
    tags: ["Origini","Fonti","Percorsi"]
  },
  {
    id: "bettyquotes",
    title: "BettyQuotes — Citazioni & Aforismi",
    description: "Raccolta curata di citazioni e aforismi con ricerca per temi e ispirazioni quotidiane.",
    url: "https://bq.vrabo.it",
    category: "Quotes",
    tags: ["Citazioni","Aforismi","Ispirazione"]
  },
  {
    id: "cokabeatz",
    title: "CokaBeatz — Produzione Musicale",
    description: "Strumentali originali e produzioni su commissione. Libreria e canale YouTube ufficiale.",
    url: "https://cokabeatz.vrabo.it",
    category: "Music",
    tags: ["Beats","Produzione","YouTube"]
  },

  // ====== ALTRI PROGETTI ======
  {
    id: "musicradar",
    title: "MusicRadar — Trend & Feed personalizzati",
    description: "Aggregatore musicale con filtri per genere e fonti verificate: trend, chart e nuove uscite.",
    url: "https://mr.vrabo.it",
    category: "Music",
    tags: ["Trend","News","Charts"]
  },
  {
    id: "evangelion",
    title: "Evangelion — Il Vangelo Totale",
    description: "Raccolta digitale di testi canonici e apocrifi con esperienza di lettura immersiva.",
    url: "https://evangelion.galentoken.site",
    category: "Culture",
    tags: ["Lettura","Ricerca","Testi"]
  },
  {
    id: "tuttonews",
    title: "TuttoNews — Aggregatore smart",
    description: "Notizie da fonti selezionate con filtri tematici e feed personalizzati.",
    url: "https://tuttonews.vrabo.it",
    category: "News",
    tags: ["Feed","Filtri","Smart"]
  },
  {
    id: "lwh",
    title: "LiveWorldHelp — Crisi globali in tempo reale",
    description: "Mappa interattiva con dati da ReliefWeb, GDACS e HDX. Grafici e percorsi di supporto alle ONG.",
    url: "https://lwh.vrabo.it",
    category: "Crisis Map",
    tags: ["Mappe","Dati","NGO"]
  },
  {
    id: "bnb",
    title: "BnB — GalenToken.site",
    description: "Motore per offerte BnB con reindirizzamento ai partner. Ricerca essenziale e referral conforme.",
    url: "https://bnb.galentoken.site",
    category: "Travel",
    tags: ["Booking","Affiliate","BnB"]
  },
  {
    id: "tokenvrabo",
    title: "Token VRABO — GalenToken",
    description: "Token di utilità per l’ecosistema VRABO. Non è un invito all’investimento né uno strumento finanziario.",
    url: "https://token.vrabo.it",
    category: "Crypto",
    tags: ["Utility","Ecosistema","NoInvestment"]
  },
  {
    id: "donazioni",
    title: "Sostieni VRABO",
    description: "Sostieni lo sviluppo con una donazione. PayPal e wallet cripto disponibili.",
    url: process.env.NEXT_PUBLIC_PAYPAL_ME || "https://paypal.me/vrabo",
    category: "Support",
    tags: ["PayPal","Crypto","Supporto"],
    affiliate: [{ label: "PayPal", url: process.env.NEXT_PUBLIC_PAYPAL_ME || "https://paypal.me/vrabo" }]
  }
];
