import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ChevronDownIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SpotifyIcon 
} from '@/components/common/icons';
import { PodcastEpisode, SpotifyPlayerState } from './types';
import { MOCK_EPISODES, SPOTIFY_CONFIG } from './config';
import styles from './PodcastWidget.module.css';
import { getSpotifyAuthToken } from '@/utils/spotify';

const PodcastWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode>(MOCK_EPISODES[0]);
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

  useEffect(() => {
    if (!isSpotifyConnected) return;

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

      player.addListener('player_state_changed', state => {
        if (state) {
          setPlayerState(prev => ({
            ...prev,
            isPlaying: !state.paused,
            currentTime: state.position,
            duration: state.duration,
            spotifyPlayer: player
          }));
        }
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsLoading(false);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setDeviceId(null);
      });

      player.connect();
      setPlayer(player);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
      document.body.removeChild(script);
    };
  }, [isSpotifyConnected]);

  const handleTimeUpdate = () => {
    if (playerState.spotifyPlayer) {
      setPlayerState(prev => ({
        ...prev,
        currentTime: playerState.spotifyPlayer.getCurrentState().position,
        duration: playerState.spotifyPlayer.getCurrentState().duration
      }));
    }
  };

  const handleSkipForward = () => {
    if (playerState.spotifyPlayer) {
      playerState.spotifyPlayer.seek(playerState.currentTime + 15000); // 15 seconds in ms
    }
  };

  const handleSkipBackward = () => {
    if (playerState.spotifyPlayer) {
      playerState.spotifyPlayer.seek(playerState.currentTime - 15000);
    }
  };

  const togglePlay = async () => {
    if (!deviceId || !currentEpisode.spotifyUri) {
      setError('Playback device not ready');
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
            uris: [currentEpisode.spotifyUri]
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

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const percentageClicked = clickPosition / progressBar.offsetWidth;
    
    if (playerState.spotifyPlayer) {
      const newTime = percentageClicked * playerState.spotifyPlayer.getCurrentState().duration;
      playerState.spotifyPlayer.seek(newTime);
    }
  };

  const handleSpotifyConnect = async () => {
    const token = await getSpotifyAuthToken();
    if (token) {
      setIsSpotifyConnected(true);
    }
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

      <div className={styles.contentWrapper}>
        <motion.div className={`${styles.collapsibleContent} ${!isSpotifyConnected ? styles.blurred : ''}`}>
          <div className={styles.episodeCard}>
            <div className={styles.artwork}>
              <div className={styles.featuredBadge}>
                <span className={styles.featuredIcon}>✨</span>
                <span className={styles.featuredText}>Featured</span>
              </div>
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
              <div className={styles.episodeMeta}>
                <span className={styles.episodeAuthor}>{currentEpisode.author}</span>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.episodeDuration}>{currentEpisode.duration}</span>
              </div>
              <div className={styles.episodeCategory}>
                <span className={styles.categoryTag}>Self Improvement</span>
              </div>
            </div>

            <div className={styles.playerControls}>
              <div className={styles.mainControls}>
                <button 
                  className={`${styles.skipButton} group`}
                  onClick={handleSkipBackward}
                  aria-label="Skip 15 seconds backward"
                >
                  <ChevronLeftIcon className={styles.skipIcon} />
                  <span className={styles.skipText}>15</span>
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

                <button 
                  className={styles.skipButton}
                  onClick={handleSkipForward}
                  aria-label="Skip 15 seconds forward"
                >
                  <ChevronRightIcon className={styles.skipIcon} />
                  <span className={styles.skipText}>15</span>
                </button>
              </div>

              <div className={styles.progressSection}>
                <div 
                  className={styles.progressBar}
                  onClick={handleProgressBarClick}
                  role="slider"
                  aria-label="Audio progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={(playerState.currentTime / playerState.duration) * 100}
                >
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
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default PodcastWidget; 