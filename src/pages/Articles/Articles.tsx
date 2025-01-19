import React, { useState, useEffect } from 'react';
import ArticleCard from '@/components/widgets/ArticleCard';
import styles from './Articles.module.css';
import mockArticles from './mockArticles'; // Import mock data
import { ChevronDownIcon, SettingsIcon, TagIcon, UsersIcon, SparklesIcon, BlockIcon } from '@/components/common/icons';

// Add interface for modal props
interface FeedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedSettingsModal: React.FC<FeedSettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('general'); // Track active section

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <SettingsIcon className={styles.modalTitleIcon} />
            <h2>My feed</h2>
          </div>
          <div className={styles.modalActions}>
            <button className={styles.saveButton} onClick={onClose}>
              Save
            </button>
            <button className={styles.closeButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>

        <div className={styles.modalLayout}>
          {/* Side Menu */}
          <div className={styles.sideMenu}>
            <button 
              className={`${styles.menuItem} ${activeSection === 'general' ? styles.active : ''}`}
              onClick={() => setActiveSection('general')}
            >
              <SettingsIcon className={styles.menuIcon} />
              <span>General</span>
            </button>

            <button 
              className={`${styles.menuItem} ${activeSection === 'tags' ? styles.active : ''}`}
              onClick={() => setActiveSection('tags')}
            >
              <TagIcon className={styles.menuIcon} />
              <span>Tags</span>
            </button>

            <button 
              className={`${styles.menuItem} ${activeSection === 'sources' ? styles.active : ''}`}
              onClick={() => setActiveSection('sources')}
            >
              <UsersIcon className={styles.menuIcon} />
              <span>Content sources</span>
            </button>

            <button 
              className={`${styles.menuItem} ${activeSection === 'preferences' ? styles.active : ''}`}
              onClick={() => setActiveSection('preferences')}
            >
              <SparklesIcon className={styles.menuIcon} />
              <span>Content preferences</span>
            </button>

            <button 
              className={`${styles.menuItem} ${activeSection === 'blocked' ? styles.active : ''}`}
              onClick={() => setActiveSection('blocked')}
            >
              <BlockIcon className={styles.menuIcon} />
              <span>Blocked content</span>
            </button>
          </div>

          {/* Content Area */}
          <div className={styles.modalContent}>
            {activeSection === 'general' && (
              <div className={styles.feedNameSection}>
                <h3>Feed name</h3>
                <p className={styles.sectionDescription}>
                  Choose a name that reflects the focus of your feed.
                </p>
                <input 
                  type="text" 
                  className={styles.feedNameInput} 
                  placeholder="My feed"
                />
              </div>
            )}
            {/* Add other section content here */}
          </div>
        </div>
      </div>
    </div>
  );
};

const Articles = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState(mockArticles); // Initialize with mock data
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [showOrderBy, setShowOrderBy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('Latest');

  const orderOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Latest', value: 'latest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Most Upvoted', value: 'upvoted' },
    { label: 'Most Viewed', value: 'viewed' },
  ];

  const handleOrderSelect = (option: string) => {
    setSelectedOrder(option);
    setShowOrderBy(false);
    // Add logic to sort articles based on selected option
  };

  useEffect(() => {
    // Filter articles based on search term
    const results = mockArticles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(results);
  }, [searchTerm]);

  // Add console log to debug
  const handleFeedSettingsClick = () => {
    console.log('Opening feed settings');
    setShowFeedSettings(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <button 
            className={styles.filterButton}
            onClick={handleFeedSettingsClick}
          >
            <SettingsIcon className={styles.filterIcon} />
            <span>Feed Settings</span>
          </button>

          <div className={styles.dropdownContainer}>
            <button 
              className={`${styles.filterButton} ${showOrderBy ? styles.active : ''}`}
              onClick={() => setShowOrderBy(!showOrderBy)}
            >
              <span>Order by: {selectedOrder}</span>
              <ChevronDownIcon className={`${styles.filterIcon} ${showOrderBy ? styles.rotated : ''}`} />
            </button>

            {showOrderBy && (
              <div className={styles.dropdownMenu}>
                {orderOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.dropdownItem} ${selectedOrder === option.label ? styles.selected : ''}`}
                    onClick={() => handleOrderSelect(option.label)}
                  >
                    {option.label}
                    {selectedOrder === option.label && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <FeedSettingsModal 
        isOpen={showFeedSettings} 
        onClose={() => setShowFeedSettings(false)} 
      />

      {loading ? (
        <p className="text-white/70">Loading articles...</p>
      ) : (
        <div className={styles.articleGrid}>
          {filteredArticles.length > 0 ? (
            filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <p className="text-white/70">No articles found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Articles; 