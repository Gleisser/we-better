import { Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/config/react-query';
import ReactQueryDevtoolsLoader from '@/shared/components/debug/ReactQueryDevtoolsLoader';
import {
  APP_FONT_PRELOADS,
  APP_FONT_STYLESHEET,
  useFontStylesheets,
} from '@/shared/hooks/useFontStylesheets';

const PublicRouteShell = (): JSX.Element => {
  useFontStylesheets({
    preloads: APP_FONT_PRELOADS,
    stylesheets: [APP_FONT_STYLESHEET],
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ReactQueryDevtoolsLoader />
    </QueryClientProvider>
  );
};

export default PublicRouteShell;
