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