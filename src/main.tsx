import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './core/router/index';
import { initializeDatabase } from './core/database/db';
import { NetworkStatusProvider } from '@/shared/contexts/NetworkStatusContext';
import { queryClient } from './core/query/queryClient';
import * as serviceWorker from './core/serviceWorker/register';
import './styles/index.css';

// Initialize the database
initializeDatabase()
  .then(() => {
    console.info('Database initialized successfully');
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
  });

// Register service worker
serviceWorker.register({
  onSuccess: _registration => {
    console.info('Service worker registered successfully');
  },
  onUpdate: registration => {
    // Show update notification in a more user-friendly way if needed
    const updateApp = window.confirm(
      'A new version of the app is available. Would you like to update now?'
    );

    if (updateApp && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <NetworkStatusProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </NetworkStatusProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
