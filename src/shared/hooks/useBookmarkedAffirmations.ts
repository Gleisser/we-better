import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bookmarked_affirmations';

export interface BookmarkedAffirmation {
  id: string;
  text: string;
  category: string;
  timestamp: number;
}

export const useBookmarkedAffirmations = () => {
  const [bookmarkedAffirmations, setBookmarkedAffirmations] = useState<BookmarkedAffirmation[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const addBookmark = (affirmation: BookmarkedAffirmation) => {
    setBookmarkedAffirmations(prev => {
      const newBookmarks = [...prev, { ...affirmation, timestamp: Date.now() }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarkedAffirmations(prev => {
      const newBookmarks = prev.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const isBookmarked = (id: string) => {
    return bookmarkedAffirmations.some(a => a.id === id);
  };

  return {
    bookmarkedAffirmations,
    addBookmark,
    removeBookmark,
    isBookmarked
  };
}; 