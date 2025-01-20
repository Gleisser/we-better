import { useState, useEffect } from 'react';
import type { Podcast } from '@/pages/Podcasts/mockPodcasts';

export const useBookmarkedPodcasts = () => {
  const [bookmarkedPodcasts, setBookmarkedPodcasts] = useState<Podcast[]>(() => {
    const saved = localStorage.getItem('bookmarked_podcasts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarked_podcasts', JSON.stringify(bookmarkedPodcasts));
  }, [bookmarkedPodcasts]);

  const addBookmark = (podcast: Podcast) => {
    setBookmarkedPodcasts(prev => [...prev, podcast]);
  };

  const removeBookmark = (podcastId: string) => {
    setBookmarkedPodcasts(prev => prev.filter(p => p.id !== podcastId));
  };

  const isBookmarked = (podcastId: string) => {
    return bookmarkedPodcasts.some(p => p.id === podcastId);
  };

  return {
    bookmarkedPodcasts,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
}; 