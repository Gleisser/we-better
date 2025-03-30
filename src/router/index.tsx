import { createBrowserRouter } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import { LifeWheel } from '@/components/life-wheel';
import { WelcomeSequence } from '@/components/life-wheel/WelcomeSequence';
import { VisionBoard } from '@/components/vision-board';
import { VisionBoardData } from '@/components/vision-board/types';
import { LifeCategory } from '@/components/life-wheel/types';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_LIFE_CATEGORIES } from '@/components/life-wheel/constants/categories';

// Create a simple Start page that contains the Life Wheel component and Vision Board
const StartPage = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showVisionBoard, setShowVisionBoard] = useState(false);
  const [lifeWheelCategories, setLifeWheelCategories] = useState<LifeCategory[]>(DEFAULT_LIFE_CATEGORIES);
  
  const handleComplete = () => {
    console.log('Life wheel assessment completed');
    // Show the Vision Board after completing the Life Wheel assessment
    setShowVisionBoard(true);
  };
  
  const handleCategoryUpdate = (categoryId: string, newValue: number) => {
    console.log('Category updated:', categoryId, newValue);
    // Update the categories for the Vision Board
    setLifeWheelCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, value: newValue } 
          : cat
      )
    );
  };
  
  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };
  
  const handleWelcomeSkip = () => {
    setShowWelcome(false);
  };

  const handleVisionBoardSave = async (data: VisionBoardData): Promise<boolean> => {
    console.log('Vision board saved:', data);
    return true;
  };
  
  return (
    <div style={{ 
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)'
    }}>
      {showWelcome ? (
        <WelcomeSequence 
          onComplete={handleWelcomeComplete}
          onSkip={handleWelcomeSkip}
          userName={user?.full_name || ''}
        />
      ) : showVisionBoard ? (
        <>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: 'white'
          }}>
            Your Vision Board
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.8,
            textAlign: 'center',
            marginBottom: '2rem',
            color: 'white'
          }}>
            Create a visual representation of your goals and aspirations
          </p>
          
          <VisionBoard 
            lifeWheelCategories={lifeWheelCategories}
            onSave={handleVisionBoardSave}
          />
        </>
      ) : (
        <>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: 'white'
          }}>
            Your Life Wheel Assessment
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.8,
            textAlign: 'center',
            marginBottom: '2rem',
            color: 'white'
          }}>
            Rate each area from 1-10 to see where your life is balanced
          </p>
          
          <LifeWheel 
            onComplete={handleComplete}
            onCategoryUpdate={handleCategoryUpdate}
          />
        </>
      )}
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