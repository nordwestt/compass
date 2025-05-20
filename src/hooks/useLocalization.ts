import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { I18nManager } from 'react-native';
import { localeAtom } from './atoms';
import { useTranslation } from 'react-i18next';
import i18n, { changeLanguage, i18nJs } from '../../i18n';
import LanguageDetector from '@os-team/i18next-react-native-language-detector';


/**
 * Hook for handling localization in the app
 * Returns the current locale and a function to change it
 */
export const useLocalization = () => {
  const [locale, setLocale] = useAtom(localeAtom);
  const { t: reactI18nextT } = useTranslation();

  useEffect(() => {
    // Set the locale from atom state
    if (locale) {
      changeLanguage(locale);
    }
    else{
      try{
        const language = LanguageDetector.detect();
        console.log('Language detected:', language);
        if(language && typeof language === 'string'){
          setLocale(language);
          console.log('Locale set to:', language);
        }
      }
      catch(error){
        console.error('Error detecting language:', error);
      }
    }
  }, [locale]);

  // Function to change the locale
  const changeLocale = async (newLocale: string) => {
    if (newLocale) {
      await changeLanguage(newLocale);
      setLocale(newLocale);
    }
  };

  // Use the t function from react-i18next but maintain backward compatibility
  const t = (key: string, options?: any) => {
    return reactI18nextT(key, options);
  };

  return {
    locale,
    changeLocale,
    t,
    i18n, // Export the i18n instance for direct access if needed
  };
};

export default i18nJs; 