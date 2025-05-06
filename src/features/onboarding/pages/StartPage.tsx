import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { LifeWheel } from '@/features/life-wheel';
import { WelcomeSequence } from '@/features/life-wheel/WelcomeSequence';
import { VisionBoard } from '@/features/vision-board';
import { VisionBoardData } from '@/features/vision-board/types';
import { LifeCategory } from '@/features/life-wheel/types';
import { DEFAULT_LIFE_CATEGORIES } from '@/features/life-wheel/constants/categories';
import { createVisionBoard, updateVisionBoard } from '@/core/services/visionBoardService';

export const StartPage = (): JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showVisionBoard, setShowVisionBoard] = useState(false);
  const [lifeWheelCategories, setLifeWheelCategories] =
    useState<LifeCategory[]>(DEFAULT_LIFE_CATEGORIES);

  const handleComplete = (): void => {
    setShowVisionBoard(true);
  };

  const handleCategoryUpdate = (categoryId: string, newValue: number): void => {
    setLifeWheelCategories(prev =>
      prev.map(cat => (cat.id === categoryId ? { ...cat, value: newValue } : cat))
    );
  };

  const handleWelcomeComplete = (): void => {
    setShowWelcome(false);
  };

  const handleWelcomeSkip = (): void => {
    setShowWelcome(false);
  };

  const handleVisionBoardSave = async (data: VisionBoardData): Promise<boolean> => {
    try {
      let result;
      if (data.id) {
        result = await updateVisionBoard(data);
      } else {
        result = await createVisionBoard(data);
      }
      return result !== null;
    } catch (error) {
      console.error('Error saving vision board:', error);
      return false;
    }
  };

  const handleVisionBoardComplete = (): void => {
    navigate('/app/dashboard');
  };

  return (
    <div
      style={{
        padding: '2rem',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
      }}
    >
      {showWelcome ? (
        <WelcomeSequence
          onComplete={handleWelcomeComplete}
          onSkip={handleWelcomeSkip}
          userName={user?.full_name || ''}
        />
      ) : showVisionBoard ? (
        <>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              textAlign: 'center',
              color: 'white',
            }}
          >
            Your Vision Board
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              opacity: 0.8,
              textAlign: 'center',
              marginBottom: '2rem',
              color: 'white',
            }}
          >
            Create a visual representation of your goals and aspirations
          </p>

          <VisionBoard
            lifeWheelCategories={lifeWheelCategories}
            onSave={handleVisionBoardSave}
            onComplete={handleVisionBoardComplete}
          />
        </>
      ) : (
        <>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              textAlign: 'center',
              color: 'white',
            }}
          >
            Your Life Wheel Assessment
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              opacity: 0.8,
              textAlign: 'center',
              marginBottom: '2rem',
              color: 'white',
            }}
          >
            Rate each area from 1-10 to see where your life is balanced
          </p>

          <LifeWheel onComplete={handleComplete} onCategoryUpdate={handleCategoryUpdate} />
        </>
      )}
    </div>
  );
};
