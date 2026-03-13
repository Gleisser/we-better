import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/config/react-query';
import ReactQueryDevtoolsLoader from '@/shared/components/debug/ReactQueryDevtoolsLoader';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { BottomSheetProvider } from '@/shared/contexts/BottomSheetContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import WeBetterApp from '@/shared/components/layout/WeBetterApp';

const AppRouteShell = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
