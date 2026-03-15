import { AuthProvider } from '@/shared/contexts/AuthContext';
import { PublicRoute } from '@/features/auth/PublicRoute';
import AuthLayout from '@/features/auth/pages/AuthLayout';
import {
  AUTH_FONT_PRELOADS,
  AUTH_FONT_STYLESHEET,
  useFontStylesheets,
} from '@/shared/hooks/useFontStylesheets';

const AuthRouteShell = (): JSX.Element => {
  useFontStylesheets({
    preloads: AUTH_FONT_PRELOADS,
    stylesheets: [AUTH_FONT_STYLESHEET],
  });

  return (
    <AuthProvider>
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    </AuthProvider>
  );
};

export default AuthRouteShell;
