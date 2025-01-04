import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';
import { 
  HomeIcon, 
  VideoIcon, 
  ArticleIcon, 
  CourseIcon, 
  PodcastIcon, 
  SettingsIcon, 
  LogoutIcon,
  CollapseIcon
} from '@/components/common/icons';

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <HomeIcon className={styles.icon} />
  },
  {
    path: '/videos',
    label: 'Videos',
    icon: <VideoIcon className={styles.icon} />
  },
  {
    path: '/articles',
    label: 'Articles',
    icon: <ArticleIcon className={styles.icon} />
  },
  {
    path: '/courses',
    label: 'Courses',
    icon: <CourseIcon className={styles.icon} />
  },
  {
    path: '/podcasts',
    label: 'Podcasts',
    icon: <PodcastIcon className={styles.icon} />
  }
];

const bottomItems: SidebarItem[] = [
  { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/app/settings' },
  { id: 'logout', icon: <LogoutIcon />, label: 'Logout', path: '/logout' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside 
      className={styles.sidebar}
      animate={{ width: isCollapsed ? '72px' : '240px' }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.sidebarContent}>
        {/* Top Section */}
        <div className={styles.topSection}>
          <button 
            className={styles.collapseButton}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <CollapseIcon className={isCollapsed ? styles.rotated : ''} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className={styles.mainNav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={styles.navItem}
              title={isCollapsed ? item.label : undefined}
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
          {bottomItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={styles.navItem}
              title={isCollapsed ? item.label : undefined}
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
      </div>
    </motion.aside>
  );
};

export default Sidebar; 