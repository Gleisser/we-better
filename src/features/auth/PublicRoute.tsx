/**
 * PublicRoute Component
 *
 * A route wrapper component that handles authentication-based routing logic for public routes.
 * It prevents authenticated users from accessing public pages (like login/register) while
 * allowing unauthenticated access.
 *
 * Features:
 * - Authentication state checking
 * - Automatic redirection for authenticated users
 * - Loading state handling
 * - Special case handling for reset password routes
 * - React Router integration
 *
 * The component handles:
 * - Protection of public routes from authenticated users
 * - Loading states during authentication checks
 * - Special access rules for password reset flows
 * - Preservation of route children when access is granted
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when access is granted
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <Routes>
 *       <Route path="/auth" element={
 *         <PublicRoute>
 *           <LoginPage />
 *         </PublicRoute>
 *       } />
 *     </Routes>
 *   );
 * }
 * ```
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

export const PublicRoute = ({ children }: { children: React.ReactNode }): JSX.Element => {
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
