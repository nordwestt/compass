import { useEffect } from 'react';
import { useAtom } from 'jotai';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import i18n from '../../i18n';
import { localeAtom } from './atoms';
/**
 * Hook for handling localization in the app
 * Returns the current locale and a function to change it
 */
export const useLocalization = () => {
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