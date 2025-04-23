import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Special case for reset password - allow authenticated access
  const isResetPasswordRoute = location.pathname.includes('/auth/reset-password');
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // If user is authenticated AND not on reset password page, redirect to app
  if (user && !isResetPasswordRoute) {
    return <Navigate to="/app" replace />;
  }
  
  return <>{children}</>;
}; 