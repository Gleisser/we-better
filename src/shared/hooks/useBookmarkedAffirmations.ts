import { useState } from 'react';
import { MOCK_AFFIRMATIONS } from '@/utils/mockData/bookmarks';

const STORAGE_KEY = 'bookmarked_affirmations';

export interface BookmarkedAffirmation {
  id: string;
  text: string;
  category: string;
  timestamp: number;
}

interface UseBookmarkedAffirmationsResult {
  bookmarkedAffirmations: BookmarkedAffirmation[];
  addBookmark: (affirmation: BookmarkedAffirmation) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

export const useBookmarkedAffirmations = (): UseBookmarkedAffirmationsResult => {
  const [bookmarkedAffirmations, setBookmarkedAffirmations] = useState<BookmarkedAffirmation[]>(
    () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with mock data for development
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_AFFIRMATIONS));
      return MOCK_AFFIRMATIONS;
    }
  );

  const addBookmark = (affirmation: BookmarkedAffirmation): void => {
    setBookmarkedAffirmations(prev => {
      const newBookmarks = [...prev, { ...affirmation, timestamp: Date.now() }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const removeBookmark = (id: string): void => {
    setBookmarkedAffirmations(prev => {
      const newBookmarks = prev.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const isBookmarked = (id: string): boolean => {
    return bookmarkedAffirmations.some(a => a.id === id);
  };

  return {
    bookmarkedAffirmations,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};
