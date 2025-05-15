import React from 'react';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { NetworkStatusContextValue } from '@/shared/contexts/NetworkStatusContext';

/**
 * Higher-order component that adds network status to a component
 */
export function withNetworkStatus<P extends object>(
  Component: React.ComponentType<P & { networkStatus: NetworkStatusContextValue }>
): React.FC<P> {
  return (props: P) => {
    const networkStatus = useNetworkStatus();
    return <Component {...props} networkStatus={networkStatus} />;
  };
}
