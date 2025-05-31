import React, { useState, useEffect, useRef } from 'react';
import { DreamBoardContainer } from '@/features/dream-board/components/VisionBoard/DreamBoardContainer';
import styles from './DreamBoardModal.module.css';
import {
  VisionBoardData,
  VisionBoardProps,
} from '@/features/dream-board/components/VisionBoard/types';
import { LifeCategory } from '@/features/life-wheel/types';
import { Dream } from '../../types';

// Define an interface for the vision board content item that extracts data from VisionBoardContent
interface VisionBoardContentItem {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  imageUrl?: string;
  src?: string;
  caption?: string;
}

interface DreamBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (dreams: Dream[]) => void;
  categories: LifeCategory[];
}

// Create a custom VisionBoard component that forces the intro screen to be closed
const CustomVisionBoard = (props: VisionBoardProps): JSX.Element => {
  // Override the showIntro state in the VisionBoard component
  useEffect(() => {
    // Find and close the intro screen if it exists
    const closeIntroScreen = (): void => {
      const introScreenOverlay = document.querySelector(
        `.${styles.visionBoardWrapper} .introScreenOverlay`
      );
      if (introScreenOverlay) {
        // Find the Get Started button and simulate a click
        const getStartedButton = introScreenOverlay.querySelector('button');
        if (getStartedButton) {
          getStartedButton.click();
        }
      }
    };

    // Call immediately and also after a short delay to ensure it works
    closeIntroScreen();
    const timer = setTimeout(closeIntroScreen, 500);

    return () => clearTimeout(timer);
  }, []);

  return <DreamBoardContainer {...props} />;
};

const DreamBoardModal: React.FC<DreamBoardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
}) => {
  const [visionBoardData, setVisionBoardData] = useState<VisionBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const visionBoardContainerRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling of body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Fetch vision board data (mock for now, would be replaced with actual API call)
  useEffect(() => {
    if (isOpen) {
      // Simulate loading from API
      setLoading(true);
      setTimeout(() => {
        try {
          // This would be an API call in a real implementation
          const savedData = localStorage.getItem('visionBoardData');
          if (savedData) {
            setVisionBoardData(JSON.parse(savedData));
          } else {
            // Default empty board
            setVisionBoardData({
              title: 'My Dream Board',
              description: 'Visualize • Believe • Achieve',
              categories: categories.map(cat => cat.id),
              content: [],
            });
          }
          setLoading(false);
        } catch (error) {
          console.error('Failed to load vision board data:', error);
          setError('Failed to load vision board data');
          setLoading(false);
        }
      }, 1000);
    }
  }, [isOpen, categories]);

  // Handle save board
  const handleSaveBoard = async (data: VisionBoardData): Promise<boolean> => {
    try {
      // This would be an API call in a real implementation
      localStorage.setItem('visionBoardData', JSON.stringify(data));

      // Convert vision board data to dreams array
      if (onSave) {
        // Create sample dreams from the vision board content
        const newDreams: Dream[] = data.content.map((item, index) => {
          // Extract data from the item with proper type handling
          const contentItem: VisionBoardContentItem = {
            title: item.caption || '',
            description: item.caption || '',
            category: item.categoryId || 'General',
            priority: 'medium',
            imageUrl: item.src,
          };
          const title = contentItem.title || 'Untitled Dream';
          const description = contentItem.description || '';
          const category = contentItem.category || 'General';
          const priority = contentItem.priority || 'medium';
          const imageUrl = contentItem.imageUrl;

          return {
            id: `dream-${Date.now()}-${index}`,
            title,
            description,
            category,
            timeframe: determineTimeframe(priority),
            progress: 0,
            createdAt: new Date().toISOString(),
            milestones: [],
            isShared: false,
            imageUrl,
          };
        });

        onSave(newDreams);
      }

      // Close the modal after saving
      onClose();
      return true;
    } catch (error) {
      console.error('Error saving vision board:', error);
      return false;
    }
  };

  // Helper function to determine timeframe based on priority
  const determineTimeframe = (priority: string): 'short-term' | 'mid-term' | 'long-term' => {
    switch (priority) {
      case 'high':
        return 'short-term';
      case 'medium':
        return 'mid-term';
      case 'low':
        return 'long-term';
      default:
        return 'mid-term';
    }
  };

  // Handle share board (mock implementation)
  const handleShareBoard = (): void => {
    alert('Sharing functionality coming soon!');
  };

  // Handle completion of vision board
  const handleComplete = (): void => {
    onClose();
  };

  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={e => e.stopPropagation()}
        ref={visionBoardContainerRef}
      >
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.modalContent}>
          {visionBoardData && (
            <CustomVisionBoard
              lifeWheelCategories={categories}
              data={visionBoardData}
              loading={loading}
              error={error || undefined}
              onSave={handleSaveBoard}
              onShare={handleShareBoard}
              onComplete={handleComplete}
              className={styles.visionBoardWrapper}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamBoardModal;
