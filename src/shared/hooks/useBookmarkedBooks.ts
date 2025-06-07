import { useState, useEffect } from 'react';
import { Book } from '@/shared/components/widgets/BookWidget/types';

interface BookmarkedBook extends Book {
  bookmarkedAt: number;
}

interface UseBookmarkedBooksResult {
  bookmarkedBooks: BookmarkedBook[];
  addBookmark: (book: Book) => void;
  removeBookmark: (bookId: string) => void;
  isBookmarked: (bookId: string) => boolean;
}

export const useBookmarkedBooks = (): UseBookmarkedBooksResult => {
  const [bookmarkedBooks, setBookmarkedBooks] = useState<BookmarkedBook[]>(() => {
    const saved = localStorage.getItem('bookmarkedBooks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarkedBooks', JSON.stringify(bookmarkedBooks));
  }, [bookmarkedBooks]);

  const addBookmark = (book: Book): void => {
    setBookmarkedBooks(prev => {
      if (prev.some(b => b.id === book.id)) return prev;
      return [...prev, { ...book, bookmarkedAt: Date.now() }];
    });
  };

  const removeBookmark = (bookId: string): void => {
    setBookmarkedBooks(prev => prev.filter(book => book.id !== bookId));
  };

  const isBookmarked = (bookId: string): boolean => {
    return bookmarkedBooks.some(book => book.id === bookId);
  };

  return {
    bookmarkedBooks,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};
