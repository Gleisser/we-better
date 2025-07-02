import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import WeBetterApp from '@/shared/components/layout/WeBetterApp';
import Dashboard from '@/features/dashboard/Dashboard';
import Login from '@/features/auth/pages/Login';
import SignUp from '@/features/auth/pages/SignUp';
import { BottomSheetProvider } from '@/shared/contexts/BottomSheetContext';
import AuthLayout from '@/features/auth/pages/AuthLayout';
import EmailConfirmation from '@/features/auth/pages/EmailConfirmation';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { PublicRoute } from '@/features/auth/PublicRoute';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import ResetPassword from '@/features/auth/pages/ResetPassword';
import { SpotifyCallback } from '@/features/auth/pages/SpotifyCallback';
import { EnhancedLifeWheelPage } from '@/features/life-wheel';
import { DreamBoardPage } from '@/features/dream-board';
import Settings from '@/pages/Settings';
import Bookmarks from '@/pages/Bookmarks';
import Notifications from '@/pages/Notifications';

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
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'life-wheel',
        element: <EnhancedLifeWheelPage />,
      },
      {
        path: 'dream-board',
        element: <DreamBoardPage />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'bookmarks',
        element: <Bookmarks />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
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
    element: (
      <AuthLayout>
        <ForgotPassword />
      </AuthLayout>
    ),
  },
  {
    path: '/auth/reset-password',
    element: (
      <AuthLayout>
        <ResetPassword />
      </AuthLayout>
    ),
  },
]);
