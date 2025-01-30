import { Book } from './types';

export const MOCK_BOOKS: Book[] = [
  {
    id: 'book_1',
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    author: {
      name: 'James Clear',
      avatar: '/assets/images/books/authors/james-clear.jpeg',
      bio: 'Expert in habits formation and personal development'
    },
    thumbnail: '/assets/images/books/atomic-habits.webp',
    description: 'A revolutionary guide to using tiny changes to achieve remarkable results. Learn how to transform your life through small habits that compound over time.',
    rating: 4.8,
    reviewsCount: 158432,
    price: {
      current: 14.99,
      original: 27.99
    },
    pageCount: 320,
    level: 'beginner',
    category: 'self-help',
    topics: ['Habit Formation', 'Personal Development', 'Psychology', 'Productivity'],
    matchScore: 95,
    publishedAt: '2018-10-16',
    amazonUrl: 'https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299'
  }
]; 