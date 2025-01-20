import React, { useState, useRef } from 'react';
import { 
  PlayIcon, PauseIcon, SkipBackward15Icon, SkipForward15Icon,
  VolumeIcon, VolumeOffIcon, ChevronLeftIcon, ChevronRightIcon,
  MinimizeIcon, MaximizeIcon, CloseIcon 
} from '@/components/common/icons';
import type { Podcast } from '@/pages/Podcasts/mockPodcasts';
import styles from './PodcastPlayer.module.css';

interface PodcastPlayerProps {
  podcast: Podcast | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  podcast,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    if (value === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    onClose();
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!podcast) return null;

  return (
    <div className={`${styles.player} ${isMinimized ? styles.minimized : ''}`}>
      <div className={styles.content}>
        <div className={styles.podcastInfo}>
          <img 
            src={podcast.thumbnail} 
            alt={podcast.title}
            className={styles.thumbnail}
          />
          <div className={styles.info}>
            <h4 className={styles.title}>{podcast.title}</h4>
            <p className={styles.episode}>{podcast.episode}</p>
          </div>
        </div>

        <div className={`${styles.controls} ${isMinimized ? styles.hidden : ''}`}>
          {hasPrevious && (
            <button 
              className={styles.skipButton}
              onClick={onPrevious}
            >
              <ChevronLeftIcon className={styles.skipIcon} />
            </button>
          )}

          <button 
            className={styles.skipButton}
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime -= 15;
              }
            }}
          >
            <SkipBackward15Icon className={styles.skipIcon} />
          </button>

          <button 
            className={styles.playButton}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <PauseIcon className={styles.playIcon} />
            ) : (
              <PlayIcon className={styles.playIcon} />
            )}
          </button>

          <button 
            className={styles.skipButton}
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime += 15;
              }
            }}
          >
            <SkipForward15Icon className={styles.skipIcon} />
          </button>

          {hasNext && (
            <button 
              className={styles.skipButton}
              onClick={onNext}
            >
              <ChevronRightIcon className={styles.skipIcon} />
            </button>
          )}
        </div>

        <div className={`${styles.timeControls} ${isMinimized ? styles.hidden : ''}`}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className={styles.timeSlider}
          />
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>

        <div className={`${styles.volumeControls} ${isMinimized ? styles.hidden : ''}`}>
          <button 
            className={styles.volumeButton}
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeOffIcon className={styles.volumeIcon} />
            ) : (
              <VolumeIcon className={styles.volumeIcon} />
            )}
          </button>
          
          {isVolumeSliderVisible && (
            <div 
              className={styles.volumeSliderContainer}
              ref={volumeSliderRef}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
              />
            </div>
          )}
        </div>

        <div className={styles.playerActions}>
          <button
            className={styles.actionButton}
            onClick={toggleMinimize}
            aria-label={isMinimized ? "Maximize player" : "Minimize player"}
          >
            {isMinimized ? (
              <MaximizeIcon className={styles.actionIcon} />
            ) : (
              <MinimizeIcon className={styles.actionIcon} />
            )}
          </button>
          <button
            className={styles.actionButton}
            onClick={handleClose}
            aria-label="Close player"
          >
            <CloseIcon className={styles.actionIcon} />
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={podcast.spotifyUri}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
      />
    </div>
  );
};

export default PodcastPlayer; 