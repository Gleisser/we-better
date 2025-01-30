import React, { useState } from 'react';
import styles from './Podcasts.module.css';
import { ChevronDownIcon, SettingsIcon } from '@/components/common/icons';
import FeedSettingsModal from '@/components/common/FeedSettingsModal/FeedSettingsModal';
import PodcastCard from '@/components/widgets/PodcastCard/PodcastCard';
import PodcastPlayer from '@/components/widgets/PodcastPlayer/PodcastPlayer';
import { mockPodcasts, type Podcast } from './mockPodcasts';

const Podcasts = () => {
  const [loading, setLoading] = useState(false);
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [showOrderBy, setShowOrderBy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('Latest');
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const orderOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Most Upvoted', value: 'upvoted' },
    { label: 'Most Listened', value: 'listened' },
  ];

  const handleOrderSelect = (option: string) => {
    setSelectedOrder(option);
    setShowOrderBy(false);
  };

  const handlePlay = (podcast: Podcast) => {
    setCurrentPodcast(podcast);
    setIsPlaying(true);
  };

  const getCurrentIndex = () => {
    if (!currentPodcast) return -1;
    return mockPodcasts.findIndex(p => p.id === currentPodcast.id);
  };

  const handleNext = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < mockPodcasts.length - 1) {
      setCurrentPodcast(mockPodcasts[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      setCurrentPodcast(mockPodcasts[currentIndex - 1]);
    }
  };

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

      {loading ? (
        <p className="text-white/70">Loading podcasts...</p>
      ) : (
        <div className={styles.podcastGrid}>
          {mockPodcasts.map(podcast => (
            <PodcastCard 
              key={podcast.id} 
              podcast={podcast}
              onPlay={handlePlay}
              isPlaying={isPlaying && currentPodcast?.id === podcast.id}
              isCurrentlyPlaying={currentPodcast?.id === podcast.id}
            />
          ))}
        </div>
      )}

      <PodcastPlayer
        podcast={currentPodcast}
        onClose={() => setCurrentPodcast(null)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={getCurrentIndex() < mockPodcasts.length - 1}
        hasPrevious={getCurrentIndex() > 0}
      />
    </div>
  );
};

export default Podcasts; 