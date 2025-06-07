import { useState, useEffect } from 'react';
import type { ExtendedPodcast } from '@/shared/components/widgets/PodcastCard/PodcastCard';

export const useBookmarkedPodcasts = (): {
  bookmarkedPodcasts: ExtendedPodcast[];
  addBookmark: (podcast: ExtendedPodcast) => void;
  removeBookmark: (podcastId: string) => void;
  isBookmarked: (podcastId: string) => boolean;
} => {
  const [bookmarkedPodcasts, setBookmarkedPodcasts] = useState<ExtendedPodcast[]>(() => {
    const saved = localStorage.getItem('bookmarked_podcasts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarked_podcasts', JSON.stringify(bookmarkedPodcasts));
  }, [bookmarkedPodcasts]);

  const addBookmark = (podcast: ExtendedPodcast): void => {
    setBookmarkedPodcasts(prev => [...prev, podcast]);
  };

  const removeBookmark = (podcastId: string): void => {
    setBookmarkedPodcasts(prev => prev.filter(p => p.id !== podcastId));
  };

  const isBookmarked = (podcastId: string): boolean => {
    return bookmarkedPodcasts.some(p => p.id === podcastId);
  };

  return {
    bookmarkedPodcasts,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};
