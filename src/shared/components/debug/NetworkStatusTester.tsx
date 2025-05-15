import React, { useState } from 'react';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';

/**
 * Debug component for testing the network status functionality.
 * This component should only be used in development.
 */
export const NetworkStatusTester: React.FC = () => {
  const networkStatus = useNetworkStatus();
  const [showDetails, setShowDetails] = useState(false);

  const toggleOfflineStatus = (): void => {
    // This function simulates going offline/online
    // It only changes the browser's navigator.onLine property for testing
    const script = document.createElement('script');

    if (networkStatus.status.isOnline) {
      // Simulate going offline
      script.textContent = `
        // Store original property
        window._originalNavigatorOnLine = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine');
        
        // Override onLine property
        Object.defineProperty(Navigator.prototype, 'onLine', {
          get: function() { return false; },
          configurable: true
        });
        
        // Dispatch offline event
        window.dispatchEvent(new Event('offline'));
      `;
    } else {
      // Simulate going back online
      script.textContent = `
        // Restore original property if available
        if (window._originalNavigatorOnLine) {
          Object.defineProperty(Navigator.prototype, 'onLine', window._originalNavigatorOnLine);
          delete window._originalNavigatorOnLine;
        } else {
          // Default to true if original not stored
          Object.defineProperty(Navigator.prototype, 'onLine', {
            get: function() { return true; },
            configurable: true
          });
        }
        
        // Dispatch online event
        window.dispatchEvent(new Event('online'));
      `;
    }

    document.body.appendChild(script);
    document.body.removeChild(script);
  };

  // Format the network data for display
  const formatData = (data: unknown): string => {
    if (data === undefined) return 'undefined';
    if (data === null) return 'null';
    return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
  };

  return (
    <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 my-4">
      <h2 className="text-xl font-semibold mb-4">Network Status Tester</h2>

      <div className="mb-4">
        <span className="font-medium mr-2">Status:</span>
        <span
          className={`inline-block px-2 py-1 rounded text-white font-medium ${
            networkStatus.status.isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {networkStatus.status.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="mb-4">
        <span className="font-medium mr-2">Quality:</span>
        <span
          className={`inline-block px-2 py-1 rounded text-white font-medium ${
            networkStatus.quality === 'good'
              ? 'bg-green-500'
              : networkStatus.quality === 'fair'
                ? 'bg-blue-500'
                : networkStatus.quality === 'poor'
                  ? 'bg-amber-500'
                  : 'bg-gray-500'
          }`}
        >
          {networkStatus.quality}
        </span>
      </div>

      {networkStatus.reconnecting && (
        <div className="mb-4">
          <span className="inline-block px-2 py-1 rounded bg-blue-500 text-white font-medium">
            Reconnecting...
          </span>
        </div>
      )}

      <button
        onClick={toggleOfflineStatus}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 mb-4"
      >
        Simulate {networkStatus.status.isOnline ? 'Offline' : 'Online'}
      </button>

      <div className="mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Network Status Details:</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-auto max-h-96">
            <pre>{formatData(networkStatus.status)}</pre>
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-600">
        Note: This is a development tool for testing network status detection.
      </p>
    </div>
  );
};
