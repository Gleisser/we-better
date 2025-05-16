import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

interface ReactQueryProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps your application with React Query context
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps): ReactNode {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
