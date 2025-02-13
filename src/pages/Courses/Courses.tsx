import React, { useState, useEffect } from 'react';
import styles from './Courses.module.css';
import { ChevronDownIcon, SettingsIcon } from '@/components/common/icons';
import FeedSettingsModal from '@/components/common/FeedSettingsModal/FeedSettingsModal';
import CourseCard from '@/components/widgets/CourseCard/CourseCard';
import { courseService, Course } from '@/services/courseService';

const Courses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showFeedSettings, setShowFeedSettings] = useState(false);
  const [showOrderBy, setShowOrderBy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('Recommended');

  const orderOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Most Popular', value: 'studentsCount:desc' },
    { label: 'Highest Rated', value: 'rating:desc' },
    { label: 'Newest', value: 'createdAt:desc' },
  ];

  useEffect(() => {
    fetchCourses();
  }, [selectedOrder]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const orderValue = orderOptions.find(opt => opt.label === selectedOrder)?.value;
      const params: any = {
        pagination: { page: 1, pageSize: 20 }
      };
      
      if (orderValue && orderValue !== 'recommended') {
        params.sort = orderValue;
      }

      const response = await courseService.getCourses(params);
      setCourses(response.data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        instructor: item.instructor,
        rating: item.rating,
        studentsCount: item.studentsCount,
        thumbnail: item.thumbnail,
        url: item.url,
        documentId: item.documentId,
        categories: item.categories,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        duration: item.duration,
        level: item.level,
        language: item.language,
        publishedAt: item.publishedAt,
        price: item.price
      })));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

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
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses; 