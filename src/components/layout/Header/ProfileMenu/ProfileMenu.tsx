import { motion } from 'framer-motion';
import { SettingsIcon, LogoutIcon, BookmarkIcon } from '@/components/common/icons';
import styles from './ProfileMenu.module.css';

interface ProfileMenuProps {
  onClose: () => void;
}

const ProfileMenu = ({ onClose }: ProfileMenuProps) => {
  return (
    <motion.div 
      className={styles.profileMenu}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.menuHeader}>
        <p className={styles.userName}>Gleisser</p>
        <p className={styles.userEmail}>gleisser@example.com</p>
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
        <span>Bookmarks</span>
        <span className={styles.bookmarkCount}>5</span>
      </button>

      <button className={styles.menuItem}>
        <SettingsIcon className={styles.menuItemIcon} />
        <span>Settings</span>
      </button>

      <div className={styles.menuDivider} />

      <button className={styles.menuItem}>
        <LogoutIcon className={styles.menuItemIcon} />
        <span>Sign out</span>
      </button>
    </motion.div>
  );
};

export default ProfileMenu; 