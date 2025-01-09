import { PodcastEpisode, PodcastWidgetConfig } from './types';

export const MOCK_EPISODES: PodcastEpisode[] = [
  {
    id: 'ep_1',
    title: 'The Power of Atomic Habits',
    author: 'James Clear',
    duration: '45:30',
    releaseDate: '2024-03-20',
    artwork: '/assets/images/podcasts/atomic-habits.webp',
    description: 'Learn how tiny changes can lead to remarkable results in this insightful episode about habit formation.',
    isPlaying: false,
    progress: 0
  },
  {
    id: 'ep_2',
    title: 'Deep Work in a Distracted World',
    author: 'Cal Newport',
    duration: '52:15',
    releaseDate: '2024-03-19',
    artwork: '/assets/images/podcasts/atomic-habits.webp',
    description: 'Discover the principles of deep work and how to achieve maximum productivity in a world full of distractions.',
    isPlaying: false,
    progress: 0
  }
];

export const DEFAULT_CONFIG: PodcastWidgetConfig = {
  autoplay: false,
  defaultVolume: 0.8
}; 