import React, { useState, useEffect } from 'react';
import ArticleCard from '@/components/widgets/ArticleCard';
import styles from './Articles.module.css';
import { ChevronDownIcon, SettingsIcon, TagIcon, UsersIcon, SparklesIcon, BlockIcon } from '@/components/common/icons';
import FeedSettingsModal from '@/components/common/FeedSettingsModal/FeedSettingsModal';
import { articleService, Article } from '@/services/articleService';

const Articles = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [showOrderBy, setShowOrderBy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('Latest');

  const orderOptions = [
    { label: 'Latest', value: 'publishedAt:desc' },
    { label: 'Oldest', value: 'publishedAt:asc' },
    { label: 'Title A-Z', value: 'title:asc' },
    { label: 'Title Z-A', value: 'title:desc' },
  ];

  const fetchArticles = async (sortValue?: string) => {
    try {
      setLoading(true);
      const response = await articleService.getArticles({
        sort: sortValue || 'publishedAt:desc',
      });
      setArticles(response.data);
      setFilteredArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOrderSelect = (option: string) => {
    setSelectedOrder(option);
    setShowOrderBy(false);
    const selectedOption = orderOptions.find(opt => opt.label === option);
    if (selectedOption) {
      fetchArticles(selectedOption.value);
    }
  };

  useEffect(() => {
    // Filter articles based on search term
    const results = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(results);
  }, [searchTerm, articles]);

  const handleFeedSettingsClick = () => {
    setShowFeedSettings(true);
  };

  const mapArticleToCardProps = (article: Article) => {
    return {
      id: article.id.toString(),
      title: article.title,
      description: article.description,
      image: article.thumbnail || '/placeholder-image.jpg',
      thumbnail: article.thumbnail || '/placeholder-image.jpg',
      tldr: article.description, // Using description as TLDR for now
      publishedAt: article.publishedAt,
      // Mocked fields
      readTime: article.readTime, // Random read time between 2-12 minutes
      category: article.category?.slug || 'general',
      tags: article.tags?.map(tag => tag.slug) || [],
      url: article.url,
    };
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

      {loading ? (
        <p className="text-white/70">Loading articles...</p>
      ) : (
        <div className={styles.articleGrid}>
          {filteredArticles.length > 0 ? (
            filteredArticles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={mapArticleToCardProps(article)} 
              />
            ))
          ) : (
            <p className="text-white/70">No articles found.</p>
          )}
        </div>
      )}

      <FeedSettingsModal 
        isOpen={showFeedSettings} 
        onClose={() => setShowFeedSettings(false)} 
      />
    </div>
  );
};

export default Articles; 