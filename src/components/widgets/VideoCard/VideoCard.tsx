import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  PlayIcon, 
  BookmarkIcon,
  MoreVerticalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ShareIcon,
  EyeOffIcon,
  HashtagIcon,
  FlagIcon
} from '@/components/common/icons';
import { Tooltip } from '@/components/common/Tooltip';
import styles from './VideoCard.module.css';
import type { Video } from '../VideoWidget/types';
import ViewCounter from '../VideoWidget/ViewCounter';

interface VideoCardProps {
  video: Video;
  onPlay: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay }) => {
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const handleVote = (voteType: 'up' | 'down') => {
    if (voteType === 'up') {
      if (userVote === 'up') {
        setVotes(prev => prev - 1);
        setUserVote(null);
      } else {
        setVotes(prev => prev + 1);
        setUserVote('up');
      }
    } else {
      setUserVote(userVote === 'down' ? null : 'down');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: `https://youtube.com/watch?v=${video.youtubeId}`
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const handleOptionClick = (action: string) => {
    switch (action) {
      case 'share':
        handleShare();
        break;
      case 'hide':
        // Handle hide
        break;
      case 'follow':
        // Handle follow
        break;
      case 'block':
        // Handle block
        break;
      case 'notInterested':
        // Handle not interested
        break;
    }
    setShowMoreMenu(false);
  };

  useEffect(() => {
    if (showMoreMenu && moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showMoreMenu]);

  useEffect(() => {
    if (showMoreMenu) {
      const handleScroll = () => setShowMoreMenu(false);
      const handleResize = () => setShowMoreMenu(false);

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showMoreMenu]);

  return (
    <div className={styles.card}>
      <div className={styles.thumbnailSection}>
        <img 
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          className={styles.thumbnail}
        />
        
        <div className={styles.overlay}>
          <button 
            className={styles.playButton}
            onClick={onPlay}
          >
            <PlayIcon className={styles.playIcon} />
          </button>

          <div className={styles.duration}>{video.duration}</div>

          {video.badge && (
            <div className={`${styles.badge} ${styles[video.badge]}`}>
              {video.badge === 'trending' ? 'Trending' : 'New'}
            </div>
          )}
        </div>

        <div className={styles.topActions}>
          <Tooltip content={isBookmarked ? "Remove bookmark" : "Bookmark video"}>
            <button
              className={`${styles.iconButton} ${isBookmarked ? styles.bookmarked : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
            >
              <BookmarkIcon className={styles.actionIcon} filled={isBookmarked} />
            </button>
          </Tooltip>

          <div className={styles.moreContainer}>
            <Tooltip content="More options">
              <button 
                ref={moreButtonRef}
                className={styles.iconButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreMenu(!showMoreMenu);
                }}
              >
                <MoreVerticalIcon className={styles.actionIcon} />
              </button>
            </Tooltip>

            {showMoreMenu && createPortal(
              <>
                <div 
                  className={styles.menuPositioner}
                  style={{
                    top: menuPosition.top,
                    right: menuPosition.right,
                  }}
                >
                  <div className={styles.moreMenu}>
                    <button 
                      className={styles.moreOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick('share');
                      }}
                    >
                      <ShareIcon className={styles.optionIcon} />
                      <span>Share via</span>
                    </button>

                    <button 
                      className={styles.moreOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick('hide');
                      }}
                    >
                      <EyeOffIcon className={styles.optionIcon} />
                      <span>Hide</span>
                    </button>

                    <button 
                      className={styles.moreOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick('follow');
                      }}
                    >
                      <BookmarkIcon className={styles.optionIcon} />
                      <span>Follow {video.author}</span>
                    </button>

                    <div className={styles.menuDivider} />

                    <button 
                      className={styles.moreOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick('block');
                      }}
                    >
                      <EyeOffIcon className={styles.optionIcon} />
                      <span>Don't show posts from {video.author}</span>
                    </button>

                    {video.tags.map(tag => (
                      <button 
                        key={tag}
                        className={styles.moreOption}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick('notInterested');
                        }}
                      >
                        <HashtagIcon className={styles.optionIcon} />
                        <span>Not interested in #{tag}</span>
                      </button>
                    ))}

                    <div className={styles.menuDivider} />

                    <button 
                      className={styles.moreOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick('report');
                      }}
                    >
                      <FlagIcon className={styles.optionIcon} />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
                <div 
                  className={styles.menuOverlay} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreMenu(false);
                  }} 
                />
              </>,
              document.body
            )}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{video.title}</h2>
        <p className={styles.description}>{video.description}</p>

        <div className={styles.metadata}>
          <div className={styles.author}>{video.author}</div>
          <ViewCounter value={video.views} className={styles.views} />
          <div className={styles.category}>
            {video.category} / {video.subCategory || video.tags[video.tags.length - 1]}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.voteContainer}>
            <Tooltip content="Upvote">
              <button
                className={`${styles.voteButton} ${styles.upvoteButton} ${
                  userVote === 'up' ? styles.votedUp : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote('up');
                }}
              >
                <ChevronUpIcon className={styles.voteIcon} />
                <span className={styles.voteCount}>{votes > 0 ? votes : ''}</span>
              </button>
            </Tooltip>
            
            <Tooltip content="Downvote">
              <button
                className={`${styles.voteButton} ${styles.downvoteButton} ${
                  userVote === 'down' ? styles.votedDown : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote('down');
                }}
              >
                <ChevronDownIcon className={styles.voteIcon} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard; 