import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

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
i18n.locale = Localization.getLocales()[0]?.languageCode || 'en';

// Fallback to English if translation is missing
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n; 