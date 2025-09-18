import React, { useState, useEffect, useRef } from 'react';
import { DreamBoardContainer } from '@/features/dream-board/components/Board/DreamBoardContainer';
import styles from './DreamBoardModal.module.css';
import { DreamBoardData, DreamBoardProps } from '@/features/dream-board/components/Board/types';
import { LifeCategory } from '@/features/life-wheel/types';
import { Dream } from '../../types';
import { getLatestDreamBoardData, saveDreamBoardData } from '../../api/dreamBoardApi';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';

// Define an interface for the vision board content item that extracts data from VisionBoardContent
interface DreamBoardContentItem {
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
  onDelete?: () => void;
  categories: LifeCategory[];
}

// Create a custom VisionBoard component that forces the intro screen to be closed
const CustomVisionBoard = (props: DreamBoardProps): JSX.Element => {
  // Override the showIntro state in the VisionBoard component
  useEffect(() => {
    // Find and close the intro screen if it exists
    const closeIntroScreen = (): void => {
      const introScreenOverlay = document.querySelector(
        `.${styles.dreamBoardWrapper} .introScreenOverlay`
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
  onDelete,
  categories,
}) => {
  const { t } = useCommonTranslation();
  const [visionBoardData, setVisionBoardData] = useState<DreamBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const visionBoardContainerRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when modal is open (html + body)
  const prevBodyOverflow = useRef<string | null>(null);
  const prevHtmlOverflow = useRef<string | null>(null);
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (isOpen) {
      // Store previous values to restore correctly
      prevBodyOverflow.current = body.style.overflow;
      prevHtmlOverflow.current = html.style.overflow;
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    } else {
      if (prevBodyOverflow.current !== null) body.style.overflow = prevBodyOverflow.current;
      if (prevHtmlOverflow.current !== null) html.style.overflow = prevHtmlOverflow.current;
    }

    return () => {
      if (prevBodyOverflow.current !== null)
        document.body.style.overflow = prevBodyOverflow.current;
      if (prevHtmlOverflow.current !== null)
        document.documentElement.style.overflow = prevHtmlOverflow.current;
    };
  }, [isOpen]);

  // Load existing vision board data from API
  useEffect(() => {
    if (isOpen) {
      setLoading(true);

      const loadExistingData = async (): Promise<void> => {
        try {
          // Fetch existing dream board data from API
          const existingData = await getLatestDreamBoardData();

          if (existingData?.id) {
            // Use existing data if available
            // @ts-expect-error - Type compatibility issue between duplicate type definitions
            setVisionBoardData(existingData);
          } else {
            // Start with empty board if no existing data
            setVisionBoardData({
              title: t('dreamBoard.board.defaultTitle') as string,
              description: t('dreamBoard.board.defaultDescription') as string,
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
      };

      loadExistingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, categories]);

  // Handle save board
  const handleSaveBoard = async (data: DreamBoardData): Promise<boolean> => {
    try {
      // Save the DreamBoardData directly to preserve position data
      const result = await saveDreamBoardData(data);

      if (result) {
        // Update local state with the saved data
        // @ts-expect-error - Type compatibility issue between duplicate type definitions
        setVisionBoardData(result);

        // Convert vision board data to dreams array and pass to parent
        if (onSave) {
          // Create dreams from the vision board content with preserved position data
          const newDreams: Dream[] = data.content.map(item => {
            const contentItem: DreamBoardContentItem = {
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
              id: item.id, // Use the original ID from the content
              title,
              description,
              category,
              timeframe: determineTimeframe(priority),
              progress: 0,
              createdAt: new Date().toISOString(),
              milestones: [],
              isShared: false,
              imageUrl,
              // Preserve the position data
              position: item.position,
              size: item.size,
              rotation: item.rotation,
            };
          });

          onSave(newDreams);
        }

        // Close the modal after saving
        onClose();
        return true;
      } else {
        console.error('Failed to save dream board to API');
        return false;
      }
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

  // Handle completion of vision board (not currently used)
  // const handleComplete = (): void => {
  //   onClose();
  // };

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
              onDelete={onDelete}
              className={styles.dreamBoardWrapper}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamBoardModal;
