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
  spotifyUri: string;
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

export interface SpotifyPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  spotifyPlayer?: Spotify.Player;
} 