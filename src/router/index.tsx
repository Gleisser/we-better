import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import WeBetterApp from '@/pages/WeBetterApp';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/app',
    element: <WeBetterApp />,
  },
]); 