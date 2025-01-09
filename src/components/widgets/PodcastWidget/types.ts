export interface PodcastEpisode {
  id: string;
  title: string;
  author: string;
  duration: string;
  releaseDate: string;
  artwork: string;
  description: string;
  category?: string;
  isPlaying?: boolean;
  progress?: number;
  isFeatured?: boolean;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface PodcastWidgetConfig {
  autoplay: boolean;
  defaultVolume: number;
} 