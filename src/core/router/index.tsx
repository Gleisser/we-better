import { createBrowserRouter, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { handleSpotifyCallback } from '@/utils/helpers/spotify';
import App from '@/App';
import WeBetterApp from '@/features/app/pages';
import Dashboard from '@/features/dashboard/Dashboard';
import Videos from '@/features/videos/pages';
import Articles from '@/features/articles/pages';
import Courses from '@/features/courses/pages/Courses';
import Podcasts from '@/features/podcasts/pages';
import Login from '@/features/auth/pages/Login';
import SignUp from '@/features/auth/pages/SignUp';
import { BottomSheetProvider } from '@/shared/contexts/BottomSheetContext';
import AuthLayout from '@/features/auth/pages/AuthLayout';
import EmailConfirmation from '@/features/auth/pages/EmailConfirmation';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { PublicRoute } from '@/features/auth/PublicRoute';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import ResetPassword from '@/features/auth/pages/ResetPassword';
//import AuthDebugger from '@/features/auth/AuthDebugger';
import { LifeWheel } from '@/features/life-wheel';
import { WelcomeSequence } from '@/features/life-wheel/WelcomeSequence';
import { VisionBoard } from '@/features/vision-board';
import { VisionBoardData } from '@/features/vision-board/types';
import { LifeCategory } from '@/features/life-wheel/types';
import { useAuth } from '@/shared/contexts/AuthContext';
import { DEFAULT_LIFE_CATEGORIES } from '@/features/life-wheel/constants/categories';
import { createVisionBoard, updateVisionBoard } from '@/core/services/visionBoardService';

// Create a simple Start page that contains the Life Wheel component and Vision Board
const StartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showVisionBoard, setShowVisionBoard] = useState(false);
  const [lifeWheelCategories, setLifeWheelCategories] = useState<LifeCategory[]>(DEFAULT_LIFE_CATEGORIES);
  
  const handleComplete = () => {
    // Show the Vision Board after completing the Life Wheel assessment
    setShowVisionBoard(true);
  };
  
  const handleCategoryUpdate = (categoryId: string, newValue: number) => {
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
    try {
      // Use the appropriate service function based on whether it's a new board or update
      let result;
      if (data.id) {
        result = await updateVisionBoard(data);
      } else {
        result = await createVisionBoard(data);
      }
      return result !== null;
    } catch (error) {
      console.error('Error saving vision board:', error);
      return false;
    }
  };
  
  // Handle completion of the vision board by redirecting to the dashboard
  const handleVisionBoardComplete = () => {
    console.log('Vision board completed, redirecting to dashboard');
    navigate('/app/dashboard');
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
            onComplete={handleVisionBoardComplete}
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
        {/* <AuthDebugger /> */}
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