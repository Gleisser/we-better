import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/shared/contexts/AuthContext';

const SharedAuthShell = (): JSX.Element => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

export default SharedAuthShell;
