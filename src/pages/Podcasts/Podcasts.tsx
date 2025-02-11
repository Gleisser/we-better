import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Podcasts.module.css';
import { ChevronDownIcon, SettingsIcon } from '@/components/common/icons';
import FeedSettingsModal from '@/components/common/FeedSettingsModal/FeedSettingsModal';
import PodcastCard from '@/components/widgets/PodcastCard/PodcastCard';
import PodcastPlayer from '@/components/widgets/PodcastPlayer/PodcastPlayer';
import { podcastService, Podcast } from '@/services/podcastService';

const Podcasts = () => {
  const [loading, setLoading] = useState(true);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [showOrderBy, setShowOrderBy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('Latest');
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loader = useRef(null);

  const PAGE_SIZE = 12;

  const orderOptions = [
    { label: 'Latest', value: 'publishedAt:desc' },
    { label: 'Oldest', value: 'publishedAt:asc' },
    { label: 'Title A-Z', value: 'title:asc' },
    { label: 'Title Z-A', value: 'title:desc' },
  ];

  const fetchPodcasts = async (pageNum: number, sortValue?: string) => {
    try {
      setIsLoadingMore(true);
      const response = await podcastService.getPodcasts({
        sort: sortValue || 'publishedAt:desc',
        pagination: {
          page: pageNum,
          pageSize: PAGE_SIZE,
        }
      });

      const mappedPodcasts = podcastService.mapPodcastResponse(response);
      console.log(mappedPodcasts);
      
      if (pageNum === 1) {
        setPodcasts(mappedPodcasts);
      } else {
        setPodcasts(prev => [...prev, ...mappedPodcasts]);
      }

      setHasMore(response.meta.pagination.page < response.meta.pagination.pageCount);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleOrderSelect = (option: string) => {
    setSelectedOrder(option);
    setShowOrderBy(false);
    setPage(1);
    const selectedOption = orderOptions.find(opt => opt.label === option);
    if (selectedOption) {
      fetchPodcasts(1, selectedOption.value);
    }
  };

  const handlePlay = (podcast: Podcast) => {
    setCurrentPodcast(podcast);
    setIsPlaying(true);
  };

  const getCurrentIndex = () => {
    if (!currentPodcast) return -1;
    return podcasts.findIndex(p => p.id === currentPodcast.id);
  };

  const handleNext = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < podcasts.length - 1) {
      setCurrentPodcast(podcasts[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      setCurrentPodcast(podcasts[currentIndex - 1]);
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

  // Fetch more podcasts when page changes
  useEffect(() => {
    if (page > 1) {
      fetchPodcasts(page);
    }
  }, [page]);

  // Initial fetch
  useEffect(() => {
    fetchPodcasts(1);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <button 
            className={styles.filterButton}
            onClick={() => setShowFeedSettings(true)}
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

      {loading && page === 1 ? (
        <p className="text-white/70">Loading podcasts...</p>
      ) : (
        <>
          <div className={styles.podcastGrid}>
            {podcasts.map(podcast => (
              <PodcastCard 
                key={podcast.id} 
                podcast={podcast}
                onPlay={handlePlay}
                isPlaying={isPlaying && currentPodcast?.id === podcast.id}
                isCurrentlyPlaying={currentPodcast?.id === podcast.id}
              />
            ))}
          </div>
          
          {/* Loading indicator */}
          <div ref={loader} className="w-full py-4 text-center">
            {isLoadingMore && hasMore && (
              <p className="text-white/70">Loading more podcasts...</p>
            )}
          </div>
        </>
      )}

      <PodcastPlayer
        podcast={currentPodcast}
        onClose={() => setCurrentPodcast(null)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={getCurrentIndex() < podcasts.length - 1}
        hasPrevious={getCurrentIndex() > 0}
      />
    </div>
  );
};

export default Podcasts; 