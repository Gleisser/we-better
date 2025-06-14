import { useState } from 'react';

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
      return stored ? JSON.parse(stored) : [];
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
