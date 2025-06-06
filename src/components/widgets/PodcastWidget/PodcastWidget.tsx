import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ChevronDownIcon, 
  SkipBackward15Icon,
  SkipForward15Icon,
  SpotifyIcon,
  VolumeIcon
} from '@/components/common/icons';
import { CircularProgress } from './CircularProgress';
import { podcastService, type Podcast } from '@/services/podcastService';
import styles from './PodcastWidget.module.css';
import { getSpotifyAuthToken } from '@/utils/spotify';

interface SpotifyPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  spotifyPlayer?: Spotify.Player;
}

const PodcastWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });
  const [currentEpisode, setCurrentEpisode] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Podcast[]>([]);
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(() => {
    const token = localStorage.getItem('spotify_token');
    const expiry = localStorage.getItem('spotify_token_expiry');
    return token && expiry && Date.now() < parseInt(expiry);
  });
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
  const volumeSliderRef = useRef<HTMLDivElement>(null);

  // Fetch podcasts from API
  const fetchPodcasts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await podcastService.getPodcasts({
        sort: 'publishedAt:desc',
        pagination: {
          page: 1,
          pageSize: 5 // Get latest 5 episodes
        }
      });
      
      const mappedPodcasts = podcastService.mapPodcastResponse(response);
      setEpisodes(mappedPodcasts);
      if (!currentEpisode && mappedPodcasts.length > 0) {
        setCurrentEpisode(mappedPodcasts[0]);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      setError('Failed to load podcasts');
    } finally {
      setIsLoading(false);
    }
  }, [currentEpisode]);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  useEffect(() => {
    if (!isSpotifyConnected || !currentEpisode) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'WeBetter Podcast Player',
        getOAuthToken: cb => { 
          getSpotifyAuthToken().then(token => {
            if (token) cb(token);
          });
        },
        volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsLoading(false);
      });

      player.addListener('player_state_changed', state => {
        if (state) {
          setPlayerState(prev => ({
            ...prev,
            isPlaying: !state.paused,
            currentTime: state.position / 1000,
            duration: state.duration / 1000,
            spotifyPlayer: player
          }));
        }
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize:', message);
        setError('Failed to initialize player');
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate:', message);
        setError('Authentication failed');
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Failed to validate account:', message);
        setError('Premium account required');
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback:', message);
        setError('Playback failed');
      });

      player.connect().then(success => {
        if (success) {
          console.log('Successfully connected to Spotify');
        }
      });

      return () => {
        player.disconnect();
      };
    };

    return () => {
      script.remove();
    };
  }, [isSpotifyConnected, currentEpisode]);

  useEffect(() => {
    if (!player) return;

    const stateInterval = setInterval(async () => {
      const state = await player.getCurrentState();
      if (state) {
        setPlayerState(prev => ({
          ...prev,
          currentTime: state.position / 1000,
          duration: state.duration / 1000
        }));
      }
    }, 1000);

    return () => clearInterval(stateInterval);
  }, [player]);

  const handleSkipForward = async () => {
    if (!playerState.spotifyPlayer) return;

    try {
      // Convert current time to milliseconds and add 15 seconds
      const currentMs = Math.floor(playerState.currentTime * 1000);
      const durationMs = Math.floor(playerState.duration * 1000);
      const newPosition = Math.min(currentMs + 15000, durationMs);
      
      await playerState.spotifyPlayer.seek(newPosition);
    } catch (err) {
      console.error('Failed to skip forward:', err);
      setError('Failed to skip forward');
    }
  };

  const handleSkipBackward = async () => {
    if (!playerState.spotifyPlayer) return;

    try {
      // Convert current time to milliseconds and subtract 15 seconds
      const currentMs = Math.floor(playerState.currentTime * 1000);
      const newPosition = Math.max(currentMs - 15000, 0);
      
      await playerState.spotifyPlayer.seek(newPosition);
    } catch (err) {
      console.error('Failed to skip backward:', err);
      setError('Failed to skip backward');
    }
  };

  // Add this helper function to get Spotify URI
  const getSpotifyUri = (podcast: Podcast): string => {
    // If we have a spotifyId, use it to create the URI
    if (podcast.spotifyId) {
      return `spotify:episode:${podcast.spotifyId}`;
    }
    
    // If we only have the external URL, extract the ID from it
    if (podcast.externalUrl) {
      const match = podcast.externalUrl.match(/episode\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        return `spotify:episode:${match[1]}`;
      }
    }
    
    return '';
  };

  const togglePlay = async () => {
    if (!deviceId || !currentEpisode) {
      setError('Playback device not ready');
      return;
    }

    const spotifyUri = getSpotifyUri(currentEpisode);
    if (!spotifyUri) {
      setError('Invalid podcast URI');
      return;
    }

    try {
      const token = await getSpotifyAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      if (!playerState.isPlaying) {
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [spotifyUri]
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Playback error:', error);
          setError(error.error?.message || 'Failed to start playback');
          return;
        }

        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      } else {
        const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Pause error:', error);
          setError(error.error?.message || 'Failed to pause playback');
          return;
        }

        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      }
    } catch (err) {
      console.error('Playback control error:', err);
      setError('Failed to control playback');
    }
  };

  const handleSeek = async (time: number) => {
    if (!playerState.spotifyPlayer) return;
    
    try {
      // Convert time to milliseconds for Spotify API
      const positionMs = Math.floor(time * 1000);
      // Update local state immediately
      setPlayerState(prev => ({
        ...prev,
        currentTime: time
      }));
      await playerState.spotifyPlayer.seek(positionMs);
    } catch (err) {
      console.error('Failed to seek:', err);
      setError('Failed to update playback position');
    }
  };

  // Add handler for linear progress bar clicks
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * playerState.duration;
    handleSeek(newTime);
  };

  const handleSpotifyConnect = async () => {
    const token = await getSpotifyAuthToken();
    if (token) {
      setIsSpotifyConnected(true);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    if (!playerState.spotifyPlayer) return;

    try {
      await playerState.spotifyPlayer.setVolume(newVolume);
      setPlayerState(prev => ({ ...prev, volume: newVolume }));
      
      // Update mute state
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
      
      // Store as previous volume if not muted
      if (newVolume > 0) {
        setPreviousVolume(newVolume);
      }
    } catch (err) {
      console.error('Failed to change volume:', err);
      setError('Failed to change volume');
    }
  };

  const toggleMute = async () => {
    if (!playerState.spotifyPlayer) return;

    try {
      if (isMuted) {
        // Unmute: restore previous volume
        const volumeToRestore = previousVolume || 0.5; // Fallback to 0.5 if no previous volume
        await playerState.spotifyPlayer.setVolume(volumeToRestore);
        setPlayerState(prev => ({ ...prev, volume: volumeToRestore }));
        setIsMuted(false);
      } else {
        // Mute: save current volume and set to 0
        if (playerState.volume > 0) {
          setPreviousVolume(playerState.volume);
        }
        await playerState.spotifyPlayer.setVolume(0);
        setPlayerState(prev => ({ ...prev, volume: 0 }));
        setIsMuted(true);
      }
    } catch (err) {
      console.error('Failed to toggle mute:', err);
      setError('Failed to toggle mute');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeSliderRef.current && !volumeSliderRef.current.contains(event.target as Node)) {
        setIsVolumeSliderVisible(false);
      }
    };

    if (isVolumeSliderVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVolumeSliderVisible]);

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = progressBar.offsetWidth;
    const percentage = (x / width) * 100;
    
    // Update the preview progress
    progressBar.style.setProperty('--preview-progress', `${percentage}%`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🎙️</span>
            <span className={styles.headerText}>Featured Podcast</span>
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

      <motion.div
        className={styles.collapsibleContent}
        animate={{
          height: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1
        }}
      >
        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>Loading podcast...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : currentEpisode ? (
            <div className={styles.playerSection}>
              <button 
                className={styles.skipButton}
                onClick={handleSkipBackward}
                aria-label="Skip 15 seconds backward"
              >
                <SkipBackward15Icon className={styles.skipIcon} />
              </button>

              <div className={styles.circularPlayer}>
                <div className={styles.artworkContainer}>
                  <CircularProgress
                    progress={playerState.currentTime}
                    duration={playerState.duration}
                    onSeek={handleSeek}
                  />
                  <div className={styles.artworkCircle}>
                    <div className={styles.artworkPlayButton}>
                      <div 
                        className={styles.artworkPlayIcon}
                        onClick={togglePlay}
                        role="button"
                        aria-label={playerState.isPlaying ? "Pause episode" : "Play episode"}
                      >
                        {playerState.isPlaying ? (
                          <PauseIcon className="w-full h-full" />
                        ) : (
                          <PlayIcon className="w-full h-full" />
                        )}
                      </div>
                    </div>
                    <img 
                      src={currentEpisode.thumbnailUrl}
                      alt={currentEpisode.title}
                      className={styles.artworkImage}
                    />
                  </div>
                </div>
              </div>

              <button 
                className={styles.skipButton}
                onClick={handleSkipForward}
                aria-label="Skip 15 seconds forward"
              >
                <SkipForward15Icon className={styles.skipIcon} />
              </button>
            </div>
          ) : null}

          <div className={styles.episodeInfo}>
            <h3 className={styles.episodeTitle}>{currentEpisode?.title}</h3>
            <div className={styles.episodeMeta}>
              <span className={styles.episodeAuthor}>{currentEpisode?.author}</span>
              <span className={styles.metaDivider}>•</span>
              <span className={styles.episodeDuration}>{currentEpisode?.duration}</span>
            </div>
          </div>

          <div className={styles.waveformSection}>
            <span className={styles.timeInfo}>{formatTime(playerState.currentTime)}</span>
            <div className={styles.waveform}>
              {[...Array(40)].map((_, i) => {
                const isCenter = i > 15 && i < 25;
                return (
                  <div 
                    key={i}
                    className={styles.waveformBar}
                    data-playing={playerState.isPlaying}
                    data-center={isCenter}
                    style={{
                      height: `${20 + Math.sin(i * 0.3) * 60}%`,
                      animationDelay: `${i * 0.05}s`,
                      opacity: isCenter ? 0.3 : 0.8
                    }}
                  />
                );
              })}
            </div>
            <span className={styles.timeInfo}>{formatTime(playerState.duration)}</span>
          </div>
        </div>
      </motion.div>

      {!isSpotifyConnected && (
        <div className={styles.spotifyOverlay}>
          <button 
            className={styles.spotifyConnectButton}
            onClick={handleSpotifyConnect}
          >
            <SpotifyIcon className={styles.spotifyIcon} />
            Connect to Spotify
          </button>
          <p className={styles.spotifyHint}>
            Connect to Spotify to listen to podcast episodes
          </p>
        </div>
      )}
    </div>
  );
};

const formatTime = (seconds: number): string => {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // If duration is more than an hour, show HH:MM:SS
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  // Otherwise show MM:SS
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default PodcastWidget; 