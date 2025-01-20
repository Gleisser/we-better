import React, { useState } from 'react';
import { 
  PlayIcon, 
  BookmarkIcon,
  MoreVerticalIcon,
  ChevronUpIcon,
  ChevronDownIcon
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

  const handleVote = (voteType: 'up' | 'down') => {
    if (userVote === voteType) {
      setVotes(prev => voteType === 'up' ? prev - 1 : prev + 1);
      setUserVote(null);
    } else {
      if (userVote) {
        setVotes(prev => userVote === 'up' ? prev - 2 : prev + 2);
      }
      setVotes(prev => voteType === 'up' ? prev + 1 : prev - 1);
      setUserVote(voteType);
    }
  };

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
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <BookmarkIcon className={styles.actionIcon} filled={isBookmarked} />
            </button>
          </Tooltip>

          <Tooltip content="More options">
            <button className={styles.iconButton}>
              <MoreVerticalIcon className={styles.actionIcon} />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{video.title}</h2>
        <p className={styles.description}>{video.description}</p>

        <div className={styles.metadata}>
          <div className={styles.author}>{video.author}</div>
          <ViewCounter value={video.views} className={styles.views} />
          <div className={styles.category}>
            {video.category} / {video.subCategory}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.voteContainer}>
            <Tooltip content="Upvote">
              <button
                className={`${styles.voteButton} ${userVote === 'up' ? styles.votedUp : ''}`}
                onClick={() => handleVote('up')}
              >
                <ChevronUpIcon className={styles.voteIcon} />
                <span className={styles.voteCount}>{votes > 0 ? votes : ''}</span>
              </button>
            </Tooltip>
            
            <Tooltip content="Downvote">
              <button
                className={`${styles.voteButton} ${userVote === 'down' ? styles.votedDown : ''}`}
                onClick={() => handleVote('down')}
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