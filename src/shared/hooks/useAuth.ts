import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';

/**
 * Custom hook to access the authentication context.
 * Provides type-safe access to auth state and methods.
 *
 * @returns {AuthContextType} The authentication context value
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, logout, isLoading } = useAuth();
 *
 *   if (isLoading) return <Loading />;
 *   if (!user) return <Navigate to="/login" />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome {user.full_name}</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = (): AuthContextType => useContext(AuthContext);
