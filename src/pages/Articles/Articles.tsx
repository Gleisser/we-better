import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loader = useRef(null);

  const PAGE_SIZE = 10;

  const orderOptions = [
    { label: 'Latest', value: 'publishedAt:desc' },
    { label: 'Oldest', value: 'publishedAt:asc' },
    { label: 'Title A-Z', value: 'title:asc' },
    { label: 'Title Z-A', value: 'title:desc' },
  ];

  const fetchArticles = async (pageNum: number, sortValue?: string) => {
    try {
      setIsLoadingMore(true);
      const response = await articleService.getArticles({
        sort: sortValue || 'publishedAt:desc',
        pagination: {
          page: pageNum,
          pageSize: PAGE_SIZE,
        },
      });

      if (pageNum === 1) {
        setArticles(response.data);
      } else {
        setArticles(prev => [...prev, ...response.data]);
      }

      // Check if we have more pages
      setHasMore(response.meta.pagination.page < response.meta.pagination.pageCount);
      
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Reset and fetch articles when order changes
  const handleOrderSelect = (option: string) => {
    setSelectedOrder(option);
    setShowOrderBy(false);
    setPage(1);
    const selectedOption = orderOptions.find(opt => opt.label === option);
    if (selectedOption) {
      fetchArticles(1, selectedOption.value);
    }
  };

  // Intersection Observer callback
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoadingMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingMore]);

  // Initialize intersection observer
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0
    };

    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);

    return () => observer.disconnect();
  }, [handleObserver]);

  // Fetch articles when page changes
  useEffect(() => {
    const selectedOption = orderOptions.find(opt => opt.label === selectedOrder);
    fetchArticles(page, selectedOption?.value);
  }, [page]);

  // Filter articles based on search term
  useEffect(() => {
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
      tldr: article.tldr,
      publishedAt: article.publishedAt,
      postDate: article.postDate,
      readTime: article.readTime, 
      category: article.category?.slug || 'general',
      tags: article.tags || [],
      url: article.url,
      tableOfContents: article.tableOfContents,
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

      {loading && page === 1 ? (
        <p className="text-white/70">Loading articles...</p>
      ) : (
        <>
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
          
          {/* Loading indicator */}
          <div ref={loader} className="w-full py-4 text-center">
            {isLoadingMore && hasMore && (
              <p className="text-white/70">Loading more articles...</p>
            )}
          </div>
        </>
      )}

      <FeedSettingsModal 
        isOpen={showFeedSettings} 
        onClose={() => setShowFeedSettings(false)} 
      />
    </div>
  );
};

export default Articles; 