import { Article } from './types';

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'article_1',
    title: 'The Science Behind Mindfulness: How Meditation Changes Your Brain',
    description: 'Recent neuroscience research reveals how mindfulness practices can significantly alter brain structure and function, leading to improved mental well-being and cognitive performance.',
    url: 'https://example.com/mindfulness-science',
    thumbnail: '/assets/images/articles/mindfulness-brain.jpg',
    source: {
      id: 'source_1',
      name: 'Neuroscience Today',
      icon: '/assets/images/sources/neuroscience-today.png',
      url: 'https://example.com/neuroscience-today'
    },
    readTime: 8,
    publishedAt: '2024-03-15T10:00:00Z',
    tags: ['mindfulness', 'neuroscience', 'mental-health', 'meditation']
  }
]; 