import i18next from "i18next";
import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
  resources: {
    it: {
      translation: {
        heroTitle: "Il comparatore dei comparatori",
        heroSubtitle: "non sceglie per te, sceglie con te",
        tabs: {
          bnb: "🏠 BnB & Hotel",
          flight: "✈️ Voli",
          car: "🚗 Auto",
          finance: "💳 Finanza",
          trading: "📈 Trading",
          tickets: "🎟️ Ticket",
          connectivity: "📶 Connessione",
        },
        search: "Cerca",
        recent: "Ricerche recenti",
        filters: "Filtri",
        about: "Cos’è VRABO",
        support: "💙 Sostieni VRABO",
        contact: "📩 Contattaci",
        noResults: "Nessun risultato",
        loading: "Cerco le migliori offerte…",
        cookie: {
          text: "Questo sito utilizza cookie per migliorare l’esperienza e tracciare link affiliati. Continuando accetti la",
          policy: "Privacy Policy",
          accept: "Accetta",
        },
      },
    },
    en: {
      translation: {
        heroTitle: "The comparator of comparators",
        heroSubtitle: "doesn’t choose for you, chooses with you",
        tabs: {
          bnb: "🏠 BnB & Hotels",
          flight: "✈️ Flights",
          car: "🚗 Cars",
          finance: "💳 Finance",
          trading: "📈 Trading",
          tickets: "🎟️ Tickets",
          connectivity: "📶 Connectivity",
        },
        search: "Search",
        recent: "Recent searches",
        filters: "Filters",
        about: "What is VRABO",
        support: "💙 Support VRABO",
        contact: "📩 Contact us",
        noResults: "No results",
        loading: "Searching the best deals…",
        cookie: {
          text: "This site uses cookies to improve your experience and track affiliate links. By continuing you accept the",
          policy: "Privacy Policy",
          accept: "Accept",
        },
      },
    },
  },
  lng: "it",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18next;
