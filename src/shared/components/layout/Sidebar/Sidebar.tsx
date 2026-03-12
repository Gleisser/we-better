import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LottieLightIcon } from '@/shared/components/common/LottieLightIcon';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useBillingSummary } from '@/shared/hooks/useBillingSummary';
import {
  CollapseIcon,
  DreamBoardIcon,
  HomeIcon,
  LifeWheelIcon,
  LogoutIcon,
  SettingsIcon,
  SparkleIcon,
} from '@/shared/components/common/icons';
import homeLottie from './icons/home.json';
import dreamboardLottie from './icons/dreamboard.json';
import settingsLottie from './icons/settings.json';
import logoutLottie from './icons/logout.json';
import styles from './Sidebar.module.css';

const Sidebar = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [iconReplayKeys, setIconReplayKeys] = useState({
    home: 0,
    dreamboard: 0,
    settings: 0,
    logout: 0,
  });
  const location = useLocation();
  const { logout } = useAuth();
  const { data: billingSummary } = useBillingSummary();

  const pricingLabel = t('navigation.pricing') as string;
  const pricingCtaLabel = t('navigation.pricingCta') as string;
  const pricingCtaTop = t('navigation.pricingCtaTop') as string;
  const pricingCtaBottom = t('navigation.pricingCtaBottom') as string;
  const hasActivePaidPlan = useMemo(() => {
    if (!billingSummary) {
      return false;
    }

    return (
      billingSummary.currentPlan !== 'free' &&
      billingSummary.subscriptionStatus.toLowerCase() !== 'free'
    );
  }, [billingSummary]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    return () => {
      document.body.classList.remove('sidebar-collapsed');
    };
  }, [isCollapsed]);

  type MenuItem = {
    iconKey?: keyof typeof iconReplayKeys;
    path: string;
    label: string;
    icon: ReactNode;
  };

  const triggerIconAnimation = (iconKey: keyof typeof iconReplayKeys): void => {
    setIconReplayKeys(previous => ({
      ...previous,
      [iconKey]: previous[iconKey] + 1,
    }));
  };

  const renderAnimatedIcon = (
    iconKey: keyof typeof iconReplayKeys,
    animationData: object,
    fallback: ReactNode
  ): JSX.Element => (
    <LottieLightIcon
      animationData={animationData}
      className={styles.lottieLightIcon}
      colorOverride="currentColor"
      replayKey={iconReplayKeys[iconKey]}
      fallback={fallback}
    />
  );

  const menuItems: MenuItem[] = [
    {
      iconKey: 'home',
      path: '/app/dashboard',
      label: t('navigation.dashboard'),
      icon: renderAnimatedIcon('home', homeLottie, <HomeIcon className={styles.iconFallback} />),
    },
    {
      path: '/app/life-wheel',
      label: t('navigation.lifeWheel'),
      icon: <LifeWheelIcon className={styles.icon} />,
    },
    {
      iconKey: 'dreamboard',
      path: '/app/dream-board',
      label: t('navigation.dreamBoard'),
      icon: renderAnimatedIcon(
        'dreamboard',
        dreamboardLottie,
        <DreamBoardIcon className={styles.iconFallback} />
      ),
    },
    {
      path: '/app/missions',
      label: t('navigation.missions'),
      icon: <SparkleIcon className={styles.icon} />,
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
          {!hasActivePaidPlan &&
            (isCollapsed ? (
              <Link
                to="/app/pricing"
                className={styles.navItem}
                data-active={isActiveRoute('/app/pricing')}
                aria-label={pricingLabel}
                title={pricingLabel}
              >
                <span className={styles.icon}>
                  <SparkleIcon className={styles.icon} />
                </span>
              </Link>
            ) : (
              <Link
                to="/app/pricing"
                className={styles.pricingCta}
                data-active={isActiveRoute('/app/pricing')}
                aria-label={pricingLabel}
              >
                <span className={`${styles.pricingDrawer} ${styles.pricingDrawerTop}`}>
                  {pricingCtaTop}
                </span>
                <span className={`${styles.pricingDrawer} ${styles.pricingDrawerBottom}`}>
                  {pricingCtaBottom}
                </span>
                <span className={styles.pricingButtonCore}>
                  <span className={styles.pricingButtonText}>{pricingCtaLabel}</span>
                </span>
                <svg
                  className={`${styles.pricingCorner} ${styles.pricingCornerOne}`}
                  viewBox="-1 1 32 32"
                >
                  <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z" />
                </svg>
                <svg
                  className={`${styles.pricingCorner} ${styles.pricingCornerTwo}`}
                  viewBox="-1 1 32 32"
                >
                  <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z" />
                </svg>
                <svg
                  className={`${styles.pricingCorner} ${styles.pricingCornerThree}`}
                  viewBox="-1 1 32 32"
                >
                  <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z" />
                </svg>
                <svg
                  className={`${styles.pricingCorner} ${styles.pricingCornerFour}`}
                  viewBox="-1 1 32 32"
                >
                  <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z" />
                </svg>
              </Link>
            ))}

          {menuItems.map(item =>
            (() => {
              const replayIcon = item.iconKey
                ? () => triggerIconAnimation(item.iconKey as keyof typeof iconReplayKeys)
                : undefined;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={styles.navItem}
                  data-active={isActiveRoute(item.path)}
                  onMouseEnter={replayIcon}
                  onFocus={replayIcon}
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
              );
            })()
          )}
        </nav>

        {/* Bottom Navigation */}
        <nav className={styles.bottomNav}>
          <Link
            to="/app/settings"
            className={styles.navItem}
            data-active={isActiveRoute('/app/settings')}
            onMouseEnter={() => triggerIconAnimation('settings')}
            onFocus={() => triggerIconAnimation('settings')}
          >
            <span className={styles.icon}>
              {renderAnimatedIcon(
                'settings',
                settingsLottie,
                <SettingsIcon className={styles.iconFallback} />
              )}
            </span>
            {!isCollapsed && <span className={styles.label}>{t('navigation.settings')}</span>}
          </Link>
          <button
            className={styles.navItem}
            onClick={handleSignOut}
            onMouseEnter={() => triggerIconAnimation('logout')}
            onFocus={() => triggerIconAnimation('logout')}
          >
            <span className={styles.icon}>
              {renderAnimatedIcon(
                'logout',
                logoutLottie,
                <LogoutIcon className={styles.iconFallback} />
              )}
            </span>
            {!isCollapsed && <span className={styles.label}>{t('navigation.logout')}</span>}
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
