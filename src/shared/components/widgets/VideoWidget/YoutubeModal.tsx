import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, memo } from 'react';
import { CloseIcon } from '@/shared/components/common/icons';
import styles from './VideoWidget.module.css';
import { Video } from './types';
import { loadYouTubeAPI } from './youtubeApi';

/**
 * Extends the Window interface to include YouTube IFrame API types.
 * @global
 */
declare global {
  interface Window {
    YT: any; // YouTube API namespace
    onYouTubeIframeAPIReady: () => void;
  }
}

/**
 * Props interface for the YoutubeModal component.
 * @interface YoutubeModalProps
 * @property {boolean} isOpen - Controls the visibility of the modal
 * @property {() => void} onClose - Callback function to close the modal
 * @property {Video} video - Video object containing details and YouTube ID
 * @property {(videoId: string, progress: number) => void} onProgress - Callback for video progress updates
 */
interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
  onProgress: (videoId: string, progress: number) => void;
}

/**
 * A modal component for playing YouTube videos with progress tracking.
 * Features:
 * - Animated entrance and exit using Framer Motion
 * - YouTube IFrame API integration
 * - Progress tracking and reporting
 * - Loading state management
 * - Video metadata overlay
 * - Memoized to prevent unnecessary re-renders
 * 
 * The component handles:
 * - YouTube player initialization and cleanup
 * - Progress tracking with interval-based updates
 * - Player state management (playing, paused, ended)
 * - Error handling and loading states
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Handler for closing the modal
 * @param {Video} props.video - Video data to play
 * @param {(videoId: string, progress: number) => void} props.onProgress - Progress update handler
 * 
 * @example
 * ```tsx
 * function VideoPlayer({ video }) {
 *   const [isModalOpen, setIsModalOpen] = useState(false);
 * 
 *   const handleProgress = (videoId: string, progress: number) => {
 *     console.log(`Video ${videoId} progress: ${progress}%`);
 *   };
 * 
 *   return (
 *     <>
 *       <button onClick={() => setIsModalOpen(true)}>
 *         Play Video
 *       </button>
 *       <YoutubeModal
 *         isOpen={isModalOpen}
 *         onClose={() => setIsModalOpen(false)}
 *         video={video}
 *         onProgress={handleProgress}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export const YoutubeModal = memo(({ isOpen, onClose, video, onProgress }: YoutubeModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number>();
  const containerIdRef = useRef(`youtube-player-${video.id}`);

  /**
   * Effect hook to initialize and manage the YouTube player lifecycle.
   * Handles:
   * - YouTube API loading
   * - Player initialization
   * - Event listeners setup
   * - Progress tracking
   * - Cleanup on unmount
   */
  useEffect(() => {
    let isMounted = true;

    /**
     * Initializes the YouTube player and sets up event handlers.
     * Includes error handling and loading state management.
     */
    const initializePlayer = async () => {
      if (!isOpen || !isMounted || playerRef.current) return;

      try {
        await loadYouTubeAPI();
        
        if (!window.YT || !window.YT.Player) {
          console.log('[YT Debug] Waiting for YT API to fully initialize...');
          await new Promise<void>((resolve) => {
            const checkYT = setInterval(() => {
              if (window.YT && window.YT.Player) {
                clearInterval(checkYT);
                resolve();
              }
            }, 100);
          });
        }
        
        if (!isMounted) return;

        playerRef.current = new window.YT.Player(containerIdRef.current, {
          height: '100%',
          width: '100%',
          videoId: video.youtubeId,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            controls: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            playsinline: 1
          },
          events: {
            onReady: (event: any) => {
              console.log('[YT Debug] Player ready event', { isMounted });
              if (!isMounted) return;
              setIsLoading(false);
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              console.log('[YT Debug] Player state changed', {
                state: event.data,
                isMounted
              });
              if (!isMounted) return;

              switch (event.data) {
                case window.YT.PlayerState.PLAYING:
                  console.log('[YT Debug] Player started playing');
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                  }
                  progressIntervalRef.current = window.setInterval(() => {
                    if (playerRef.current?.getCurrentTime && isMounted) {
                      const currentTime = playerRef.current.getCurrentTime();
                      const duration = playerRef.current.getDuration();
                      if (currentTime && duration) {
                        const progress = (currentTime / duration) * 100;
                        console.log('[YT Debug] Progress update', {
                          currentTime,
                          duration,
                          progress
                        });
                        onProgress(video.id, Math.min(progress, 100));
                      }
                    }
                  }, 1000);
                  break;
                case window.YT.PlayerState.ENDED:
                  onProgress(video.id, 100);
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                  }
                  break;
                case window.YT.PlayerState.PAUSED:
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                  }
                  break;
              }
            },
            onError: (error: any) => {
              console.error('[YT Debug] Player error:', error);
              setIsLoading(false);
            }
          },
        });
      } catch (error) {
        console.error('[YT Debug] Error initializing player:', error);
        setIsLoading(false);
      }
    };

    initializePlayer();

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = undefined;
      }
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isOpen, video.id, video.youtubeId, onProgress]);

  const portalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading && (
              <div className={styles.loadingContainer}>
                <motion.div 
                  className={styles.loadingSpinner}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
            
            <div id={containerIdRef.current} className={styles.youtubeIframe} />
            
            {/* Close Button */}
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close video"
            >
              <CloseIcon className={styles.closeIcon} />
            </button>

            {/* Video Info Overlay */}
            <motion.div 
              className={styles.videoInfoOverlay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className={styles.modalVideoTitle}>{video.title}</h3>
              <p className={styles.modalVideoMeta}>
                {video.author} • {video.views} views
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(portalContent, document.getElementById('portal-root') ?? document.body);
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.video.id === nextProps.video.id &&
    prevProps.video.youtubeId === nextProps.video.youtubeId
  );
}); 