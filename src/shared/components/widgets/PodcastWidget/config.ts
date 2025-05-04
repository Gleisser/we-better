import { PodcastEpisode, PodcastWidgetConfig } from './types';

export const MOCK_EPISODES: PodcastEpisode[] = [
  {
    id: 'ep_1',
    title: 'The Exercise & Nutrition Scientist',
    author: 'The Diary Of A CEO with Steven Bartlett',
    duration: '2:03:00',
    releaseDate: '2024-03-25',
    artwork: '/assets/images/podcasts/atomic-habits.webp',
    description:
      'Dr Stacy Sims reveals the science-backed secrets for optimal health and fitness every women needs',
    isPlaying: false,
    progress: 0,
    spotifyUri: 'spotify:episode:37HUAmld0cYeKak4NOCBVW',
  },
  {
    id: 'ep_2',
    title: 'Deep Work in a Distracted World',
    author: 'Cal Newport',
    duration: '52:15',
    releaseDate: '2024-03-19',
    artwork: '/assets/images/podcasts/atomic-habits.webp',
    description:
      'Discover the principles of deep work and how to achieve maximum productivity in a world full of distractions.',
    isPlaying: false,
    progress: 0,
    spotifyUri: 'spotify:episode:37HUAmld0cYeKak4NOCBVW',
  },
];

export const DEFAULT_CONFIG: PodcastWidgetConfig = {
  autoplay: false,
  defaultVolume: 0.8,
};

export const SPOTIFY_CONFIG = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
};
