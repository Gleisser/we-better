import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/config/react-query';
import { registerServiceWorkerAfterFirstPaint } from '@/core/services/pushSubscriptionService';
import ReactQueryDevtoolsLoader from '@/shared/components/debug/ReactQueryDevtoolsLoader';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { BottomSheetProvider } from '@/shared/contexts/BottomSheetContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { useAuth } from '@/shared/hooks/useAuth';
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthenticatedServiceWorkerRegistration />
        <ProtectedRoute>
          <ThemeProvider syncWithUserPreferences>
            <BottomSheetProvider>
              <WeBetterApp />
            </BottomSheetProvider>
          </ThemeProvider>
        </ProtectedRoute>
        <ReactQueryDevtoolsLoader />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AppRouteShell;
