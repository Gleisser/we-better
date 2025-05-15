import { useContext } from 'react';
import {
  NetworkStatusContext,
  NetworkStatusContextValue,
} from '@/shared/contexts/NetworkStatusContext';

/**
 * Hook to use the network status
 */
export const useNetworkStatus = (): NetworkStatusContextValue => {
  const context = useContext(NetworkStatusContext);

  if (context === undefined) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }

  return context;
};
