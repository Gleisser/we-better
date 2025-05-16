# IndexedDB Request Queue System

This module provides a robust request queuing system for handling API requests, with support for offline operations, retries, and prioritization.

## Features

- **Request Prioritization**: Queue requests with different priority levels (LOW, MEDIUM, HIGH, CRITICAL).
- **Request Metadata**: Each request includes metadata like creation time, number of attempts, and status.
- **Automatic Retries**: Failed requests are automatically retried with exponential backoff.
- **Request Grouping**: Group related requests together for batch operations.
- **Concurrency Control**: Limit the number of concurrent API requests.
- **Request Status Tracking**: Monitor request status (PENDING, PROCESSING, FAILED, COMPLETED).
- **Request Serialization**: Serialize and deserialize requests for storage or transmission.
- **Explicit Enqueue/Dequeue Operations**: Direct control over adding and retrieving requests from the queue.
- **Background Processing**: Intelligent background processing that respects network status and browser state.
- **Smart Retry Mechanisms**: Configurable retry strategies with exponential backoff and jitter.

## How It Works

The request queue system consists of several components:

1. **Database Schema**: The IndexedDB schema for storing queued requests.
2. **Queue Service**: Methods for adding, retrieving, and managing requests.
3. **Queue Processor**: Background process that executes queued requests.
4. **Queue Utilities**: Helper functions for common queue operations.
5. **Request Serializer**: Utilities for serializing and deserializing requests.

## Basic Usage

### Initialize the Queue System

Initialize the queue system during application startup:

```typescript
import { queueUtils } from '@/core/database/queueUtils';

// Initialize with default settings
queueUtils.initialize();

// Or with custom settings
queueUtils.initialize({
  autoStart: true,
  processingInterval: 1000, // Check for new requests every 1 second
  maxConcurrent: 5, // Process up to 5 requests at a time
});
```

### Adding Requests to the Queue

Use the helper methods for different HTTP methods:

```typescript
// Queue a GET request
const getRequestId = await queueUtils.queueGet('/api/users');

// Queue a POST request
const postRequestId = await queueUtils.queuePost('/api/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Queue a PUT request
const putRequestId = await queueUtils.queuePut('/api/users/123', {
  name: 'John Updated',
});

// Queue a DELETE request
const deleteRequestId = await queueUtils.queueDelete('/api/users/123');
```

### Explicit Enqueue Operations

For more control, you can use the explicit enqueue methods:

```typescript
import { RequestPriority } from '@/core/database/db';

// Enqueue a request with specific properties
const requestId = await queueService.enqueue({
  endpoint: '/api/users',
  method: 'POST',
  body: { name: 'John' },
  priority: RequestPriority.HIGH,
  tags: ['user', 'create'],
});

// Enqueue a native fetch Request
const fetchRequest = new Request('/api/data', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' }),
});
const requestId = await queueUtils.enqueueFetchRequest(fetchRequest, {
  priority: RequestPriority.HIGH,
});

// Enqueue multiple requests at once
const requestIds = await queueService.enqueueBatch([
  { endpoint: '/api/users/1', method: 'GET' },
  { endpoint: '/api/users/2', method: 'GET' },
]);
```

### Dequeue Operations

Retrieve requests from the queue:

```typescript
// Dequeue a single request
const request = await queueUtils.dequeue({
  priority: RequestPriority.HIGH,
  markAsProcessing: true,
});

// Dequeue multiple requests
const requests = await queueUtils.dequeueBatch(5, {
  groupId: 'batch-1',
  markAsProcessing: true,
});

// Process dequeued requests
if (request) {
  const response = await fetch(request.endpoint, {
    method: request.method,
    body: request.body ? JSON.stringify(request.body) : undefined,
  });

  if (response.ok) {
    await queueService.markAsCompleted(request.id);
  } else {
    await queueService.markAsFailed(request.id, 'API Error');
  }
}
```

### Request Serialization

Serialize requests for storage or transmission:

```typescript
// Serialize a request to JSON
const serialized = queueUtils.serializeRequest(request);

// Deserialize a request from JSON
const request = queueUtils.deserializeRequest(serialized);

// Store a request in localStorage
queueUtils.storeRequestLocally('pending-request', request);

// Retrieve a request from localStorage
const storedRequest = queueUtils.retrieveRequestLocally('pending-request');

// Convert a QueuedRequest to a native fetch Request
const fetchRequest = queueUtils.toFetchRequest(queuedRequest);

// Enqueue a serialized request
const requestId = await queueUtils.enqueueFromSerialized(serializedRequest);

// Enqueue multiple serialized requests
const requestIds = await queueUtils.enqueueBatchFromSerialized(serializedRequests);
```

### Request Prioritization

Specify priority when queuing requests:

```typescript
import { RequestPriority } from '@/core/database/db';

// Queue a high-priority request
await queueUtils.queuePost('/api/important-data', data, {
  priority: RequestPriority.HIGH,
});

// Queue a low-priority request
await queueUtils.queuePost('/api/analytics-data', data, {
  priority: RequestPriority.LOW,
});
```

### Request Grouping

Group related requests together:

```typescript
// Create a group ID
const groupId = queueUtils.createGroupId();

// Queue multiple requests with the same group ID
await queueUtils.queuePost('/api/users', userData, { groupId });
await queueUtils.queuePost('/api/profiles', profileData, { groupId });
await queueUtils.queuePost('/api/preferences', preferencesData, { groupId });

// Later, you can retry all failed requests in the group
await queueUtils.retryGroup(groupId);
```

### Tagging Requests

Add tags to requests for categorization:

```typescript
// Queue a request with tags
await queueUtils.queuePost('/api/data', data, {
  tags: ['user-generated', 'analytics'],
});
```

## Advanced Usage

### Background Processing Configuration

Configure the queue processor's behavior for background processing:

```typescript
import { queueProcessor } from '@/core/database/queueProcessor';

// Start with custom retry configuration
queueProcessor.start({
  interval: 5000, // Check every 5 seconds
  maxConcurrent: 3, // Process up to 3 requests at a time
  retryConfig: {
    maxRetries: 8, // Maximum number of retry attempts
    initialBackoffMs: 2000, // Start with 2 seconds
    maxBackoffMs: 120000, // Max 2 minutes
    backoffFactor: 1.5, // Exponential factor
    jitter: true, // Add randomness to prevent thundering herd
  },
});
```

### Monitoring Queue Status

Get detailed information about the queue's status:

```typescript
// Get current queue status
const status = await queueUtils.getQueueStats();
console.log(`Pending: ${status.stats.pending}, Processing: ${status.stats.processing}`);
console.log(`Failed: ${status.stats.failed}, Completed: ${status.stats.completed}`);

// Get processor status
const processorStatus = queueProcessor.getStatus();
console.log(`Active requests: ${processorStatus.activeRequests}/${processorStatus.maxConcurrent}`);
console.log(`Network status: ${processorStatus.isOnline ? 'Online' : 'Offline'}`);
```

### Manual Retry of Failed Requests

Manually retry a specific failed request:

```typescript
// Retry a specific request
const wasRetried = await queueProcessor.manualRetry('request-id-123');
if (wasRetried) {
  console.log('Request was retried successfully');
} else {
  console.log('Request could not be retried (not found or not failed)');
}
```

### Waiting for Queue Idle

Wait for all in-progress requests to complete (useful for testing or shutdown):

```typescript
// Wait for all in-flight requests to complete
await queueProcessor.waitForIdle();
console.log('All requests are now complete');
```

### Direct Access to Queue Service

For more advanced operations, you can use the queue service directly:

```typescript
import { queueService } from '@/core/database/queueService';
import { RequestStatus } from '@/core/database/db';

// Get requests with a specific status
const pendingRequests = await queueService.getRequests({
  status: RequestStatus.PENDING,
});

// Get queue statistics
const stats = await queueService.getQueueStats();
```

### Controlling the Queue Processor

Control the queue processor manually:

```typescript
import { queueProcessor } from '@/core/database/queueProcessor';

// Stop the queue processor
queueProcessor.stop();

// Start the queue processor
queueProcessor.start({
  interval: 5000, // Check every 5 seconds
  maxConcurrent: 2, // Process up to 2 requests at a time
});

// Get processor status
const status = queueProcessor.getStatus();

// Reset the processor state (for error recovery)
queueProcessor.reset();
```

## Retry Mechanism

The queue processor implements a sophisticated retry mechanism with the following features:

1. **Exponential Backoff**: Retry intervals increase exponentially with each attempt.
2. **Jitter**: Random variation in retry times to prevent the "thundering herd" problem.
3. **Smart Error Categorization**: Some errors are marked as non-retryable.
4. **Maximum Retries**: Configurable maximum number of retry attempts.
5. **Request-specific State**: Each request tracks its own attempt count and error state.

### Error Classification

The processor intelligently categorizes errors:

- **Retryable Errors**: Server errors (HTTP 5xx), network timeouts, and specific client errors (408, 429).
- **Non-retryable Errors**: Most client errors (HTTP 4xx), CORS errors, invalid URLs.

### Browser State Awareness

The queue processor is aware of the browser's state:

- **Network Status**: Pauses processing when offline, resumes when back online.
- **Tab Visibility**: Adjusts processing when the tab is not active.
- **Page Unload**: Preserves state when the page is closed/reloaded.

## Schema Migration

The queue schema is versioned and can be updated with the migration system. Current schema version is 2.

## Error Handling and Retries

Failed requests are automatically retried with exponential backoff:

- 1st retry: Initial backoff (default: 1 second, with jitter)
- 2nd retry: 2x initial backoff
- 3rd retry: 4x initial backoff
- 4th retry: 8x initial backoff
- 5th retry: 16x initial backoff (capped at 1 minute by default)

After the maximum retries (default: 5), the request is marked as permanently failed.

## Queue Maintenance

Clear completed requests:

```typescript
await queueUtils.clearCompleted();
```

## Implementation Details

The queue system uses Dexie.js for IndexedDB access and implements the following schema:

```typescript
requestQueue: '++id, endpoint, method, createdAt, attempts, priority, status, lastAttempt, retryAfter, groupId, [status+priority], [groupId+status]';
```

This enables efficient queries for processing the queue based on status and priority.

# Queue System Documentation

## Queue Monitoring

The queue monitoring system provides real-time metrics and health monitoring for the request queue. It helps track queue performance, identify issues, and ensure the system is operating correctly.

### Features

- **Real-time status tracking**: Monitor pending, processing, failed, and completed requests
- **Health monitoring**: Automatic detection of queue health issues
- **Stuck request detection**: Identify and recover requests stuck in processing
- **Performance metrics**: Track processing time, failure rates, and retry statistics
- **Auto-recovery**: Automatically recover from common failure scenarios

### Usage

The queue monitoring is integrated with the queue system and is enabled by default when initializing the queue:

```typescript
import { queueUtils } from './core/database/queueUtils';

// Initialize queue with monitoring
queueUtils.initialize({
  // Queue processor options
  autoStart: true,
  processingInterval: 5000,
  maxConcurrent: 3,

  // Monitoring options
  monitoringEnabled: true,
  monitorInterval: 30000, // 30 seconds

  // Custom health check thresholds
  healthCheckThresholds: {
    maxHealthyPendingCount: 100,
    maxHealthyFailedCount: 20,
    stuckRequestThresholdMs: 5 * 60 * 1000, // 5 minutes
    highFailureRateThreshold: 0.25, // 25%
  },
});
```

### Monitoring API

The monitoring API is available through the `queueUtils` interface:

```typescript
// Get current queue status metrics
const status = await queueUtils.getQueueStatus();
console.log('Pending requests:', status.pending);
console.log('Processing requests:', status.processing);
console.log('Failed requests:', status.failed);
console.log('Avg processing time:', status.avgProcessingTime);

// Check queue health
const health = await queueUtils.checkQueueHealth();
if (!health.isHealthy) {
  console.warn('Queue health issues:', health.issues);
}

// Manually recover stuck requests
const recovered = await queueUtils.recoverStuckRequests();
console.log(`Recovered ${recovered} stuck requests`);

// Get retry statistics
const retryStats = await queueUtils.getRetryStats();
console.log('Success rate after retry:', retryStats.successRateAfterRetry);
```

### Advanced Usage: Custom Event Handling

For more advanced usage, you can directly interact with the queue monitor and register custom event handlers:

```typescript
import { queueMonitor, QueueMonitorEvent } from './core/database/queueMonitor';

// Listen for queue health changes
queueMonitor.events.on(QueueMonitorEvent.QUEUE_HEALTH_CHANGED, health => {
  if (!health.isHealthy) {
    // Send notification to administrators
    notifyAdmins(`Queue issues detected: ${health.issues.join(', ')}`);
  }
});

// Listen for stuck requests
queueMonitor.events.on(QueueMonitorEvent.REQUEST_STUCK, request => {
  // Log detailed information about stuck request
  logStuckRequest(request);

  // Attempt custom recovery procedure
  customRecoveryProcedure(request);
});

// Listen for high failure rates
queueMonitor.events.on(QueueMonitorEvent.HIGH_FAILURE_RATE, rate => {
  // Alert ops team about high failure rate
  alertOpsTeam(`API failure rate: ${(rate * 100).toFixed(1)}%`);
});
```

### Status Metrics

The queue status includes the following metrics:

- **pending**: Number of pending requests
- **processing**: Number of requests currently being processed
- **failed**: Number of failed requests
- **completed**: Number of completed requests
- **total**: Total number of requests in the queue
- **oldestPendingTimestamp**: Timestamp of the oldest pending request
- **newestPendingTimestamp**: Timestamp of the newest pending request
- **failureRate**: Rate of request failures (failed / total attempted)
- **avgProcessingTime**: Average time to process requests
- **byEndpoint**: Request counts grouped by endpoint
- **byPriority**: Request counts grouped by priority

### Health Status

The queue health status includes:

- **isHealthy**: Boolean indicating if the queue is healthy
- **issues**: Array of detected issues as descriptive strings
- **pendingCount**: Number of pending requests
- **failedCount**: Number of failed requests
- **stuckCount**: Number of stuck requests
- **oldestPendingAge**: Age of the oldest pending request (ms)

### Integration with UI

You can integrate queue monitoring with your application's UI to provide real-time status information to users or administrators. For example:

```typescript
// In a React component
import { useEffect, useState } from 'react';
import { queueUtils } from './core/database/queueUtils';
import { QueueStatusMetrics } from './core/database/queueMonitor';

function QueueStatusDisplay() {
  const [status, setStatus] = useState<QueueStatusMetrics | null>(null);

  useEffect(() => {
    // Initial status fetch
    queueUtils.getQueueStatus().then(setStatus);

    // Regular updates
    const intervalId = setInterval(() => {
      queueUtils.getQueueStatus().then(setStatus);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  if (!status) return <div>Loading queue status...</div>;

  return (
    <div className="queue-status">
      <h2>Queue Status</h2>
      <div className="metrics">
        <div className="metric">
          <span className="label">Pending:</span>
          <span className="value">{status.pending}</span>
        </div>
        <div className="metric">
          <span className="label">Processing:</span>
          <span className="value">{status.processing}</span>
        </div>
        <div className="metric">
          <span className="label">Failed:</span>
          <span className="value">{status.failed}</span>
        </div>
        <div className="metric">
          <span className="label">Completed:</span>
          <span className="value">{status.completed}</span>
        </div>
        <div className="metric">
          <span className="label">Failure Rate:</span>
          <span className="value">{(status.failureRate * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
```
