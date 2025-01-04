import { createBrowserRouter } from 'react-router-dom';
import WeBetterApp from '@/pages/WeBetterApp';
import Dashboard from '@/pages/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WeBetterApp />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      // ... other routes
    ]
  }
]); 