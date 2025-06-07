declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: SpotifyPlayerConfig) => Spotify.Player;
    };
  }
}

declare namespace Spotify {
  interface WebPlaybackState {
    context: {
      uri: string;
      metadata?: Record<string, unknown>;
    };
    disallows: {
      pausing?: boolean;
      resuming?: boolean;
      seeking?: boolean;
      skipping_prev?: boolean;
      skipping_next?: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: WebPlaybackTrack;
      previous_tracks: WebPlaybackTrack[];
      next_tracks: WebPlaybackTrack[];
    };
  }

  interface WebPlaybackTrack {
    uri: string;
    id: string;
    type: string;
    media_type: string;
    name: string;
    duration_ms: number;
    artists: Array<{ name: string; uri: string }>;
    album: {
      name: string;
      uri: string;
      images: Array<{ url: string }>;
    };
  }

  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: string, callback: (state: WebPlaybackState) => void): void;
    removeListener(event: string): void;
    getCurrentState(): Promise<WebPlaybackState | null>;
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

  interface SpotifyPlayerConfig {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }
}

export {};
