
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import svTranslations from './locales/sv.json';

const resources = {
  en: {
    translation: enTranslations
  },
  sv: {
    translation: svTranslations
  }
};

// Debug: Log the resources to see if they're loaded correctly
console.log('🌐 i18n resources loaded:', {
  en: Object.keys(resources.en.translation),
  sv: Object.keys(resources.sv.translation),
  aiAgentKeys: Object.keys(resources.en.translation.aiAgent || {})
});

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    debug: true, // Enable debug mode
    react: {
      useSuspense: false // Disable suspense to prevent issues
    }
  });

// Debug: Log when i18n is ready
i18n.on('initialized', () => {
  console.log('✅ i18n initialized successfully');
  console.log('🔍 Testing aiAgent translations:', {
    title: i18n.t('aiAgent.title'),
    quickTipsTitle: i18n.t('aiAgent.quickTipsTitle'),
    tipComplianceStrong: i18n.t('aiAgent.tipComplianceStrong'),
    tipComplianceText: i18n.t('aiAgent.tipComplianceText')
  });
});

export default i18n;
