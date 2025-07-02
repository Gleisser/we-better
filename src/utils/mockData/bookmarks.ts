import type { BookmarkedQuote } from '@/shared/hooks/useBookmarkedQuotes';
import type { BookmarkedAffirmation } from '@/shared/hooks/useBookmarkedAffirmations';

export const MOCK_QUOTES: BookmarkedQuote[] = [
  {
    id: 'quote-1',
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    theme: 'success',
    timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
  },
  {
    id: 'quote-2',
    text: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    theme: 'leadership',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  },
  {
    id: 'quote-3',
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
    theme: 'motivation',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
  },
  {
    id: 'quote-4',
    text: 'It is during our darkest moments that we must focus to see the light.',
    author: 'Aristotle',
    theme: 'wisdom',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
  },
  {
    id: 'quote-5',
    text: 'The only impossible journey is the one you never begin.',
    author: 'Tony Robbins',
    theme: 'motivation',
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
  },
  {
    id: 'quote-6',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    theme: 'success',
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
  },
  {
    id: 'quote-7',
    text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    author: 'Nelson Mandela',
    theme: 'growth',
    timestamp: Date.now() - 12 * 24 * 60 * 60 * 1000, // 12 days ago
  },
  {
    id: 'quote-8',
    text: 'Leadership is not about being in charge. It is about taking care of those in your charge.',
    author: 'Simon Sinek',
    theme: 'leadership',
    timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2 weeks ago
  },
  {
    id: 'quote-9',
    text: 'The only true wisdom is in knowing you know nothing.',
    author: 'Socrates',
    theme: 'wisdom',
    timestamp: Date.now() - 16 * 24 * 60 * 60 * 1000, // 16 days ago
  },
  {
    id: 'quote-10',
    text: 'Be yourself; everyone else is already taken.',
    author: 'Oscar Wilde',
    theme: 'wisdom',
    timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
  },
  {
    id: 'quote-11',
    text: "Whether you think you can or you think you can't, you're right.",
    author: 'Henry Ford',
    theme: 'motivation',
    timestamp: Date.now() - 22 * 24 * 60 * 60 * 1000, // 22 days ago
  },
  {
    id: 'quote-12',
    text: 'In the middle of difficulty lies opportunity.',
    author: 'Albert Einstein',
    theme: 'growth',
    timestamp: Date.now() - 25 * 24 * 60 * 60 * 1000, // 25 days ago
  },
];

export const MOCK_AFFIRMATIONS: BookmarkedAffirmation[] = [
  {
    id: 'affirmation-1',
    text: 'I am confident, capable, and deserving of all the success that comes my way.',
    category: 'confidence',
    timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
  },
  {
    id: 'affirmation-2',
    text: 'I choose to focus on what I can control and release what I cannot.',
    category: 'peace',
    timestamp: Date.now() - 18 * 60 * 60 * 1000, // 18 hours ago
  },
  {
    id: 'affirmation-3',
    text: 'Every day I am getting stronger, healthier, and more vibrant.',
    category: 'health',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  },
  {
    id: 'affirmation-4',
    text: 'I am grateful for all the abundance in my life and open to receiving more.',
    category: 'gratitude',
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
  },
  {
    id: 'affirmation-5',
    text: 'I attract positive, loving relationships into my life effortlessly.',
    category: 'relationships',
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
  },
  {
    id: 'affirmation-6',
    text: 'I have the power to create the life I desire through my thoughts and actions.',
    category: 'motivation',
    timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
  },
  {
    id: 'affirmation-7',
    text: 'Success flows to me easily and I embrace every opportunity to grow.',
    category: 'success',
    timestamp: Date.now() - 11 * 24 * 60 * 60 * 1000, // 11 days ago
  },
  {
    id: 'affirmation-8',
    text: 'I trust myself to make decisions that align with my highest good.',
    category: 'confidence',
    timestamp: Date.now() - 13 * 24 * 60 * 60 * 1000, // 13 days ago
  },
  {
    id: 'affirmation-9',
    text: 'I am worthy of love, respect, and all the beautiful experiences life offers.',
    category: 'relationships',
    timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
  },
  {
    id: 'affirmation-10',
    text: 'My mind is clear, my heart is open, and I am at peace with who I am.',
    category: 'peace',
    timestamp: Date.now() - 17 * 24 * 60 * 60 * 1000, // 17 days ago
  },
  {
    id: 'affirmation-11',
    text: 'I celebrate my progress and acknowledge how far I have come.',
    category: 'gratitude',
    timestamp: Date.now() - 19 * 24 * 60 * 60 * 1000, // 19 days ago
  },
  {
    id: 'affirmation-12',
    text: 'I am driven by purpose and passionate about my goals.',
    category: 'motivation',
    timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000, // 21 days ago
  },
  {
    id: 'affirmation-13',
    text: 'My body is strong, my mind is sharp, and my spirit is resilient.',
    category: 'health',
    timestamp: Date.now() - 23 * 24 * 60 * 60 * 1000, // 23 days ago
  },
  {
    id: 'affirmation-14',
    text: 'I embrace challenges as opportunities to discover my true potential.',
    category: 'confidence',
    timestamp: Date.now() - 26 * 24 * 60 * 60 * 1000, // 26 days ago
  },
];

// Helper function to load mock data (for development)
export const loadMockBookmarks = (): void => {
  // Load mock quotes
  localStorage.setItem('bookmarked_quotes', JSON.stringify(MOCK_QUOTES));

  // Load mock affirmations
  localStorage.setItem('bookmarked_affirmations', JSON.stringify(MOCK_AFFIRMATIONS));

  console.info('Mock bookmark data loaded:', {
    quotes: MOCK_QUOTES.length,
    affirmations: MOCK_AFFIRMATIONS.length,
  });
};

// Helper function to clear all bookmarks (for development)
export const clearAllBookmarks = (): void => {
  localStorage.removeItem('bookmarked_quotes');
  localStorage.removeItem('bookmarked_affirmations');
  console.info('All bookmark data cleared');
};
