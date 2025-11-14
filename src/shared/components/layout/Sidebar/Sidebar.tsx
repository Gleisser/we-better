import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { CollapseIcon, LifeWheelIcon } from '@/shared/components/common/icons';
import styles from './Sidebar.module.css';
import homeAnimation from './icons/home.json';
import dreamboardAnimation from './icons/dreamboard.json';
import settingsAnimation from './icons/settings.json';
import logoutAnimation from './icons/logout.json';

const SidebarLottieIcon = ({ animationData }: { animationData: object }): JSX.Element => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const play = (): void => {
    lottieRef.current?.stop?.();
    lottieRef.current?.goToAndPlay?.(0, true);
  };

  const stop = (): void => {
    lottieRef.current?.stop?.();
    lottieRef.current?.goToAndStop?.(0, true);
  };

  return (
    <motion.span onHoverStart={play} onHoverEnd={stop} className={styles.lottieWrapper}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        autoplay={false}
        loop={false}
        className={styles.lottieIcon}
        onDOMLoaded={stop}
      />
    </motion.span>
  );
};

const Sidebar = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    return () => {
      document.body.classList.remove('sidebar-collapsed');
    };
  }, [isCollapsed]);

  type MenuItem = {
    path: string;
    label: string;
    icon?: ReactNode;
    animation?: object;
  };

  const menuItems: MenuItem[] = [
    {
      path: '/app/dashboard',
      label: t('navigation.dashboard'),
      animation: homeAnimation,
    },
    {
      path: '/app/life-wheel',
      label: t('navigation.lifeWheel'),
      icon: <LifeWheelIcon className={styles.icon} />,
    },
    {
      path: '/app/dream-board',
      label: t('navigation.dreamBoard'),
      animation: dreamboardAnimation,
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
              <span className={styles.icon}>
                {item.animation ? <SidebarLottieIcon animationData={item.animation} /> : item.icon}
              </span>
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
          <Link
            to="/app/settings"
            className={styles.navItem}
            data-active={isActiveRoute('/app/settings')}
          >
            <span className={styles.icon}>
              <SidebarLottieIcon animationData={settingsAnimation} />
            </span>
            {!isCollapsed && <span className={styles.label}>{t('navigation.settings')}</span>}
          </Link>
          <button className={styles.navItem} onClick={handleSignOut}>
            <span className={styles.icon}>
              <SidebarLottieIcon animationData={logoutAnimation} />
            </span>
            {!isCollapsed && <span className={styles.label}>{t('navigation.logout')}</span>}
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
