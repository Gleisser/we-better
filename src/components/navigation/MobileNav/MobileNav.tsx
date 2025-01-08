import { useLocation, Link } from 'react-router-dom';
import styles from './MobileNav.module.css';
import { 
  HomeIcon, 
  VideoIcon,
  ArticleIcon,
  CourseIcon,
  PodcastIcon 
} from '@/components/common/icons';

const NAV_ITEMS = [
  { path: '/', icon: HomeIcon, label: 'Home' },
  { path: '/videos', icon: VideoIcon, label: 'Videos' },
  { path: '/articles', icon: ArticleIcon, label: 'Articles' },
  { path: '/courses', icon: CourseIcon, label: 'Courses' },
  { path: '/podcasts', icon: PodcastIcon, label: 'Podcasts' },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className={styles.mobileNav}>
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
        <Link
          key={path}
          to={path}
          className={`${styles.navItem} ${
            location.pathname === path ? styles.active : ''
          }`}
        >
          <Icon className={styles.icon} />
          <span className={styles.label}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}; 