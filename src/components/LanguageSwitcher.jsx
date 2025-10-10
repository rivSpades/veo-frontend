import React from 'react';
import { useLanguage } from '../store/LanguageContext';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

/**
 * LanguageSwitcher - Dropdown for language selection
 * @param {Object} props
 * @param {'default' | 'compact'} props.variant - Display variant
 * @param {string} props.className - Additional CSS classes
 */
export function LanguageSwitcher({ variant = 'default', className = '' }) {
  const { language, setLanguage } = useLanguage();

  const handleChange = (e) => {
    setLanguage(e.target.value);
  };

  if (variant === 'compact') {
    return (
      <select
        value={language}
        onChange={handleChange}
        className={`bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="w-5 h-5 text-gray-600" />
      <select
        value={language}
        onChange={handleChange}
        className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * LanguageSwitcherCards - Card-based language selector for settings
 */
export function LanguageSwitcherCards({ className = '' }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {LANGUAGES.map((lang) => {
        const isSelected = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              isSelected
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-4xl mb-2">{lang.flag}</div>
            <div className={`font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
              {lang.name}
            </div>
            {isSelected && (
              <div className="text-xs text-purple-600 mt-1 font-medium">Current</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
