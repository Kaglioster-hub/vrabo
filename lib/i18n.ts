import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import it from "@/locales/it/common.json";
import en from "@/locales/en/common.json";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "it",
      resources: {
        it: { translation: it },
        en: { translation: en },
      },
      interpolation: { escapeValue: false },
      detection: {
        order: ["querystring", "cookie", "localStorage", "navigator"],
        caches: ["localStorage"]
      }
    });
}

export default i18n;
