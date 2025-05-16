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
```

## Schema Migration

The queue schema is versioned and can be updated with the migration system. Current schema version is 2.

## Error Handling and Retries

Failed requests are automatically retried with exponential backoff:

- 1st retry: 2 seconds after failure
- 2nd retry: 4 seconds after failure
- 3rd retry: 8 seconds after failure
- 4th retry: 16 seconds after failure
- 5th retry: 30 seconds after failure (capped)

After 5 retries, the request is marked as permanently failed.

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
