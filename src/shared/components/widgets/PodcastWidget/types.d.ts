interface Window {
  Spotify: {
    Player: {
      new (options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume?: number;
      }): Spotify.Player;
    };
  };
  onSpotifyWebPlaybackSDKReady: () => void;
}

declare namespace Spotify {
  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: string, callback: (data: unknown) => void): void;
    removeListener(event: string, callback?: (data: unknown) => void): void;
    getCurrentState(): Promise<PlayerState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }

  interface PlayerState {
    context: {
      uri: string;
      metadata: Record<string, unknown>;
    };
    disallows: {
      pausing: boolean;
      peeking_next: boolean;
      peeking_prev: boolean;
      resuming: boolean;
      seeking: boolean;
      skipping_next: boolean;
      skipping_prev: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: Track;
      previous_tracks: Track[];
      next_tracks: Track[];
    };
  }

  interface Track {
    id: string;
    uri: string;
    type: string;
    media_type: string;
    name: string;
    duration_ms: number;
    artists: Array<{
      name: string;
      uri: string;
    }>;
    album: {
      uri: string;
      name: string;
      images: Array<{
        url: string;
      }>;
    };
  }
}
