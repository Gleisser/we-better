import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/config/react-query';
import { registerServiceWorkerAfterFirstPaint } from '@/core/services/pushSubscriptionService';
import ReactQueryDevtoolsLoader from '@/shared/components/debug/ReactQueryDevtoolsLoader';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { BottomSheetProvider } from '@/shared/contexts/BottomSheetContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  APP_FONT_PRELOADS,
  APP_FONT_STYLESHEET,
  useFontStylesheets,
} from '@/shared/hooks/useFontStylesheets';
import WeBetterApp from '@/shared/components/layout/WeBetterApp';
import { useEffect } from 'react';

const AuthenticatedServiceWorkerRegistration = (): null => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    registerServiceWorkerAfterFirstPaint();
  }, [isAuthenticated, isLoading]);

  return null;
};

const AppRouteShell = (): JSX.Element => {
  useFontStylesheets({
    preloads: APP_FONT_PRELOADS,
    stylesheets: [APP_FONT_STYLESHEET],
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedServiceWorkerRegistration />
      <ProtectedRoute>
        <ThemeProvider>
          <BottomSheetProvider>
            <WeBetterApp />
          </BottomSheetProvider>
        </ThemeProvider>
      </ProtectedRoute>
      <ReactQueryDevtoolsLoader />
    </QueryClientProvider>
  );
};

export default AppRouteShell;
