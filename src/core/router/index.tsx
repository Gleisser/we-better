import {
  lazy,
  Suspense,
  type LazyExoticComponent,
  type ComponentType,
  type ReactNode,
} from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { BottomSheetProvider } from '@/shared/contexts/BottomSheetContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { PublicRoute } from '@/features/auth/PublicRoute';
import RouteLoader from './RouteLoader';

const appRouteComponent = lazy(() => import('@/App'));
const authLayoutRouteComponent = lazy(() => import('@/features/auth/pages/AuthLayout'));
const loginRouteComponent = lazy(() => import('@/features/auth/pages/Login'));
const signUpRouteComponent = lazy(() => import('@/features/auth/pages/SignUp'));
const forgotPasswordRouteComponent = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const resetPasswordRouteComponent = lazy(() => import('@/features/auth/pages/ResetPassword'));
const emailConfirmationRouteComponent = lazy(
  () => import('@/features/auth/pages/EmailConfirmation')
);
const appShellRouteComponent = lazy(() => import('@/shared/components/layout/WeBetterApp'));
const dashboardRouteComponent = lazy(() => import('@/features/dashboard/Dashboard'));
const lifeWheelRouteComponent = lazy(() => import('@/features/life-wheel/EnhancedLifeWheelPage'));
const dreamBoardRouteComponent = lazy(() => import('@/features/dream-board/DreamBoardPage'));
const missionsRouteComponent = lazy(() => import('@/features/missions/MissionsPage'));
const settingsRouteComponent = lazy(() => import('@/pages/Settings/Settings'));
const bookmarksRouteComponent = lazy(() => import('@/pages/Bookmarks/Bookmarks'));
const notificationsRouteComponent = lazy(() => import('@/pages/Notifications/Notifications'));
const pricingRouteComponent = lazy(() => import('@/pages/Pricing/Pricing'));
const quoteIconSpikeRouteComponent = lazy(() => import('@/pages/QuoteIconSpike'));

interface LazyRouteOptions {
  label?: string;
  variant?: 'fullscreen' | 'content';
}

const renderLazyRoute = (
  Component: LazyExoticComponent<ComponentType>,
  { label, variant = 'fullscreen' }: LazyRouteOptions = {}
): JSX.Element => (
  <Suspense fallback={<RouteLoader label={label} variant={variant} />}>
    <Component />
  </Suspense>
);

const renderLazyLayoutRoute = (
  Component: LazyExoticComponent<ComponentType<{ children?: ReactNode }>>,
  children: ReactNode,
  { label, variant = 'fullscreen' }: LazyRouteOptions = {}
): JSX.Element => (
  <Suspense fallback={<RouteLoader label={label} variant={variant} />}>
    <Component>{children}</Component>
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: renderLazyRoute(appRouteComponent, { label: 'Loading We Better...' }),
  },
  {
    path: '/auth',
    element: (
      <PublicRoute>
        {renderLazyRoute(authLayoutRouteComponent, { label: 'Loading authentication...' })}
      </PublicRoute>
    ),
    children: [
      {
        path: 'login',
        element: renderLazyRoute(loginRouteComponent, {
          label: 'Loading login...',
          variant: 'content',
        }),
      },
      {
        path: 'signup',
        element: renderLazyRoute(signUpRouteComponent, {
          label: 'Loading sign up...',
          variant: 'content',
        }),
      },
      {
        path: 'forgot-password',
        element: renderLazyRoute(forgotPasswordRouteComponent, {
          label: 'Loading password recovery...',
          variant: 'content',
        }),
      },
      {
        path: 'reset-password',
        element: renderLazyRoute(resetPasswordRouteComponent, {
          label: 'Loading password reset...',
          variant: 'content',
        }),
      },
    ],
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        {/* <AuthDebugger /> */}
        <BottomSheetProvider>
          {renderLazyRoute(appShellRouteComponent, { label: 'Loading workspace...' })}
        </BottomSheetProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: renderLazyRoute(dashboardRouteComponent, {
          label: 'Loading dashboard...',
          variant: 'content',
        }),
      },
      {
        path: 'dashboard',
        element: renderLazyRoute(dashboardRouteComponent, {
          label: 'Loading dashboard...',
          variant: 'content',
        }),
      },
      {
        path: 'life-wheel',
        element: renderLazyRoute(lifeWheelRouteComponent, {
          label: 'Loading life wheel...',
          variant: 'content',
        }),
      },
      {
        path: 'dream-board',
        element: renderLazyRoute(dreamBoardRouteComponent, {
          label: 'Loading dream board...',
          variant: 'content',
        }),
      },
      {
        path: 'missions',
        element: renderLazyRoute(missionsRouteComponent, {
          label: 'Loading missions...',
          variant: 'content',
        }),
      },
      {
        path: 'settings',
        element: renderLazyRoute(settingsRouteComponent, {
          label: 'Loading settings...',
          variant: 'content',
        }),
      },
      {
        path: 'bookmarks',
        element: renderLazyRoute(bookmarksRouteComponent, {
          label: 'Loading bookmarks...',
          variant: 'content',
        }),
      },
      {
        path: 'notifications',
        element: renderLazyRoute(notificationsRouteComponent, {
          label: 'Loading notifications...',
          variant: 'content',
        }),
      },
      {
        path: 'pricing',
        element: renderLazyRoute(pricingRouteComponent, {
          label: 'Loading pricing...',
          variant: 'content',
        }),
      },
    ],
  },
  {
    path: '/auth/confirm',
    element: renderLazyRoute(emailConfirmationRouteComponent, { label: 'Loading confirmation...' }),
  },
  {
    path: '/spikes/quote-icons',
    element: renderLazyRoute(quoteIconSpikeRouteComponent, { label: 'Loading quote icons...' }),
  },
  {
    path: '/auth/forgot-password',
    element: renderLazyLayoutRoute(
      authLayoutRouteComponent,
      renderLazyRoute(forgotPasswordRouteComponent, {
        label: 'Loading password recovery...',
        variant: 'content',
      }),
      { label: 'Loading authentication...' }
    ),
  },
  {
    path: '/auth/reset-password',
    element: renderLazyLayoutRoute(
      authLayoutRouteComponent,
      renderLazyRoute(resetPasswordRouteComponent, {
        label: 'Loading password reset...',
        variant: 'content',
      }),
      { label: 'Loading authentication...' }
    ),
  },
]);
