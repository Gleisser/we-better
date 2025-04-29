import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, XIcon } from '@/shared/components/common/icons';
import styles from './MobileSearch.module.css';

export const MobileSearch = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Search Button */}
      <button 
        className={styles.searchButton}
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
      >
        <SearchIcon className={styles.searchIcon} />
      </button>

      {/* Search Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.overlay}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={styles.searchHeader}>
              <div className={styles.searchInputWrapper}>
                <SearchIcon className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className={styles.searchInput}
                  autoFocus
                />
              </div>
              <button 
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
              >
                <XIcon className={styles.closeIcon} />
              </button>
            </div>
            
            {/* Search Results would go here */}
            <div className={styles.searchResults}>
              {/* Results content */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 