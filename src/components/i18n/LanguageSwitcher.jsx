import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../store/LanguageContext';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

/**
 * LanguageSwitcher - Component for switching application language
 */
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="appearance-none bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-secondary-900 dark:text-white hover:bg-secondary-50 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer transition-colors"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500 pointer-events-none" />
    </div>
  );
}

export default LanguageSwitcher;
