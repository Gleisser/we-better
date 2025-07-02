import { useState } from 'react';
import { MOCK_QUOTES } from '@/utils/mockData/bookmarks';

const STORAGE_KEY = 'bookmarked_quotes';

export interface BookmarkedQuote {
  id: string;
  text: string;
  author: string;
  theme: string;
  timestamp: number;
}

interface UseBookmarkedQuotesResult {
  bookmarkedQuotes: BookmarkedQuote[];
  addBookmark: (quote: BookmarkedQuote) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

export const useBookmarkedQuotes = (): UseBookmarkedQuotesResult => {
  const [bookmarkedQuotes, setBookmarkedQuotes] = useState<BookmarkedQuote[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with mock data for development
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_QUOTES));
    return MOCK_QUOTES;
  });

  const addBookmark = (quote: BookmarkedQuote): void => {
    setBookmarkedQuotes(prev => {
      const newBookmarks = [...prev, { ...quote, timestamp: Date.now() }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const removeBookmark = (id: string): void => {
    setBookmarkedQuotes(prev => {
      const newBookmarks = prev.filter(q => q.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const isBookmarked = (id: string): boolean => {
    return bookmarkedQuotes.some(q => q.id === id);
  };

  return {
    bookmarkedQuotes,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};
