import { Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/config/react-query';
import ReactQueryDevtoolsLoader from '@/shared/components/debug/ReactQueryDevtoolsLoader';

const PublicRouteShell = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ReactQueryDevtoolsLoader />
    </QueryClientProvider>
  );
};

export default PublicRouteShell;
