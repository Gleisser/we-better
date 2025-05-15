import { useState, useEffect, useCallback } from 'react';

// Define the NetworkInformation interface
// This is not fully supported in all browsers, so we need to define it ourselves
interface NetworkInformation {
  readonly type?: string;
  readonly effectiveType?: string;
  readonly downlink?: number;
  readonly downlinkMax?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean; // Tracks if there was a recent offline state
  connectionType?: string; // Wifi, cellular, etc.
  effectiveConnectionType?: string; // 4g, 3g, 2g, slow-2g
  downlink?: number; // Bandwidth estimate in Mbps
  rtt?: number; // Round-trip time in ms
  saveData?: boolean; // Whether the user has requested reduced data usage
  lastChecked: number; // Timestamp of last check
}

const DEFAULT_STATUS: OnlineStatus = {
  isOnline: navigator.onLine,
  wasOffline: false,
  lastChecked: Date.now(),
};

/**
 * Get browser network connection information if available
 */
function getNetworkConnection(): NetworkInformation | null {
  // Type assertion to bypass TypeScript's lack of support for the Network Information API
  const nav = navigator as unknown as {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  };

  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

/**
 * Hook that monitors the browser's online/offline status
 * and provides additional network information when available.
 */
export function useOnlineStatus(): OnlineStatus {
  const [status, setStatus] = useState<OnlineStatus>(DEFAULT_STATUS);

  // Check network information if available
  const checkNetworkInfo = useCallback(() => {
    const connection = getNetworkConnection();

    if (!connection) {
      return;
    }

    setStatus(prev => ({
      ...prev,
      connectionType: connection.type,
      effectiveConnectionType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    }));
  }, []);

  // Handle online status change
  const handleOnlineStatusChange = useCallback(() => {
    const now = Date.now();
    const wasOffline = status.isOnline === false;

    setStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      wasOffline: wasOffline,
      lastChecked: now,
    }));

    // Also check network info
    checkNetworkInfo();
  }, [checkNetworkInfo, status.isOnline]);

  useEffect(() => {
    // Initialize
    handleOnlineStatusChange();

    // Add event listeners
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Check for connection API and add change event listener if available
    const connection = getNetworkConnection();

    if (connection) {
      connection.addEventListener('change', checkNetworkInfo);
    }

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);

      if (connection) {
        connection.removeEventListener('change', checkNetworkInfo);
      }
    };
  }, [handleOnlineStatusChange, checkNetworkInfo]);

  return status;
}

// Test network quality based on RTT and downlink
export function getNetworkQuality(status: OnlineStatus): 'good' | 'fair' | 'poor' | 'unknown' {
  if (!status.isOnline) {
    return 'poor';
  }

  // If we have network information
  if (status.rtt !== undefined && status.downlink !== undefined) {
    if (status.rtt < 100 && status.downlink > 5) {
      return 'good';
    } else if (status.rtt < 300 && status.downlink > 1) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  // If we have effective connection type
  if (status.effectiveConnectionType) {
    switch (status.effectiveConnectionType) {
      case '4g':
        return 'good';
      case '3g':
        return 'fair';
      case '2g':
      case 'slow-2g':
        return 'poor';
      default:
        return 'unknown';
    }
  }

  return 'unknown';
}
