/**
 * MobileNav Component
 * 
 * A responsive mobile navigation bar component that provides the main navigation structure
 * for the application on mobile devices. It renders as a fixed bar at the bottom of the screen
 * with icon-based navigation items.
 * 
 * Features:
 * - Fixed positioning at the bottom of mobile viewport
 * - Icon and label based navigation items
 * - Active route highlighting
 * - React Router integration for client-side navigation
 * - Predefined navigation structure for main app sections
 * 
 * The component handles:
 * - Route management through React Router
 * - Active state tracking for current route
 * - Visual feedback for user interaction
 * - Consistent navigation structure across the app
 * 
 * Navigation sections include:
 * - Dashboard (Home)
 * - Videos
 * - Articles
 * - Courses
 * - Podcasts
 * 
 * @component
 * @example
 * ```tsx
 * function AppLayout() {
 *   return (
 *     <>
 *       <main>Content</main>
 *       <MobileNav />
 *     </>
 *   );
 * }
 * ```
 */

import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, VideoIcon, ArticleIcon, CourseIcon, PodcastIcon } from '@/shared/components/common/icons';
import styles from './MobileNav.module.css';

const NAV_ITEMS = [
  {
    label: 'Home',
    icon: HomeIcon,
    path: '/app/dashboard'
  },
  {
    label: 'Videos',
    icon: VideoIcon,
    path: '/app/videos'
  },
  {
    label: 'Articles',
    icon: ArticleIcon,
    path: '/app/articles'
  },
  {
    label: 'Courses',
    icon: CourseIcon,
    path: '/app/courses'
  },
  {
    label: 'Podcasts',
    icon: PodcastIcon,
    path: '/app/podcasts'
  }
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className={styles.mobileNav}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Icon className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}; 