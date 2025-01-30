import React, { useState } from 'react';
import styles from './FeedSettingsModal.module.css';
import { 
  SettingsIcon, 
  TagIcon, 
  UsersIcon, 
  SparklesIcon, 
  BlockIcon 
} from '@/components/common/icons';

interface FeedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedSettingsModal: React.FC<FeedSettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('general');

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <SettingsIcon className={styles.modalTitleIcon} />
            <h2>My feed</h2>
          </div>
          <div className={styles.modalActions}>
            <button className={styles.saveButton} onClick={onClose}>
              Save
            </button>
            <button className={styles.closeButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>

        <div className={styles.modalLayout}>
          {/* Side Menu */}
          <div className={styles.sideMenu}>
            <button 
              className={`${styles.menuItem} ${activeSection === 'general' ? styles.active : ''}`}
              onClick={() => setActiveSection('general')}
            >
              <SettingsIcon className={styles.menuIcon} />
              <span>General</span>
            </button>

            <button 
              className={`${styles.menuItem} ${activeSection === 'tags' ? styles.active : ''}`}
              onClick={() => setActiveSection('tags')}
            >
              <TagIcon className={styles.menuIcon} />
              <span>Tags</span>
            </button>

            <button 
              className={`${styles.menuItem} ${activeSection === 'sources' ? styles.active : ''}`}
              onClick={() => setActiveSection('sources')}
            >
              <UsersIcon className={styles.menuIcon} />
              <span>Content sources</span>
            </button>

            <button 
              className={`${styles.menuItem} ${activeSection === 'preferences' ? styles.active : ''}`}
              onClick={() => setActiveSection('preferences')}
            >
              <SparklesIcon className={styles.menuIcon} />
              <span>Content preferences</span>
            </button>

            <button 
              className={`${styles.menuItem} ${activeSection === 'blocked' ? styles.active : ''}`}
              onClick={() => setActiveSection('blocked')}
            >
              <BlockIcon className={styles.menuIcon} />
              <span>Blocked content</span>
            </button>
          </div>

          {/* Content Area */}
          <div className={styles.modalContent}>
            {activeSection === 'general' && (
              <div className={styles.feedNameSection}>
                <h3>Feed name</h3>
                <p className={styles.sectionDescription}>
                  Choose a name that reflects the focus of your feed.
                </p>
                <input 
                  type="text" 
                  className={styles.feedNameInput} 
                  placeholder="My feed"
                />
              </div>
            )}
            {/* Add other section content here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedSettingsModal; 