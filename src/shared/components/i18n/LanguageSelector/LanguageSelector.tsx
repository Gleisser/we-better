import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useUserPreferences } from '@/shared/hooks/useUserPreferences';
import { ChevronDownIcon } from '@/shared/components/common/icons';
import { SUPPORTED_LANGUAGES } from '@/core/i18n';
import type { SupportedLanguage } from '@/core/i18n';
import styles from './LanguageSelector.module.css';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector = ({ className }: LanguageSelectorProps): JSX.Element => {
  const { changeLanguage, currentLanguage } = useTranslation();
  const { updateLanguage } = useUserPreferences();
  const { t } = useCommonTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangData = SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES.en;

  const handleLanguageChange = async (language: SupportedLanguage): Promise<void> => {
    // Optimistically update UI
    await changeLanguage(language);
    setIsOpen(false);

    // Persist to backend
    try {
      await updateLanguage(language);
    } catch (error) {
      console.error('Failed to persist language preference:', error);
      // Note: We don't revert the UI change since the language switch already happened
      // and reverting it would be more disruptive to the user experience
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`${styles.languageSelector} ${className || ''}`} ref={dropdownRef}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('settings.language.title')}</h3>
        <p className={styles.subtitle}>{t('settings.language.subtitle')}</p>
      </div>

      <div className={styles.dropdown}>
        <button
          className={styles.dropdownTrigger}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select language"
        >
          <div className={styles.selectedOption}>
            <span className={styles.flag}>{currentLangData.flag}</span>
            <span className={styles.languageName}>{currentLangData.nativeName}</span>
          </div>
          <ChevronDownIcon className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
        </button>

        {isOpen && (
          <div className={styles.dropdownMenu} role="listbox">
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
    </div>
  );
};

export default LanguageSelector;
