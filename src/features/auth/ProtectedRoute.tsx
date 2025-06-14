import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { user, isLoading, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    // Return a loading spinner or placeholder while checking authentication
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
