import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupportedLanguages, Language, useTranslation } from '../i18n';

const languageFlags: Record<Language, string> = {
  'en': '🇬🇧',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇨🇳',
};

export function LanguageSelector() {
  const { language, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = getSupportedLanguages();

  const handleSelect = useCallback((lang: Language) => {
    changeLanguage(lang);
    setIsOpen(false);
  }, [changeLanguage]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const currentFlag = languageFlags[language] || '🌐';

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        {currentFlag}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50"
        >
          {languages.map((lang) => {
            const flag = languageFlags[lang.code] || '🌐';
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${language === lang.code
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <span className="text-lg">{flag}</span>
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
