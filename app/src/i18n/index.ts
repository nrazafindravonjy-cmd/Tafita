import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import fr from './fr.json';

export const SupportedLanguages = ['fr', 'en'] as const;
export type Language = (typeof SupportedLanguages)[number];

const deviceLanguage = getLocales()[0]?.languageCode;
const initialLanguage: Language = deviceLanguage === 'en' ? 'en' : 'fr';

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: initialLanguage,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

export default i18n;
