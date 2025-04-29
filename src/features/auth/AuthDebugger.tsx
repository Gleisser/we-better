import { useAuth } from '@/shared/contexts/AuthContext';

const AuthDebugger = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', fontSize: '12px', zIndex: 9999 }}>
      <div>Auth State:</div>
      <div>User: {user ? `${user.email} (${user.id})` : 'None'}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default AuthDebugger; 