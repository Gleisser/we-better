# Network Status Detection

This module provides components and hooks for detecting online/offline status and network quality in the application.

## Components

### NetworkStatusProvider

The `NetworkStatusProvider` component is a context provider that makes network status information available throughout the application. It should be placed high in the component tree, typically near the root of the application.

```jsx
import { NetworkStatusProvider } from '@/shared/contexts/NetworkStatusContext';

// In your application's entry point:
<NetworkStatusProvider>
  <App />
</NetworkStatusProvider>;
```

### OfflineIndicator

The `OfflineIndicator` component displays a status bar when the user is offline or has a poor connection. It automatically appears and disappears based on connection status.

```jsx
import { OfflineIndicator } from '@/shared/components/common/OfflineIndicator';

// In your application layout:
<YourLayoutComponent>
  <YourContent />
  <OfflineIndicator />
</YourLayoutComponent>;
```

## Hooks

### useOnlineStatus

The `useOnlineStatus` hook provides detailed information about the current network status:

```typescript
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';

function MyComponent() {
  const status = useOnlineStatus();

  if (!status.isOnline) {
    return <div>You are offline. Please check your connection.</div>;
  }

  return <div>Your app content</div>;
}
```

### useNetworkStatus

The `useNetworkStatus` hook provides enhanced network information including quality assessment and reconnection status:

```typescript
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';

function MyComponent() {
  const { status, quality, reconnecting } = useNetworkStatus();

  if (reconnecting) {
    return <div>Reconnecting...</div>;
  }

  if (quality === 'poor') {
    return <div>Your connection is poor. Some features may not work properly.</div>;
  }

  return <div>Your app content</div>;
}
```

## Testing

For testing purposes, you can use the `NetworkStatusTester` component in development:

```jsx
import { NetworkStatusTester } from '@/shared/components/debug';

function DevTools() {
  return <NetworkStatusTester />;
}
```

## Network Quality Assessment

The system assesses network quality based on the following criteria:

1. **Good**: RTT < 100ms and downlink > 5Mbps, or effective connection type of 4G
2. **Fair**: RTT < 300ms and downlink > 1Mbps, or effective connection type of 3G
3. **Poor**: Higher RTT or lower downlink, or 2G/slow-2G connection, or offline

## Integration with Services

Services and hooks that depend on network connectivity can integrate with the network status system:

```typescript
import { useNetworkStatus } from '@/shared/contexts/NetworkStatusContext';

function useMyDataService() {
  const { status } = useNetworkStatus();

  async function fetchData() {
    if (!status.isOnline) {
      // Get data from local cache
      return getFromCache();
    }

    // Get data from API
    const data = await fetchFromApi();

    // Update cache for offline use
    updateCache(data);

    return data;
  }

  return { fetchData };
}
```
