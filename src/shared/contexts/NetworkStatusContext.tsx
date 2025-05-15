import React, { createContext, useEffect, useState } from 'react';
import { useOnlineStatus, OnlineStatus, getNetworkQuality } from '../hooks/useOnlineStatus';

export interface NetworkStatusContextValue {
  status: OnlineStatus;
  quality: 'good' | 'fair' | 'poor' | 'unknown';
  reconnecting: boolean;
  lastReconnectAttempt: number | null;
  listeners: Set<(status: OnlineStatus) => void>;
  subscribe: (listener: (status: OnlineStatus) => void) => () => void;
}

export const NetworkStatusContext = createContext<NetworkStatusContextValue | undefined>(undefined);

/**
 * Provider component for the NetworkStatusContext
 */
export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const status = useOnlineStatus();
  const quality = getNetworkQuality(status);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastReconnectAttempt, setLastReconnectAttempt] = useState<number | null>(null);
  const [listeners] = useState<Set<(status: OnlineStatus) => void>>(() => new Set());

  // Subscribe function to add listeners for status changes
  const subscribe = (listener: (status: OnlineStatus) => void) => {
    listeners.add(listener);

    // Return unsubscribe function
    return () => {
      listeners.delete(listener);
    };
  };

  // When status changes, notify all listeners
  useEffect(() => {
    listeners.forEach(listener => listener(status));

    // Handle reconnection
    if (status.isOnline && status.wasOffline) {
      setReconnecting(true);
      setLastReconnectAttempt(Date.now());

      // After a delay, set reconnecting back to false
      const timer = setTimeout(() => {
        setReconnecting(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, listeners]);

  const value: NetworkStatusContextValue = {
    status,
    quality,
    reconnecting,
    lastReconnectAttempt,
    listeners,
    subscribe,
  };

  return <NetworkStatusContext.Provider value={value}>{children}</NetworkStatusContext.Provider>;
};
