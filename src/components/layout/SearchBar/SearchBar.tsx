import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, XIcon, ChevronDownIcon } from '@/components/common/icons';
import styles from './SearchBar.module.css';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'shots', label: 'Shots' },
  { id: 'designers', label: 'Designers' },
  { id: 'videos', label: 'Videos' },
  { id: 'articles', label: 'Articles' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'courses', label: 'Courses' },
];

const SearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [query, setQuery] = useState('');
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isCategoryOpen && categoryButtonRef.current) {
      const rect = categoryButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap
        left: rect.left,
      });
    }
  }, [isCategoryOpen]);

  const handleCategorySelect = (category: typeof categories[0]) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryButtonRef.current && 
        !categoryButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.searchContainer}
        animate={{ width: isExpanded ? '480px' : '40px' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <button 
          className={styles.searchButton}
          onClick={() => setIsExpanded(true)}
          aria-label="Search"
        >
          <SearchIcon className={styles.searchIcon} />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <>
              <motion.div 
                className={styles.expandedContent}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.inputContainer}>
                  <div className={styles.categoryDropdown}>
                    <button 
                      ref={categoryButtonRef}
                      className={styles.categoryButton}
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                      {selectedCategory.label}
                      <ChevronDownIcon className={`${styles.chevronIcon} ${isCategoryOpen ? styles.rotate : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isCategoryOpen && (
                        <motion.div 
                          className={styles.dropdownMenu}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            position: 'fixed',
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                          }}
                        >
                          {categories.map(category => (
                            <button
                              key={category.id}
                              className={`${styles.dropdownItem} ${
                                selectedCategory.id === category.id ? styles.selected : ''
                              }`}
                              onClick={() => handleCategorySelect(category)}
                            >
                              {category.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${selectedCategory.id === 'all' ? 'anything' : selectedCategory.label.toLowerCase()}...`}
                    className={styles.searchInput}
                    autoFocus
                  />
                </div>
              </motion.div>

              <button 
                className={styles.closeButton}
                onClick={() => {
                  setIsExpanded(false);
                  setIsCategoryOpen(false);
                }}
                aria-label="Close search"
              >
                <XIcon className={styles.closeIcon} />
              </button>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SearchBar; 