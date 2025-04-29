import { useState, useEffect } from 'react';
import { Article } from '@/shared/components/widgets/ArticleWidget/types';

interface BookmarkedArticle extends Article {
  bookmarkedAt: number;
}

export const useBookmarkedArticles = () => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<BookmarkedArticle[]>(() => {
    const saved = localStorage.getItem('bookmarkedArticles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarkedArticles));
  }, [bookmarkedArticles]);

  const addBookmark = (article: Article) => {
    setBookmarkedArticles(prev => {
      if (prev.some(a => a.id === article.id)) return prev;
      return [...prev, { ...article, bookmarkedAt: Date.now() }];
    });
  };

  const removeBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => prev.filter(article => article.id !== articleId));
  };

  const isBookmarked = (articleId: string) => {
    return bookmarkedArticles.some(article => article.id === articleId);
  };

  return {
    bookmarkedArticles,
    addBookmark,
    removeBookmark,
    isBookmarked
  };
}; 