import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Videos.module.css';
import { ChevronDownIcon, SettingsIcon } from '@/shared/components/common/icons';
import { YoutubeModal } from '@/shared/components/widgets/VideoWidget/YoutubeModal';
import VideoCard from '@/shared/components/widgets/VideoCard/VideoCard';
import FeedSettingsModal from '@/shared/components/common/FeedSettingsModal/FeedSettingsModal';
import { videoService, Video } from '@/core/services/videoService';

const Videos = () => {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [showOrderBy, setShowOrderBy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('Latest');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loader = useRef(null);

  const PAGE_SIZE = 12;

  const orderOptions = [
    { label: 'Recommended', value: 'rating:desc' },
    { label: 'Latest', value: 'publishedAt:desc' },
    { label: 'Most Popular', value: 'views:desc' },
    { label: 'Most Upvoted', value: 'rating:desc' },
    { label: 'Most Viewed', value: 'views:desc' },
  ];

  const fetchVideos = async (pageNum: number, sortValue?: string) => {
    try {
      setIsLoadingMore(true);
      const response = await videoService.getVideos({
        sort: sortValue || 'publishedAt:desc',
        pagination: {
          page: pageNum,
          pageSize: PAGE_SIZE,
        }
      });

      const mappedVideos = videoService.mapVideoResponse(response);
      
      if (pageNum === 1) {
        setVideos(mappedVideos);
      } else {
        setVideos(prev => [...prev, ...mappedVideos]);
      }

      setHasMore(response.meta.pagination.page < response.meta.pagination.pageCount);
    } catch (error) {
      console.error('Error fetching videos:', error);
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
      fetchVideos(1, selectedOption.value);
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

  // Fetch videos when page changes
  useEffect(() => {
    const selectedOption = orderOptions.find(opt => opt.label === selectedOrder);
    fetchVideos(page, selectedOption?.value);
  }, [page]);

  // Initial fetch
  useEffect(() => {
    fetchVideos(1);
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
        <p className="text-white/70">Loading videos...</p>
      ) : (
        <>
          <div className={styles.videoGrid}>
            {videos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video}
                onPlay={() => setSelectedVideo(video)}
              />
            ))}
          </div>
          
          {/* Loading indicator */}
          <div ref={loader} className="w-full py-4 text-center">
            {isLoadingMore && hasMore && (
              <p className="text-white/70">Loading more videos...</p>
            )}
          </div>
        </>
      )}

      {selectedVideo && (
        <YoutubeModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          video={selectedVideo}
          onProgress={(progress) => {
            console.log('Video progress:', progress);
          }}
        />
      )}
    </div>
  );
};

export default Videos; 