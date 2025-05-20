import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your translation files
import en from '@/assets/translations/en.json';
import it from '@/assets/translations/it.json';
import da from '@/assets/translations/da.json';
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';


// Create a language detector
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get stored language from AsyncStorage first
      const storedLang = await AsyncStorage.getItem('locale');
      if (storedLang) {
        return callback(storedLang);
      }
      
      // Fall back to device locale if no stored preference
      const deviceLocale = Localization.getLocales()[0].languageCode;
      // Check if the detected language is supported
      if (['en', 'it', 'da'].includes(deviceLocale || '')) {
        return callback(deviceLocale || '' );
      }
      
      // Default to English if not supported
      return callback('en');
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: (language: string) => {
    AsyncStorage.setItem('locale', language);
  }
};

// Initialize i18next
i18n
  .use(RNLanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'it', 'da'],
    fallbackLng: 'en',
    debug: __DEV__,
    
    interpolation: {
      escapeValue: false, // Not needed for React as it escapes by default
    },
    
    resources: {
      en: {
        translation: en
      },
      it: {
        translation: it
      },
      da: {
        translation: da
      }
    }
  });

// Create the i18n-js instance for backward compatibility
const i18nJs = new I18n({
  en,
  it,
  da
});

// Sync the language between i18next and i18n-js
i18n.on('languageChanged', (lng) => {
  i18nJs.locale = lng;
});

// Add this function to change language programmatically
export const changeLanguage = (language: string) => {
  return i18n.changeLanguage(language);
};

export { i18nJs };
export default i18n;
