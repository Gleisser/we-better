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
 * - Dream Board
 * - Missions
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
import { HomeIcon, DreamBoardIcon, SparkleIcon } from '@/shared/components/common/icons';
import styles from './MobileNav.module.css';

const NAV_ITEMS = [
  {
    label: 'Home',
    icon: HomeIcon,
    path: '/app/dashboard',
  },
  {
    label: 'Dream Board',
    icon: DreamBoardIcon,
    path: '/app/dream-board',
  },
  {
    label: 'Missions',
    icon: SparkleIcon,
    path: '/app/missions',
  },
];

export const MobileNav = (): JSX.Element => {
  const location = useLocation();

  return (
    <nav className={styles.mobileNav}>
      {NAV_ITEMS.map(item => {
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
