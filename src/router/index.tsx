import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import WeBetterApp from '@/pages/WeBetterApp';
import Dashboard from '@/pages/Dashboard';
import Videos from '@/pages/Videos';
import Articles from '@/pages/Articles';
import Courses from '@/pages/Courses';
import Podcasts from '@/pages/Podcasts';
import { BottomSheetProvider } from '@/contexts/BottomSheetContext';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/app',
    element: (
      <BottomSheetProvider>
        <WeBetterApp />
      </BottomSheetProvider>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'videos',
        element: <Videos />
      },
      {
        path: 'articles',
        element: <Articles />
      },
      {
        path: 'courses',
        element: <Courses />
      },
      {
        path: 'podcasts',
        element: <Podcasts />
      }
    ],
  },
]); 