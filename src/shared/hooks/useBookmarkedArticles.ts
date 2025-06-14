import { useState, useEffect } from 'react';
import { Article } from '@/shared/components/widgets/ArticleWidget/types';

interface BookmarkedArticle extends Article {
  bookmarkedAt: number;
}

interface UseBookmarkedArticlesResult {
  bookmarkedArticles: BookmarkedArticle[];
  addBookmark: (article: Article) => void;
  removeBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
}

export const useBookmarkedArticles = (): UseBookmarkedArticlesResult => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<BookmarkedArticle[]>(() => {
    const saved = localStorage.getItem('bookmarkedArticles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarkedArticles));
  }, [bookmarkedArticles]);

  const addBookmark = (article: Article): void => {
    setBookmarkedArticles(prev => {
      if (prev.some(a => a.id === article.id)) return prev;
      return [...prev, { ...article, bookmarkedAt: Date.now() }];
    });
  };

  const removeBookmark = (articleId: string): void => {
    setBookmarkedArticles(prev => prev.filter(article => article.id !== articleId));
  };

  const isBookmarked = (articleId: string): boolean => {
    return bookmarkedArticles.some(article => article.id === articleId);
  };

  return {
    bookmarkedArticles,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};
