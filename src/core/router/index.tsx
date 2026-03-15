import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import type { AppNamespace } from '@/core/i18n';
import RouteLoader from './RouteLoader';
import RouteNamespaceBoundary from './RouteNamespaceBoundary';

const publicRouteShellComponent = lazy(() => import('./PublicRouteShell'));
const authRouteShellComponent = lazy(() => import('./AuthRouteShell'));
const appRouteShellComponent = lazy(() => import('./AppRouteShell'));
const appRouteComponent = lazy(() => import('@/App'));
const authLayoutRouteComponent = lazy(() => import('@/features/auth/pages/AuthLayout'));
const loginRouteComponent = lazy(() => import('@/features/auth/pages/Login'));
const signUpRouteComponent = lazy(() => import('@/features/auth/pages/SignUp'));
const forgotPasswordRouteComponent = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const resetPasswordRouteComponent = lazy(() => import('@/features/auth/pages/ResetPassword'));
const emailConfirmationRouteComponent = lazy(
  () => import('@/features/auth/pages/EmailConfirmation')
);
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
  namespaces?: readonly AppNamespace[];
  variant?: 'fullscreen' | 'content';
}

const withNamespaceBoundary = (
  children: ReactNode,
  { label, namespaces = [], variant = 'fullscreen' }: LazyRouteOptions = {}
): JSX.Element => (
  <RouteNamespaceBoundary label={label} namespaces={namespaces} variant={variant}>
    {children}
  </RouteNamespaceBoundary>
);

const renderLazyRoute = (
  Component: LazyExoticComponent<ComponentType>,
  options: LazyRouteOptions = {}
): JSX.Element =>
  withNamespaceBoundary(
    <Suspense fallback={<RouteLoader label={options.label} variant={options.variant} />}>
      <Component />
    </Suspense>,
    options
  );

const renderLazyLayoutRoute = (
  Component: LazyExoticComponent<ComponentType<{ children?: ReactNode }>>,
  children: ReactNode,
  options: LazyRouteOptions = {}
): JSX.Element =>
  withNamespaceBoundary(
    <Suspense fallback={<RouteLoader label={options.label} variant={options.variant} />}>
      <Component>{children}</Component>
    </Suspense>,
    options
  );

export const routes: RouteObject[] = [
  {
    path: '/',
    element: renderLazyRoute(publicRouteShellComponent, {
      label: 'Loading We Better...',
      namespaces: ['landing'],
    }),
    children: [
      {
        index: true,
        element: renderLazyRoute(appRouteComponent, {
          label: 'Loading We Better...',
          namespaces: ['landing'],
        }),
      },
    ],
  },
  {
    path: '/auth',
    element: renderLazyRoute(authRouteShellComponent, {
      label: 'Loading authentication...',
      namespaces: ['auth'],
    }),
    children: [
      {
        path: 'login',
        element: renderLazyRoute(loginRouteComponent, {
          label: 'Loading login...',
          namespaces: ['auth'],
          variant: 'content',
        }),
      },
      {
        path: 'signup',
        element: renderLazyRoute(signUpRouteComponent, {
          label: 'Loading sign up...',
          namespaces: ['auth'],
          variant: 'content',
        }),
      },
      {
        path: 'forgot-password',
        element: renderLazyRoute(forgotPasswordRouteComponent, {
          label: 'Loading password recovery...',
          namespaces: ['auth'],
          variant: 'content',
        }),
      },
      {
        path: 'reset-password',
        element: renderLazyRoute(resetPasswordRouteComponent, {
          label: 'Loading password reset...',
          namespaces: ['auth'],
          variant: 'content',
        }),
      },
    ],
  },
  {
    path: '/app',
    element: renderLazyRoute(appRouteShellComponent, {
      label: 'Loading workspace...',
      namespaces: ['notifications'],
    }),
    children: [
      {
        index: true,
        element: renderLazyRoute(dashboardRouteComponent, {
          label: 'Loading dashboard...',
          namespaces: ['dashboard'],
          variant: 'content',
        }),
      },
      {
        path: 'dashboard',
        element: renderLazyRoute(dashboardRouteComponent, {
          label: 'Loading dashboard...',
          namespaces: ['dashboard'],
          variant: 'content',
        }),
      },
      {
        path: 'life-wheel',
        element: renderLazyRoute(lifeWheelRouteComponent, {
          label: 'Loading life wheel...',
          namespaces: ['dashboard', 'life-wheel'],
          variant: 'content',
        }),
      },
      {
        path: 'dream-board',
        element: renderLazyRoute(dreamBoardRouteComponent, {
          label: 'Loading dream board...',
          namespaces: ['dream-board'],
          variant: 'content',
        }),
      },
      {
        path: 'missions',
        element: renderLazyRoute(missionsRouteComponent, {
          label: 'Loading missions...',
          namespaces: ['missions'],
          variant: 'content',
        }),
      },
      {
        path: 'settings',
        element: renderLazyRoute(settingsRouteComponent, {
          label: 'Loading settings...',
          namespaces: ['settings'],
          variant: 'content',
        }),
      },
      {
        path: 'bookmarks',
        element: renderLazyRoute(bookmarksRouteComponent, {
          label: 'Loading bookmarks...',
          namespaces: ['bookmarks'],
          variant: 'content',
        }),
      },
      {
        path: 'notifications',
        element: renderLazyRoute(notificationsRouteComponent, {
          label: 'Loading notifications...',
          namespaces: ['notifications'],
          variant: 'content',
        }),
      },
      {
        path: 'pricing',
        element: renderLazyRoute(pricingRouteComponent, {
          label: 'Loading pricing...',
          namespaces: ['settings', 'pricing'],
          variant: 'content',
        }),
      },
    ],
  },
  {
    path: '/auth/confirm',
    element: renderLazyRoute(emailConfirmationRouteComponent, {
      label: 'Loading confirmation...',
      namespaces: ['auth'],
    }),
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
        namespaces: ['auth'],
        variant: 'content',
      }),
      { label: 'Loading authentication...', namespaces: ['auth'] }
    ),
  },
  {
    path: '/auth/reset-password',
    element: renderLazyLayoutRoute(
      authLayoutRouteComponent,
      renderLazyRoute(resetPasswordRouteComponent, {
        label: 'Loading password reset...',
        namespaces: ['auth'],
        variant: 'content',
      }),
      { label: 'Loading authentication...', namespaces: ['auth'] }
    ),
  },
];

export const router = createBrowserRouter(routes);
