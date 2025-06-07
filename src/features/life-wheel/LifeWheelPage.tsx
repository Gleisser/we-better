import { useState } from 'react';
import { LifeWheel } from './index';
import { LifeCategory } from './types';
import { DEFAULT_LIFE_CATEGORIES } from './constants/categories';
import styles from './LifeWheel.module.css';

const LifeWheelPage = (): JSX.Element => {
  const [categories, setCategories] = useState<LifeCategory[]>(DEFAULT_LIFE_CATEGORIES);

  const handleCategoryUpdate = (categoryId: string, newValue: number): void => {
    setCategories(prev =>
      prev.map(cat => (cat.id === categoryId ? { ...cat, value: newValue } : cat))
    );
  };

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-gray-900 to-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-white text-center">Your Life Wheel</h1>
      <p className="text-lg text-gray-300 mb-8 text-center">
        Assess and balance the key areas of your life
      </p>

      <div className={`${styles.lifeWheelContainer} mx-auto`}>
        <LifeWheel
          data={{ categories }}
          onCategoryUpdate={handleCategoryUpdate}
          onComplete={() => {}}
        />
      </div>
    </div>
  );
};

export default LifeWheelPage;
