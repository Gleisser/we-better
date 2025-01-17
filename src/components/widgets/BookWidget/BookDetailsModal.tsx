import { Book } from './types';
import styles from './BookDetailsModal.module.css';
import { Dialog } from '@headlessui/react';
import { XIcon } from '@/components/common/icons';

interface BookDetailsModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'topics' | 'why';
  onTabChange: (tab: 'topics' | 'why') => void;
}

export const BookDetailsModal = ({ book, isOpen, onClose, activeTab, onTabChange }: BookDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={styles.modal}>
          <div className={styles.header}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'topics' ? styles.active : ''}`}
                onClick={() => onTabChange('topics')}
              >
                Topics You'll Learn
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'why' ? styles.active : ''}`}
                onClick={() => onTabChange('why')}
              >
                Why This Book?
              </button>
            </div>
            
            <button onClick={onClose} className={styles.closeButton}>
              <XIcon className={styles.closeIcon} />
            </button>
          </div>

          <div className={styles.content}>
            {activeTab === 'topics' && (
              <div className={styles.topicsSection}>
                <div className={styles.topicsGrid}>
                  {book.topics.map((topic, index) => (
                    <div key={index} className={styles.topicTag}>
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'why' && (
              <div className={styles.whySection}>
                <div className={styles.matchScoreCircle}>
                  <span className={styles.matchValue}>{book.matchScore}%</span>
                  <span className={styles.matchLabel}>Match</span>
                </div>

                <div className={styles.whyPoints}>
                  <div className={styles.whyPoint}>
                    <span className={styles.whyIcon}>🎯</span>
                    <span>Perfect for your skill level ({book.level})</span>
                  </div>
                  <div className={styles.whyPoint}>
                    <span className={styles.whyIcon}>⭐</span>
                    <span>Highly rated ({book.rating} stars)</span>
                  </div>
                  <div className={styles.whyPoint}>
                    <span className={styles.whyIcon}>👥</span>
                    <span>Trusted by {book.reviewsCount.toLocaleString()} readers</span>
                  </div>
                  <div className={styles.whyPoint}>
                    <span className={styles.whyIcon}>📚</span>
                    <span>Comprehensive coverage ({book.pageCount} pages)</span>
                  </div>
                  <div className={styles.whyPoint}>
                    <span className={styles.whyIcon}>🎓</span>
                    <span>Written by {book.author.name}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 