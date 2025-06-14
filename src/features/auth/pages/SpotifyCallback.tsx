import { useEffect } from 'react';
import { handleSpotifyCallback } from '@/utils/helpers/spotify';

export const SpotifyCallback = (): JSX.Element => {
  useEffect(() => {
    try {
      const token = handleSpotifyCallback();
      if (token) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }, []);

  return <div>Authenticating with Spotify...</div>;
};
