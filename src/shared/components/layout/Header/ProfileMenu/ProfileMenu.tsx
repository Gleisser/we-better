import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SettingsIcon, LogoutIcon, BookmarkIcon } from '@/shared/components/common/icons';
import styles from './ProfileMenu.module.css';

interface ProfileMenuProps {
  onClose: () => void;
}

const ProfileMenu = ({ onClose }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
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
        <p className={styles.userName}>{user?.full_name || 'User'}</p>
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
        <span>Bookmarks</span>
        <span className={styles.bookmarkCount}>5</span>
      </button>

      <button className={styles.menuItem}>
        <SettingsIcon className={styles.menuItemIcon} />
        <span>Settings</span>
      </button>

      <div className={styles.menuDivider} />

      <button 
        className={styles.menuItem}
        onClick={handleSignOut}
      >
        <LogoutIcon className={styles.menuItemIcon} />
        <span>Sign out</span>
      </button>
    </motion.div>
  );
};

export default ProfileMenu; 