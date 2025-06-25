import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import {
  HomeIcon,
  SettingsIcon,
  LogoutIcon,
  CollapseIcon,
  LifeWheelIcon,
  DreamBoardIcon,
} from '@/shared/components/common/icons';
import styles from './Sidebar.module.css';

const Sidebar = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      path: '/app/dashboard',
      label: t('navigation.dashboard'),
      icon: <HomeIcon className={styles.icon} />,
    },
    {
      path: '/app/life-wheel',
      label: t('navigation.lifeWheel'),
      icon: <LifeWheelIcon className={styles.icon} />,
    },
    {
      path: '/app/dream-board',
      label: t('navigation.dreamBoard'),
      icon: <DreamBoardIcon className={styles.icon} />,
    },
  ];

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
            {!isCollapsed && <span className={styles.label}>{t('navigation.settings')}</span>}
          </Link>
          <button className={styles.navItem} onClick={handleSignOut}>
            <LogoutIcon className={styles.icon} />
            {!isCollapsed && <span className={styles.label}>{t('navigation.logout')}</span>}
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
