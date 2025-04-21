import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { atom, getDefaultStore } from 'jotai';
// Import all translation files
import en from './assets/translations/en.json';
import it from './assets/translations/it.json';
import da from './assets/translations/da.json';

// Create the translations object
const translations = {
  en,
  it,
  da,
};

// Create the i18n instance
const i18n = new I18n(translations);

// Set the locale from device settings by default
i18n.locale = Localization.getLocales()[0].languageCode || 'en';

// Fallback to English if translation is missing
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Create an atom to store and update the current locale
export const localeAtom = atom<string>(i18n.locale);

// Function to change the locale
export const changeLocale = (locale: string) => {
  i18n.locale = locale;
  const defaultStore = getDefaultStore()
  defaultStore.set(localeAtom, locale);
};

// Export the translation function
export const t = (key: string, options?: object) => i18n.t(key, options);

export default i18n; 