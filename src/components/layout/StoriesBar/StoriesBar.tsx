import LifeStories from '../Stories/LifeStories';
import styles from './StoriesBar.module.css';

const MOCK_CATEGORIES = [
  {
    id: 'social',
    name: 'Social',
    color: {
      from: '#8B5CF6',
      to: '#D946EF'
    },
    icon: '👥',
    score: 85,
    hasUpdate: true
  },
  {
    id: 'health',
    name: 'Health',
    color: {
      from: '#10B981',
      to: '#34D399'
    },
    icon: '💪',
    score: 70,
    hasUpdate: true
  },
  {
    id: 'selfCare',
    name: 'Self Care',
    color: {
      from: '#F59E0B',
      to: '#FBBF24'
    },
    icon: '🧘‍♂️',
    score: 65,
    hasUpdate: false
  },
  {
    id: 'money',
    name: 'Money',
    color: {
      from: '#3B82F6',
      to: '#60A5FA'
    },
    icon: '💰',
    score: 75,
    hasUpdate: true
  },
  {
    id: 'family',
    name: 'Family',
    color: {
      from: '#EC4899',
      to: '#F472B6'
    },
    icon: '👨‍👩‍👧‍👦',
    score: 90,
    hasUpdate: true
  },
  {
    id: 'spirituality',
    name: 'Spirituality',
    color: {
      from: '#8B5CF6',
      to: '#A78BFA'
    },
    icon: '🧘‍♀️',
    score: 60,
    hasUpdate: false
  },
  {
    id: 'relationship',
    name: 'Relationship',
    color: {
      from: '#EF4444',
      to: '#F87171'
    },
    icon: '❤️',
    score: 80,
    hasUpdate: true
  },
  {
    id: 'career',
    name: 'Career',
    color: {
      from: '#6366F1',
      to: '#818CF8'
    },
    icon: '💼',
    score: 85,
    hasUpdate: true
  }
];

const StoriesBar = () => {
  const handleCategorySelect = (category: any) => {
    console.log('Selected category:', category);
  };

  return (
    <div className={styles.container}>
      <div className={styles.curvedBackground}>
        <svg 
          className={styles.curveSvg} 
          preserveAspectRatio="none"
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0H1440V80C1380 80 1350 120 1320 120C1290 120 1260 80 1230 80C1200 80 1170 120 1140 120C1110 120 1080 80 1050 80C1020 80 990 120 960 120C930 120 900 80 870 80C840 80 810 120 780 120C750 120 720 80 690 80C660 80 630 120 600 120C570 120 540 80 510 80C480 80 450 120 420 120C390 120 360 80 330 80C300 80 270 120 240 120C210 120 180 80 150 80C120 80 90 120 60 120C30 120 0 80 0 80V0Z"
            className={styles.curvePath}
          />
        </svg>
      </div>
      <div className={styles.storiesContainer}>
        <LifeStories 
          categories={MOCK_CATEGORIES} 
          onCategorySelect={handleCategorySelect}
        />
      </div>
    </div>
  );
};

export default StoriesBar; 