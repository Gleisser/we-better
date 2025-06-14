import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './core/router/index';
import { initializeDatabase } from './core/database';
import './styles/index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Initialize the database
initializeDatabase()
  .then(() => {
    console.info('Database initialized successfully');
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
  });

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
