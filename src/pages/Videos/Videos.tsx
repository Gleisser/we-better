import React, { useState } from 'react';
import styles from './Videos.module.css';
import { ChevronDownIcon, SettingsIcon } from '@/components/common/icons';
import { YoutubeModal } from '@/components/widgets/VideoWidget/YoutubeModal';
import type { Video } from '@/components/widgets/VideoWidget/types';
import VideoCard from '@/components/widgets/VideoCard/VideoCard';

// Mock data structure similar to VideoWidget but expanded
const mockVideos: Video[] = [
  {
    id: '1',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'How to Build a Personal Brand as a Developer',
    description: 'Learn the essential steps to create and grow your personal brand in the tech industry.',
    duration: '12:34',
    views: 15400,
    author: 'TechMaster Pro',
    category: 'Career',
    subCategory: 'Personal Growth',
    rating: 4.8,
    badge: 'trending',
    publishedAt: '2024-01-15',
    tags: ['career', 'branding', 'development']
  },
  {
    id: '2',
    youtubeId: 'M7lc1UVf-VE',
    title: '10 VS Code Extensions Every Developer Needs',
    description: 'Boost your productivity with these must-have VS Code extensions.',
    duration: '8:45',
    views: 42300,
    author: 'CodePro',
    category: 'Tools',
    subCategory: 'Development',
    rating: 4.9,
    badge: 'new',
    publishedAt: '2024-01-20',
    tags: ['vscode', 'tools', 'productivity']
  },
  // Add more mock videos as needed...
];

const Videos = () => {
  const [loading, setLoading] = useState(false);
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [showOrderBy, setShowOrderBy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('Latest');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

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

      {loading ? (
        <p className="text-white/70">Loading videos...</p>
      ) : (
        <div className={styles.videoGrid}>
          {mockVideos.map(video => (
            <VideoCard 
              key={video.id} 
              video={video}
              onPlay={() => setSelectedVideo(video)}
            />
          ))}
        </div>
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