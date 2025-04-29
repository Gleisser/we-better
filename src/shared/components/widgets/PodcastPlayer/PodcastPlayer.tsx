import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayIcon, PauseIcon, SkipBackward15Icon, SkipForward15Icon,
  VolumeIcon, VolumeOffIcon, ChevronLeftIcon, ChevronRightIcon,
  ChevronUpIcon, ChevronDownIcon, CloseIcon 
} from '@/shared/components/common/icons';
import type { Podcast } from '@/services/podcastService';
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

  useEffect(() => {
    // Reset player state when podcast changes
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [podcast]);

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

  const getSpotifyEmbedUrl = (podcast: Podcast): string => {
    // If we have a spotifyId, use it to create the embed URL
    if (podcast.spotifyId) {
      return `https://open.spotify.com/embed/episode/${podcast.spotifyId}`;
    }
    
    // If we only have the external URL, extract the ID from it
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
      {/* Drawer Pull Tab - Always visible when minimized */}
      {isMinimized && (
        <button 
          onClick={toggleMinimize}
          className={styles.pullTab}
          aria-label="Show player"
        >
          <ChevronUpIcon className={styles.pullTabIcon} />
          <span className={styles.pullTabText}>Now Playing</span>
        </button>
      )}

      {/* Main Player */}
      <div className={`${styles.player} ${isMinimized ? styles.minimized : ''}`}>
        <div className={styles.content}>
          <div className={styles.podcastInfo}>
            <img 
              src={podcast.thumbnailUrl} 
              alt={podcast.title}
              className={styles.thumbnail}
            />
            <div className={styles.info}>
              <h4 className={styles.title}>{podcast.title}</h4>
              <p className={styles.description}>{podcast.description}</p>
            </div>
          </div>

          {/* Update Spotify iframe container and dimensions */}
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
              aria-label={isMinimized ? "Show player" : "Hide player"}
            >
              <ChevronDownIcon className={styles.actionIcon} />
            </button>
            <button
              className={styles.actionButton}
              onClick={onClose}
              aria-label="Close player"
            >
              <CloseIcon className={styles.actionIcon} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PodcastPlayer; 