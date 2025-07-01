import { motion } from 'framer-motion';
import { useAuth } from '@/shared/hooks/useAuth';
import { SettingsIcon, LogoutIcon, BookmarkIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './ProfileMenu.module.css';

interface ProfileMenuProps {
  onClose: () => void;
}

const ProfileMenu = ({ onClose }: ProfileMenuProps): JSX.Element => {
  const { user, logout } = useAuth();
  const { t } = useCommonTranslation();

  const handleSignOut = async (): Promise<void> => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <motion.div
      className={styles.profileMenu}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.menuHeader}>
        <p className={styles.userName}>{user?.full_name || t('header.user')}</p>
        <p className={styles.userEmail}>{user?.email}</p>
      </div>

      <div className={styles.menuDivider} />

      {/* Bookmarks Section */}
      <button
        className={styles.menuItem}
        onClick={() => {
          // TODO: Navigate to bookmarks page
          onClose();
        }}
      >
        <BookmarkIcon className={styles.menuItemIcon} filled={true} />
        <span>{t('header.bookmarks')}</span>
        <span className={styles.bookmarkCount}>5</span>
      </button>

      <button className={styles.menuItem}>
        <SettingsIcon className={styles.menuItemIcon} />
        <span>{t('navigation.settings')}</span>
      </button>

      <div className={styles.menuDivider} />

      <button className={styles.menuItem} onClick={handleSignOut}>
        <LogoutIcon className={styles.menuItemIcon} />
        <span>{t('header.signOut')}</span>
      </button>
    </motion.div>
  );
};

export default ProfileMenu;
