import React, { useState, useEffect } from 'react';
import ArticleCard from '@/components/widgets/ArticleCard';
import styles from './Articles.module.css';
import mockArticles from './mockArticles'; // Import mock data
import { ChevronDownIcon } from '@/components/common/icons';

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <button 
            className={styles.filterButton}
            onClick={() => setShowFeedSettings(!showFeedSettings)}
          >
            <span>Feed Settings</span>
            <ChevronDownIcon className={styles.filterIcon} />
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