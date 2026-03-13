import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './core/router/index';
import { initializeDatabase } from './core/database';
import './styles/index.css';

// Initialize i18n
import './core/i18n';

// Initialize the database
initializeDatabase()
  .then(() => {
    console.info('Database initialized successfully');
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
  });

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-notifications.js').catch(error => {
      console.warn('Service worker registration failed:', error);
    });
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
