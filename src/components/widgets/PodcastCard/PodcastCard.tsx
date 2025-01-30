import React from 'react';
import { PlayIcon, BookmarkIcon, ChevronUpIcon, ChevronDownIcon } from '@/components/common/icons';
import { Tooltip } from '@/components/common/Tooltip';
import { useBookmarkedPodcasts } from '@/hooks/useBookmarkedPodcasts';
import type { Podcast } from '@/pages/Podcasts/mockPodcasts';
import styles from './PodcastCard.module.css';

interface PodcastCardProps {
  podcast: Podcast;
  onPlay: (podcast: Podcast) => void;
  isPlaying: boolean;
  isCurrentlyPlaying: boolean;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ 
  podcast, 
  onPlay, 
  isPlaying,
  isCurrentlyPlaying 
}) => {
  const [userVote, setUserVote] = React.useState<'up' | 'down' | null>(null);
  const [votes, setVotes] = React.useState(0);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedPodcasts();

  const formatListenCount = (count: number): string => {
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  };

  const handleVote = (vote: 'up' | 'down') => {
    if (userVote === vote) {
      setUserVote(null);
      setVotes(vote === 'up' ? votes - 1 : votes + 1);
    } else {
      if (userVote) {
        setVotes(vote === 'up' ? votes + 2 : votes - 2);
      } else {
        setVotes(vote === 'up' ? votes + 1 : votes - 1);
      }
      setUserVote(vote);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.thumbnailSection}>
        <img 
          src={podcast.thumbnail} 
          alt={podcast.title}
          className={styles.thumbnail}
        />
        <button 
          className={styles.playButton}
          onClick={() => onPlay(podcast)}
        >
          <PlayIcon className={styles.playIcon} />
        </button>
        {isCurrentlyPlaying && (
          <div className={styles.nowPlaying}>
            <span className={styles.nowPlayingText}>Now Playing</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{podcast.title}</h3>
          <p className={styles.episode}>{podcast.episode}</p>
        </div>

        <div className={styles.meta}>
          <span className={styles.author}>{podcast.author}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.duration}>{podcast.duration}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.listens}>{formatListenCount(podcast.listens)} listens</span>
        </div>

        <div className={styles.categories}>
          <span className={styles.category}>{podcast.category}</span>
          <span className={styles.subCategory}>{podcast.subCategory}</span>
        </div>

        <div className={styles.actions}>
          <div className={styles.leftActions}>
            <Tooltip content={isBookmarked(podcast.id) ? "Remove bookmark" : "Bookmark podcast"}>
              <button
                className={`${styles.iconButton} ${isBookmarked(podcast.id) ? styles.bookmarked : ''}`}
                onClick={() => {
                  if (isBookmarked(podcast.id)) {
                    removeBookmark(podcast.id);
                  } else {
                    addBookmark(podcast);
                  }
                }}
              >
                <BookmarkIcon 
                  className={styles.actionIcon} 
                  filled={isBookmarked(podcast.id)}
                />
              </button>
            </Tooltip>
          </div>

          <div className={styles.voteContainer}>
            <Tooltip content="Upvote">
              <button
                className={`${styles.voteButton} ${styles.upvoteButton} ${
                  userVote === 'up' ? styles.votedUp : ''
                }`}
                onClick={() => handleVote('up')}
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

export default PodcastCard; 