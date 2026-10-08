import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import mr from "./mr.json";
import hi from "./hi.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      mr: mr,
      hi: hi,
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
