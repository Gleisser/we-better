import { useState, useEffect } from 'react';
import { Book } from '@/components/widgets/BookWidget/types';

interface BookmarkedBook extends Book {
  bookmarkedAt: number;
}

export const useBookmarkedBooks = () => {
  const [bookmarkedBooks, setBookmarkedBooks] = useState<BookmarkedBook[]>(() => {
    const saved = localStorage.getItem('bookmarkedBooks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarkedBooks', JSON.stringify(bookmarkedBooks));
  }, [bookmarkedBooks]);

  const addBookmark = (book: Book) => {
    setBookmarkedBooks(prev => {
      if (prev.some(b => b.id === book.id)) return prev;
      return [...prev, { ...book, bookmarkedAt: Date.now() }];
    });
  };

  const removeBookmark = (bookId: string) => {
    setBookmarkedBooks(prev => prev.filter(book => book.id !== bookId));
  };

  const isBookmarked = (bookId: string) => {
    return bookmarkedBooks.some(book => book.id === bookId);
  };

  return {
    bookmarkedBooks,
    addBookmark,
    removeBookmark,
    isBookmarked
  };
}; 