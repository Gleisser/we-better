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
    <PublicRoute>
      <AuthLayout />
    </PublicRoute>
  );
};

export default AuthRouteShell;
