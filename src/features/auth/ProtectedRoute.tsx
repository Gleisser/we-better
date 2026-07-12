import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { requiresOnboarding } from '@/types/onboarding';
import AuthTransitionScreen from './AuthTransitionScreen';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { user, onboarding, isLoading, isAuthResolved, isLoggingOut } = useAuth();
  const location = useLocation();
  const isOnboardingRoute = location.pathname === '/app/onboarding';

  if (isLoggingOut || ((isLoading || !isAuthResolved) && !user)) {
    return <AuthTransitionScreen message="Preparing your workspace..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiresOnboarding(onboarding) && !isOnboardingRoute) {
    return <Navigate to="/app/onboarding" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
