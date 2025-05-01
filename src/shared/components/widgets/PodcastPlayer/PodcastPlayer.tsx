import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, CloseIcon } from '@/shared/components/common/icons';
import type { ExtendedPodcast } from '../PodcastCard/PodcastCard';
import styles from './PodcastPlayer.module.css';

interface PodcastPlayerProps {
  podcast: ExtendedPodcast | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({ podcast, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = (): void => {
    setIsMinimized(!isMinimized);
  };

  const getSpotifyEmbedUrl = (podcast: ExtendedPodcast): string => {
    if (podcast.spotifyId) {
      return `https://open.spotify.com/embed/episode/${podcast.spotifyId}`;
    }

    if (podcast.externalUrl) {
      const match = podcast.externalUrl.match(/episode\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        return `https://open.spotify.com/embed/episode/${match[1]}`;
      }
    }

    return '';
  };

  if (!podcast) return null;

  const embedUrl = getSpotifyEmbedUrl(podcast);

  return (
    <>
      {isMinimized && (
        <button onClick={toggleMinimize} className={styles.pullTab} aria-label="Show player">
          <ChevronUpIcon className={styles.pullTabIcon} />
          <span className={styles.pullTabText}>Now Playing</span>
        </button>
      )}

      <div className={`${styles.player} ${isMinimized ? styles.minimized : ''}`}>
        <div className={styles.content}>
          <div className={styles.podcastInfo}>
            <img src={podcast.thumbnailUrl} alt={podcast.title} className={styles.thumbnail} />
            <div className={styles.info}>
              <h4 className={styles.title}>{podcast.title}</h4>
              <p className={styles.description}>{podcast.description}</p>
            </div>
          </div>

          <div className={styles.spotifyPlayer}>
            <iframe
              src={embedUrl}
              width="100%"
              height="80"
              frameBorder="0"
              allowTransparency={true}
              allow="encrypted-media"
              title={podcast.title}
              style={{ minWidth: '100%' }}
            />
          </div>

          <div className={styles.playerActions}>
            <button
              className={styles.actionButton}
              onClick={toggleMinimize}
              aria-label={isMinimized ? 'Show player' : 'Hide player'}
            >
              <ChevronDownIcon className={styles.actionIcon} />
            </button>
            <button className={styles.actionButton} onClick={onClose} aria-label="Close player">
              <CloseIcon className={styles.actionIcon} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PodcastPlayer;
