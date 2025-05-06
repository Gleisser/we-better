import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  HomeIcon,
  VideoIcon,
  ArticleIcon,
  CourseIcon,
  PodcastIcon,
  SettingsIcon,
  LogoutIcon,
  CollapseIcon,
} from '@/shared/components/common/icons';
import styles from './Sidebar.module.css';

const menuItems = [
  {
    path: '/app/dashboard',
    label: 'Dashboard',
    icon: <HomeIcon className={styles.icon} />,
  },
  {
    path: '/app/videos',
    label: 'Videos',
    icon: <VideoIcon className={styles.icon} />,
  },
  {
    path: '/app/articles',
    label: 'Articles',
    icon: <ArticleIcon className={styles.icon} />,
  },
  {
    path: '/app/courses',
    label: 'Courses',
    icon: <CourseIcon className={styles.icon} />,
  },
  {
    path: '/app/podcasts',
    label: 'Podcasts',
    icon: <PodcastIcon className={styles.icon} />,
  },
];

const Sidebar = (): JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const handleSignOut = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const isActiveRoute = (path: string): boolean => {
    // Check if we're at /app or /app/ and the path is dashboard
    if (
      (location.pathname === '/app' || location.pathname === '/app/') &&
      path === '/app/dashboard'
    ) {
      return true;
    }
    // Otherwise check exact path match
    return location.pathname === path;
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}`}>
      <div className={styles.sidebarContent}>
        {/* Collapse Button */}
        <div className={styles.topSection}>
          <button className={styles.collapseButton} onClick={() => setIsCollapsed(!isCollapsed)}>
            <CollapseIcon className={`w-4 h-4 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className={styles.mainNav}>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={styles.navItem}
              data-active={isActiveRoute(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              {!isCollapsed && (
                <motion.span
                  className={styles.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <nav className={styles.bottomNav}>
          <Link to="/settings" className={styles.navItem}>
            <SettingsIcon className={styles.icon} />
            {!isCollapsed && <span className={styles.label}>Settings</span>}
          </Link>
          <button className={styles.navItem} onClick={handleSignOut}>
            <LogoutIcon className={styles.icon} />
            {!isCollapsed && <span className={styles.label}>Logout</span>}
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
