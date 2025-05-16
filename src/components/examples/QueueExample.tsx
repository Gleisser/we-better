import React, { ReactNode, useState } from 'react';
import {
  useQueuedQuery,
  useQueuedMutation,
  useQueueStatus,
  useQueueHealth,
  useQueuedRequest,
} from '../../core/query/queueIntegration';
import { RequestPriority } from '../../core/database/db';

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserInput {
  name: string;
  email: string;
}

interface CreationResponse {
  success: boolean;
  queued: boolean;
  requestId?: string;
  message?: string;
}

export function QueueExample(): ReactNode {
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [lastRequestId, setLastRequestId] = useState<string>('');

  // Query example - fetch users
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQueuedQuery<User[]>({
    endpoint: '/api/users',
    priority: RequestPriority.MEDIUM,
    offline: {
      enabled: true,
      skipOfflineCache: false,
    },
  });

  // Mutation example - create user
  const {
    mutate: createUser,
    isPending: isCreating,
    isSuccess,
    data: creationResult,
  } = useQueuedMutation<CreationResponse, CreateUserInput>({
    endpoint: '/api/users',
    method: 'POST',
    priority: RequestPriority.HIGH,
    offline: { enabled: true },
    optimisticUpdate: {
      queryKey: ['queued', '/api/users'],
      updateFn: (oldData, variables) => {
        // Optimistically add the new user
        const currentUsers = (oldData as User[]) || [];
        const newUser: User = {
          id: Math.floor(Math.random() * -1000), // Temporary negative ID
          name: variables.name,
          email: variables.email,
        };
        return [...currentUsers, newUser];
      },
    },
    onSuccess: data => {
      if (data.requestId) {
        setLastRequestId(data.requestId);
      }
      // Reset form on success
      setNewUserName('');
      setNewUserEmail('');
    },
  });

  // Queue status monitoring
  const { data: queueStatus } = useQueueStatus();

  // Queue health monitoring
  const { data: queueHealth } = useQueueHealth();

  // Monitor a specific request
  const { data: requestStatus } = useQueuedRequest(lastRequestId);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    createUser({ name: newUserName, email: newUserEmail });
  };

  return (
    <div className="queue-example">
      <h1>Queue Integration Example</h1>

      <div className="queue-status">
        <h2>Queue Status</h2>
        {queueStatus ? (
          <div>
            <p>Pending: {queueStatus.pending}</p>
            <p>Processing: {queueStatus.processing}</p>
            <p>Failed: {queueStatus.failed}</p>
            <p>Completed: {queueStatus.completed}</p>
            <p>Failure Rate: {(queueStatus.failureRate * 100).toFixed(1)}%</p>
          </div>
        ) : (
          <p>Loading queue status...</p>
        )}
      </div>

      <div className="queue-health">
        <h2>Queue Health</h2>
        {queueHealth ? (
          <div>
            <p>Status: {queueHealth.isHealthy ? '✅ Healthy' : '❌ Issues Detected'}</p>
            {queueHealth.issues.length > 0 && (
              <div>
                <p>Issues:</p>
                <ul>
                  {queueHealth.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>Loading health data...</p>
        )}
      </div>

      {lastRequestId && (
        <div className="request-status">
          <h2>Last Request Status</h2>
          {requestStatus ? (
            <div>
              <p>ID: {requestStatus.id}</p>
              <p>Status: {requestStatus.status}</p>
              <p>Endpoint: {requestStatus.endpoint}</p>
              <p>Method: {requestStatus.method}</p>
              <p>Attempts: {requestStatus.attempts}</p>
              {requestStatus.errorMessage && <p>Error: {requestStatus.errorMessage}</p>}
            </div>
          ) : (
            <p>Loading request data...</p>
          )}
        </div>
      )}

      <div className="users-section">
        <h2>Users</h2>
        {isLoading ? (
          <p>Loading users...</p>
        ) : isError ? (
          <div className="error">
            <p>Error loading users: {error instanceof Error ? error.message : 'Unknown error'}</p>
            <button onClick={() => refetch()}>Retry</button>
          </div>
        ) : (
          <ul className="users-list">
            {users?.map(user => (
              <li key={user.id}>
                <strong>{user.name}</strong> ({user.email})
              </li>
            ))}
            {users?.length === 0 && <p>No users found</p>}
          </ul>
        )}
      </div>

      <div className="create-user">
        <h2>Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={newUserEmail}
              onChange={e => setNewUserEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create User'}
          </button>

          {isSuccess && creationResult?.queued && (
            <p className="success">
              User will be created when online. Request ID: {creationResult.requestId}
            </p>
          )}
        </form>
      </div>

      <style>
        {`
        .queue-example {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          margin-bottom: 20px;
        }
        
        h2 {
          margin-top: 30px;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        
        .queue-status, .queue-health, .request-status {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .users-list {
          list-style: none;
          padding: 0;
        }
        
        .users-list li {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
        }
        
        input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        button {
          padding: 10px 15px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        
        .error {
          color: #e53e3e;
          margin-top: 10px;
        }
        
        .success {
          color: #38a169;
          margin-top: 10px;
        }
      `}
      </style>
    </div>
  );
}
