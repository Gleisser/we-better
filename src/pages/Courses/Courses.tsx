import React, { useState } from 'react';
import styles from './Courses.module.css';
import { ChevronDownIcon, SettingsIcon } from '@/components/common/icons';
import FeedSettingsModal from '@/components/common/FeedSettingsModal/FeedSettingsModal';
import CourseCard from '@/components/widgets/CourseCard/CourseCard';
import { mockCourses } from './mockCourses';

const Courses = () => {
  const [loading, setLoading] = useState(false);
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [showOrderBy, setShowOrderBy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('Recommended');

  const orderOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Highest Rated', value: 'rated' },
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
  ];

  const handleOrderSelect = (option: string) => {
    setSelectedOrder(option);
    setShowOrderBy(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <button 
            className={styles.filterButton}
            onClick={() => setShowFeedSettings(true)}
          >
            <SettingsIcon className={styles.filterIcon} />
            <span>Feed Settings</span>
          </button>

          <div className={styles.dropdownContainer}>
            <button 
              className={`${styles.filterButton} ${showOrderBy ? styles.active : ''}`}
              onClick={() => setShowOrderBy(!showOrderBy)}
            >
              <span>Order by: {selectedOrder}</span>
              <ChevronDownIcon className={`${styles.filterIcon} ${showOrderBy ? styles.rotated : ''}`} />
            </button>

            {showOrderBy && (
              <div className={styles.dropdownMenu}>
                {orderOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.dropdownItem} ${selectedOrder === option.label ? styles.selected : ''}`}
                    onClick={() => handleOrderSelect(option.label)}
                  >
                    {option.label}
                    {selectedOrder === option.label && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <FeedSettingsModal 
        isOpen={showFeedSettings} 
        onClose={() => setShowFeedSettings(false)} 
      />

      {loading ? (
        <p className="text-white/70">Loading courses...</p>
      ) : (
        <div className={styles.courseGrid}>
          {mockCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses; 