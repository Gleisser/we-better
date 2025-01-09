import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ChevronDownIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@/components/common/icons';
import { PodcastEpisode, PlayerState } from './types';
import { MOCK_EPISODES, DEFAULT_CONFIG } from './config';
import styles from './PodcastWidget.module.css';

const PodcastWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode>(MOCK_EPISODES[0]);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: DEFAULT_CONFIG.defaultVolume
  });

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const togglePlay = () => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🎙️</span>
            <span className={styles.headerText}>Podcast of the Day</span>
          </div>

          <button
            className={`${styles.collapseButton} ${isCollapsed ? styles.collapsed : ''}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand podcast widget" : "Collapse podcast widget"}
          >
            <ChevronDownIcon className={styles.collapseIcon} />
          </button>
        </div>
      </div>

      <motion.div className={styles.collapsibleContent}>
        <div className={styles.episodeCard}>
          <div className={styles.artwork}>
            <img 
              src={currentEpisode.artwork} 
              alt={currentEpisode.title}
              className={styles.artworkImage}
              onError={(e) => {
                (e.target as HTMLImageElement).style.background = 'linear-gradient(45deg, #1a1a1a, #2a2a2a)';
                (e.target as HTMLImageElement).style.opacity = '0.5';
              }}
            />
          </div>

          <div className={styles.episodeInfo}>
            <h3 className={styles.episodeTitle}>{currentEpisode.title}</h3>
            <p className={styles.episodeAuthor}>{currentEpisode.author}</p>
          </div>

          <div className={styles.playerControls}>
            <div className={styles.mainControls}>
              <button className={styles.skipButton}>
                <ChevronLeftIcon className={styles.skipIcon} />
              </button>
              
              <button 
                className={styles.playButton}
                onClick={togglePlay}
                aria-label={playerState.isPlaying ? "Pause episode" : "Play episode"}
              >
                {playerState.isPlaying ? (
                  <PauseIcon className={styles.playerIcon} />
                ) : (
                  <PlayIcon className={styles.playerIcon} />
                )}
              </button>

              <button className={styles.skipButton}>
                <ChevronRightIcon className={styles.skipIcon} />
              </button>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progress}
                  style={{ width: `${(playerState.currentTime / playerState.duration) * 100}%` }}
                />
              </div>
              <div className={styles.timeInfo}>
                <span>{formatTime(playerState.currentTime)}</span>
                <span>{formatTime(playerState.duration)}</span>
              </div>
            </div>

            <div className={styles.waveform}>
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i}
                  className={styles.waveformBar}
                  data-playing={playerState.isPlaying}
                  style={{
                    height: `${30 + Math.random() * 70}%`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default PodcastWidget; 