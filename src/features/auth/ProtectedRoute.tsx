import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import AuthTransitionScreen from './AuthTransitionScreen';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { user, isLoading, isAuthResolved, isLoggingOut } = useAuth();
  const location = useLocation();

  if (isLoggingOut || ((isLoading || !isAuthResolved) && !user)) {
    return <AuthTransitionScreen message="Preparing your workspace..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
