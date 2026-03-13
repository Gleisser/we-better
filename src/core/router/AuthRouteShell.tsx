import { AuthProvider } from '@/shared/contexts/AuthContext';
import { PublicRoute } from '@/features/auth/PublicRoute';
import AuthLayout from '@/features/auth/pages/AuthLayout';

const AuthRouteShell = (): JSX.Element => {
  return (
    <AuthProvider>
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    </AuthProvider>
  );
};

export default AuthRouteShell;
