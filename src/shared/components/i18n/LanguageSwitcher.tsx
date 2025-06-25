import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/core/i18n';
import { useTranslation } from '@/shared/hooks/useTranslation';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { changeLanguage, currentLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (language: SupportedLanguage): Promise<void> => {
    await changeLanguage(language);
    setIsOpen(false);
  };

  const currentLangData = SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES.en;

  if (variant === 'buttons') {
    return (
      <div className={`${styles.buttonGroup} ${className}`}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code as SupportedLanguage)}
            className={`${styles.languageButton} ${currentLanguage === code ? styles.active : ''}`}
            aria-label={`Switch to ${lang.name}`}
          >
            <span className={styles.flag}>{lang.flag}</span>
            <span className={styles.code}>{code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`${styles.dropdown} ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.dropdownToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span className={styles.flag}>{currentLangData.flag}</span>
        <span className={styles.languageName}>{currentLangData.nativeName}</span>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code as SupportedLanguage)}
              className={`${styles.dropdownItem} ${
                currentLanguage === code ? styles.selected : ''
              }`}
              role="option"
              aria-selected={currentLanguage === code}
            >
              <span className={styles.flag}>{lang.flag}</span>
              <span className={styles.languageName}>{lang.nativeName}</span>
              {currentLanguage === code && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
