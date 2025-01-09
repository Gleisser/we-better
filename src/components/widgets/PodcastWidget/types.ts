export interface PodcastEpisode {
  id: string;
  title: string;
  author: string;
  duration: string;
  releaseDate: string;
  artwork: string;
  description: string;
  isPlaying?: boolean;
  progress?: number;
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