import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    // Redirect to the page they came from or default to /app
    const from = location.state?.from?.pathname || '/app';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
} 