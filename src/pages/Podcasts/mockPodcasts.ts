export interface Podcast {
  id: string;
  title: string;
  episode: string;
  author: string;
  thumbnailUrl: string;
  duration: string;
  description: string;
  category: string;
  subCategory: string;
  spotifyUri: string;
  publishedAt: string;
  listens: number;
}

export const mockPodcasts: Podcast[] = [
  {
    id: '1',
    title: 'Just Football Podcast',
    episode: 'The Art of Goal Setting and Achievement',
    author: 'Andrius Peregonius',
    thumbnailUrl: 'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg',
    duration: '01:05:30',
    description: 'Learn how to set and achieve meaningful goals with proven strategies from top performers.',
    category: 'Personal Development',
    subCategory: 'Goal Setting',
    spotifyUri: 'spotify:episode:1234567890',
    publishedAt: '2024-03-10',
    listens: 15400
  },
  {
    id: '2',
    title: 'Mindful Moments',
    episode: 'Finding Peace in Chaos',
    author: 'Sarah Chen',
    thumbnailUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg',
    duration: '45:20',
    description: 'Discover practical mindfulness techniques for staying centered in challenging times.',
    category: 'Mindfulness',
    subCategory: 'Meditation',
    spotifyUri: 'spotify:episode:0987654321',
    publishedAt: '2024-03-09',
    listens: 8900
  },
  // Add more mock podcasts...
]; 