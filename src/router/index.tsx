import { createBrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { handleSpotifyCallback } from '@/utils/spotify';
import App from '@/App';
import WeBetterApp from '@/pages/WeBetterApp';
import Dashboard from '@/pages/Dashboard';
import Videos from '@/pages/Videos';
import Articles from '@/pages/Articles';
import Courses from '@/pages/Courses';
import Podcasts from '@/pages/Podcasts';
import { BottomSheetProvider } from '@/contexts/BottomSheetContext';

const SpotifyCallback = () => {
  useEffect(() => {
    try {
      const token = handleSpotifyCallback();
      if (token) {
        // Redirect back to the main app
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }, []);

  return <div>Authenticating with Spotify...</div>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/app',
    element: (
      <BottomSheetProvider>
        <WeBetterApp />
      </BottomSheetProvider>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'videos',
        element: <Videos />
      },
      {
        path: 'articles',
        element: <Articles />
      },
      {
        path: 'courses',
        element: <Courses />
      },
      {
        path: 'podcasts',
        element: <Podcasts />
      }
    ],
  },
  {
    path: '/callback',
    element: <SpotifyCallback />,
  },
]); 