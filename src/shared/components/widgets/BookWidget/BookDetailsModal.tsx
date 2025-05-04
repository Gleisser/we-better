import { Book } from './types';
import styles from './BookDetailsModal.module.css';
import { Dialog } from '@headlessui/react';
import { XIcon } from '@/shared/components/common/icons';

/**
 * Props interface for the BookDetailsModal component.
 * @interface BookDetailsModalProps
 * @property {Book} book - The book object containing details to display
 * @property {boolean} isOpen - Controls the visibility of the modal
 * @property {() => void} onClose - Callback function to close the modal
 * @property {'topics' | 'why'} activeTab - Currently active tab in the modal
 * @property {(tab: 'topics' | 'why') => void} onTabChange - Callback function when tab is changed
 */
interface BookDetailsModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'topics' | 'why';
  onTabChange: (tab: 'topics' | 'why') => void;
}

/**
 * A modal component that displays detailed information about a book.
 * Uses Headless UI Dialog for accessibility and keyboard navigation.
 *
 * Features:
 * - Tabbed interface for topics and book benefits
 * - Backdrop blur effect for better focus
 * - Visual match score representation
 * - Comprehensive book statistics
 * - Responsive design
 *
 * The modal has two main sections:
 * 1. Topics Tab: Displays a grid of topics covered in the book
 * 2. Why Tab: Shows match score, book statistics, and author information
 *
 * @component
 * @param {Object} props - Component props
 * @param {Book} props.book - Book data to display
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Handler for closing the modal
 * @param {'topics' | 'why'} props.activeTab - Active tab selection
 * @param {(tab: 'topics' | 'why') => void} props.onTabChange - Tab change handler
 *
 * @example
 * ```tsx
 * function BookView({ book }) {
 *   const [isModalOpen, setIsModalOpen] = useState(false);
 *   const [activeTab, setActiveTab] = useState<'topics' | 'why'>('topics');
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsModalOpen(true)}>
 *         View Book Details
 *       </button>
 *       <BookDetailsModal
 *         book={book}
 *         isOpen={isModalOpen}
 *         onClose={() => setIsModalOpen(false)}
 *         activeTab={activeTab}
 *         onTabChange={setActiveTab}
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Example book object structure
 * const book = {
 *   title: "Advanced TypeScript Programming",
 *   author: { name: "John Doe" },
 *   topics: ["Types", "Generics", "Decorators"],
 *   matchScore: 95,
 *   level: "Intermediate",
 *   rating: 4.8,
 *   reviewsCount: 1250,
 *   pageCount: 450
 * };
 * ```
 */
export const BookDetailsModal = ({
  book,
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}: BookDetailsModalProps): JSX.Element => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Semi-transparent backdrop with blur effect */}
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
