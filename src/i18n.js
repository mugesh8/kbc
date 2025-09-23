// // src/i18n.js
// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';

// const resources = {
//   en: {
//     translation: {
//       welcome: "Welcome",
//       selectLanguage: "Select Language to Continue",
//       start: "Let's Start"
//     }
//   },
//   ta: {
//     translation: {
//       welcome: "நல்வரவு",
//       selectLanguage: "தொடர மொழியைத் தேர்ந்தெடுக்கவும்",
//       start: "தொடங்குவோம்"
//     }
//   }
// };

// i18n.use(initReactI18next).init({
//   resources,
//   lng: "en",
//   fallbackLng: "en",
//   interpolation: { escapeValue: false }
// });

// export default i18n;
// src/i18n.js
// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translation/en.json';
import ta from './translation/ta.json';

const savedLang = localStorage.getItem('lang') || 'en'; // 👈 Load saved lang

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta }
    },
    lng: savedLang, // 👈 Set language here
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

