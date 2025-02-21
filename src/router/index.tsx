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
import Login from '@/pages/Auth/Login';
import SignUp from '@/pages/Auth/SignUp';
import { BottomSheetProvider } from '@/contexts/BottomSheetContext';
import AuthLayout from '@/pages/Auth/AuthLayout';
import EmailConfirmation from '@/pages/Auth/EmailConfirmation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import ForgotPassword from '@/pages/Auth/ForgotPassword';
import ResetPassword from '@/pages/Auth/ResetPassword';

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
    path: '/auth',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <SignUp />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <BottomSheetProvider>
          <WeBetterApp />
        </BottomSheetProvider>
      </ProtectedRoute>
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
  {
    path: '/auth/confirm',
    element: <EmailConfirmation />,
  },
  {
    path: '/auth/forgot-password',
    element: <AuthLayout><ForgotPassword /></AuthLayout>,
  },
]); 