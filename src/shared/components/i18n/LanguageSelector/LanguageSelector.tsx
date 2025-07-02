import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/core/i18n';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { ChevronDownIcon, CheckmarkIcon } from '@/shared/components/common/icons';
import styles from './LanguageSelector.module.css';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector = ({ className }: LanguageSelectorProps): JSX.Element => {
  const { changeLanguage, currentLanguage } = useTranslation();
  const { t } = useCommonTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangData = SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES.en;

  const handleLanguageChange = async (language: SupportedLanguage): Promise<void> => {
    await changeLanguage(language);
    setIsOpen(false);
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

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={styles.dropdownMenu}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => {
                const isSelected = currentLanguage === code;

                return (
                  <motion.button
                    key={code}
                    className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleLanguageChange(code as SupportedLanguage)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={styles.optionContent}>
                      <span className={styles.flag}>{lang.flag}</span>
                      <div className={styles.languageInfo}>
                        <span className={styles.languageName}>{lang.nativeName}</span>
                        <span className={styles.languageSubtext}>({lang.name})</span>
                      </div>
                    </div>
                    {isSelected && <CheckmarkIcon className={styles.checkmark} />}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LanguageSelector;
