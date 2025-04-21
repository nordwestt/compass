import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { I18nManager } from 'react-native';
import { localeAtom } from './atoms';

import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import en from '@/assets/translations/en.json';
import it from '@/assets/translations/it.json';
import da from '@/assets/translations/da.json';

// Create the translations object
const translations = {
  en,
  it,
  da,
};

// Create the i18n instance
const i18n = new I18n(translations);
export default i18n; 

/**
 * Hook for handling localization in the app
 * Returns the current locale and a function to change it
 */
export const useLocalization = () => {

  useEffect(()=>{
    // Set the locale from device settings by default
    i18n.locale = locale || 'en';

    // Fallback to English if translation is missing
    i18n.enableFallback = true;
    i18n.defaultLocale = 'en';
  }, [])

  const [locale, setLocale] = useAtom(localeAtom);

  // Function to change the locale
  const changeLocale = async (newLocale: string) => {
    if (newLocale) {
      i18n.locale = newLocale;
      setLocale(newLocale);
    }

  };

  return {
    locale,
    changeLocale,
    t: (key: string, options?: object) => i18n.t(key, options),
    i18n, // Export the i18n instance for direct access if needed
  };
}; 