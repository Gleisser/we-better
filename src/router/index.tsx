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
import AuthDebugger from '@/components/auth/AuthDebugger';
import { LifeWheel } from '@/components/LifeWheel';

// Create a simple Start page that contains the LifeWheel component
const StartPage = () => {
  const handleComplete = () => {
    console.log('Life wheel assessment completed');
    // Could redirect to dashboard or another page after completion
  };
  
  const handleCategoryUpdate = (categoryId: string, newValue: number) => {
    console.log('Category updated:', categoryId, newValue);
    // Could save to user profile or database
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        Welcome to WeBetter
      </h1>
      <p style={{ 
        fontSize: '1.1rem', 
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        Let's start by assessing different areas of your life
      </p>
      
      <LifeWheel 
        onComplete={handleComplete}
        onCategoryUpdate={handleCategoryUpdate}
      />
    </div>
  );
};

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
        <AuthDebugger />
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
    path: '/start',
    element: (
      <ProtectedRoute>
        <StartPage />
      </ProtectedRoute>
    ),
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
  {
    path: '/auth/reset-password',
    element: <AuthLayout><ResetPassword /></AuthLayout>,
  },
]); 