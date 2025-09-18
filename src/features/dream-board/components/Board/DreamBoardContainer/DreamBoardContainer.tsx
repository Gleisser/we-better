import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import {
  DreamBoardProps,
  DreamBoardData,
  DreamBoardContentType,
  DreamBoardContent,
  Position,
  ToolbarMode,
} from '../../../types';
import { ContentItem } from '../ContentItem/ContentItem';
import { ContentControls } from '../ContentControls/ContentControls';
import { Toolbar } from '../Toolbar/Toolbar';
import showToast from '@/utils/helpers/toast';
import styles from './DreamBoardContainer.module.css';

// Add this utility function for image compression
const compressImage = (base64Image: string, maxSizeKB: number = 100): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate the ratio to maintain aspect ratio while reducing size
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Start with a high quality
      let quality = 0.9;
      let result = canvas.toDataURL('image/jpeg', quality);

      // Gradually reduce quality until the size is under the maxSizeKB
      while (result.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(result);
    };

    img.onerror = error => {
      reject(error);
    };

    img.src = base64Image;
  });
};

export const DreamBoardContainer: React.FC<DreamBoardProps> = ({
  lifeWheelCategories,
  data,
  loading = false,
  error,
  onSave,
  onShare,
  onComplete: _onComplete,
  onDelete,
  className = '',
  readOnly = false,
}) => {
  const { t } = useCommonTranslation();

  // Canvas state
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(false);

  // Board data state
  const [boardData, setBoardData] = useState<DreamBoardData>({
    title: t('dreamBoard.board.defaultTitle') as string,
    description: t('dreamBoard.board.defaultDescription') as string,
    categories: lifeWheelCategories.map(cat => cat.id),
    content: [],
  });

  // UI state
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [toolbarMode, setToolbarMode] = useState<ToolbarMode>(ToolbarMode.ADD);

  // Create a mapping of category IDs to their colors for easier access
  const categoryColors = lifeWheelCategories.reduce(
    (map, category) => {
      map[category.id] = category.color;
      return map;
    },
    {} as Record<string, string>
  );

  // Initialize board data
  useEffect(() => {
    if (data) {
      // Ensure content is always an array to prevent undefined errors
      setBoardData({
        ...data,
        content: data.content || [],
      });
    } else {
      setBoardData({
        title: t('dreamBoard.board.defaultTitle') as string,
        description: t('dreamBoard.board.defaultDescription') as string,
        categories: lifeWheelCategories.map(cat => cat.id),
        content: [],
      });
    }
  }, [data, lifeWheelCategories]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger animation
  const startAnimation = useCallback((): void => {
    if (canvasRef.current && !animating) {
      setAnimating(true);
      canvasRef.current.classList.add(styles.animate);

      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.classList.remove(styles.animate);
          setAnimating(false);
        }
      }, 10000); // Animation duration from the original CodePen
    }
  }, [animating]);

  // Update canvas size on window resize
  useEffect(() => {
    const updateDimensions = (): void => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
        // Trigger animation on resize
        startAnimation();
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [startAnimation]);

  // Handle animation on scroll
  useEffect(() => {
    const handleScroll = (): void => {
      startAnimation();
    };

    // Initial animation
    startAnimation();

    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('scroll', handleScroll);
    }

    document.addEventListener('scroll', handleScroll);

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('scroll', handleScroll);
    };
  }, [startAnimation]);

  // Get the selected content
  const selectedContent = boardData.content?.find(item => item.id === selectedContentId);

  // Filter content based on selected category
  const filteredContent = useMemo(() => {
    if (!selectedCategoryId) {
      return boardData.content || [];
    }
    return (boardData.content || []).filter(item => item.categoryId === selectedCategoryId);
  }, [boardData.content, selectedCategoryId]);

  // Handle content selection
  const handleSelectContent = (id: string): void => {
    setSelectedContentId(id);
    setShowControls(true);
  };

  // Handle content update
  const handleUpdateContent = (updatedContent: DreamBoardContent): void => {
    setBoardData(prev => ({
      ...prev,
      content: (prev.content || []).map(item =>
        item.id === updatedContent.id ? updatedContent : item
      ),
    }));
  };

  // Handle content deletion
  const handleDeleteContent = (id: string): void => {
    setBoardData(prev => ({
      ...prev,
      content: (prev.content || []).filter(item => item.id !== id),
    }));
    setSelectedContentId(null);
    setShowControls(false);
  };

  // Handle save
  const handleSave = async (): Promise<boolean> => {
    if (isSaving) return false;

    setIsSaving(true);

    try {
      // Compress images in content array before saving
      const compressedContent = await Promise.all(
        (boardData.content || []).map(async item => {
          if (
            item.type === DreamBoardContentType.IMAGE &&
            item.src &&
            item.src.startsWith('data:')
          ) {
            try {
              const compressedSrc = await compressImage(item.src, 500); // 500KB max
              return { ...item, src: compressedSrc };
            } catch (error) {
              console.error('Error compressing image:', error);
              return item; // Return original if compression fails
            }
          }
          return item;
        })
      );

      const dataToSave: DreamBoardData = {
        ...boardData,
        content: compressedContent,
        updatedAt: new Date().toISOString(),
      };

      // Using a logger service or other method would be better than console
      const result = await onSave(dataToSave);

      if (result) {
        showToast.success(t('dreamBoard.board.saved') as string);
      } else {
        showToast.error(t('dreamBoard.board.failedToSave') as string);
      }

      return result;
    } catch (error) {
      console.error('Error saving vision board:', error);
      showToast.error(t('dreamBoard.board.errorSaving') as string);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle share function - only defined if onShare prop is provided
  const shareHandler = onShare ? () => onShare(boardData) : undefined;

  // Handle adding content
  const handleAddContent = (
    type: DreamBoardContentType,
    contentData?: Record<string, unknown>
  ): void => {
    // Calculate safe placement area, avoiding the right side where the content panel appears
    const CONTENT_PANEL_WIDTH = 350; // Width of the edit panel plus some margin
    const CONTENT_ITEM_WIDTH = 200;
    const CONTENT_ITEM_HEIGHT = 200;

    // Calculate safe area width, ensuring items don't spawn behind the panel
    const safeAreaWidth = Math.max(200, canvasSize.width - CONTENT_PANEL_WIDTH);

    // Calculate random position within safe area
    const newPosition: Position = {
      x: Math.floor(Math.random() * (safeAreaWidth - CONTENT_ITEM_WIDTH)) || 50,
      y: Math.floor(Math.random() * (canvasSize.height - CONTENT_ITEM_HEIGHT - 100)) || 50,
    };

    let newContent: DreamBoardContent = {
      id: uuidv4(),
      type,
      position: newPosition,
      size: {
        width: CONTENT_ITEM_WIDTH,
        height: CONTENT_ITEM_HEIGHT,
      },
      rotation: 0,
      categoryId: selectedCategoryId || undefined,
    };

    // Set default properties based on type
    switch (type) {
      case DreamBoardContentType.IMAGE:
        newContent = {
          ...newContent,
          src: (contentData?.src as string) || 'https://via.placeholder.com/200',
          alt: (contentData?.alt as string) || 'Vision board image',
        };
        break;
    }

    setBoardData(prev => ({
      ...prev,
      content: [...(prev.content || []), newContent],
    }));

    // Select the newly added content
    setSelectedContentId(newContent.id);
    setShowControls(true);

    // Trigger animation when adding new content
    startAnimation();
  };

  // Handle canvas click (deselect content)
  const handleCanvasClick = (e: React.MouseEvent): void => {
    // Don't deselect if clicking on a content item, controls, or toolbar
    if (
      (e.target as HTMLElement).closest(`.${styles.contentItem}`) ||
      (e.target as HTMLElement).closest(`.${styles.contentControls}`) ||
      (e.target as HTMLElement).closest(`.${styles.toolbar}`) ||
      (e.target as HTMLElement).closest(`.${styles.toolbarContainer}`)
    ) {
      return;
    }

    setSelectedContentId(null);
    setShowControls(false);
  };

  // Handle filter by category
  const handleFilterByCategory = (categoryId: string | null): void => {
    setSelectedCategoryId(categoryId);
  };

  // Modify the handleImageUpload function to use correct handleAddContent call
  const handleImageUpload = (): void => {
    // Count the number of image and AI-generated content items
    const imageCount = (boardData.content || []).filter(
      item => item.type === DreamBoardContentType.IMAGE
    ).length;

    // Check if the limit has been reached
    if (imageCount >= 7) {
      showToast.error(t('dreamBoard.board.imageLimit') as string);
      return;
    }

    // Rest of the existing upload logic
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e): void => {
      const target = e.target as HTMLInputElement;
      if (target && target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();

        reader.onload = (event): void => {
          if (event.target?.result) {
            // Use handleAddContent correctly with type first, then content details
            handleAddContent(DreamBoardContentType.IMAGE, {
              src: event.target.result as string,
              alt: file.name,
              caption: '',
            });
          }
        };

        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  };

  // Handle auto arrange
  const handleAutoArrange = (): void => {
    // Define safe area parameters
    const CONTENT_PANEL_WIDTH = 350; // Width of the edit panel plus some margin
    const safeAreaWidth = Math.max(300, canvasSize.width - CONTENT_PANEL_WIDTH);

    // Place items in a grid pattern like in the reference design
    const itemWidth = 220;
    const itemHeight = 220;
    const columns = Math.floor(safeAreaWidth / (itemWidth + 20)) || 2; // Ensure at least 2 columns
    const gutter = 20;

    const arrangedContent = (boardData.content || []).map((item, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      // Ensure items stay within safe area (away from the right edge)
      const x = Math.min(col * (itemWidth + gutter), safeAreaWidth - itemWidth);

      return {
        ...item,
        position: {
          x,
          y: row * (itemHeight + gutter) + 50, // Add some top margin
        },
      };
    });

    setBoardData(prev => ({
      ...prev,
      content: arrangedContent,
    }));

    // Trigger animation after arranging
    startAnimation();
  };

  // Inside the VisionBoard component, add a useMemo to calculate the image count
  const imageCount = useMemo(() => {
    return (boardData.content || []).filter(item => item.type === DreamBoardContentType.IMAGE)
      .length;
  }, [boardData.content]);

  // Render loading state
  if (loading) {
    return (
      <div>
        <div>
          <div className={styles.glassCard}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>{t('dreamBoard.board.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div>
        <div />
        <div className={styles.contentWrapper}>
          <div className={styles.glassCard}>
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>{t('dreamBoard.board.errorTitle')}</h3>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={() => window.location.reload()}>
                {t('dreamBoard.board.retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main content container */}
      <div>
        <div className={`${styles.glassCard} boardGlassCard`}>
          {/* Vision Board Title */}
          <h1 className={styles.dreamBoardTitle}>
            {boardData.title === 'My Dream Board'
              ? t('dreamBoard.board.defaultTitle')
              : boardData.title || t('dreamBoard.board.title')}
          </h1>
          {boardData.description && (
            <p className={styles.dreamBoardSubtitle}>
              {boardData.description === 'Vision board created with my dreams and goals'
                ? t('dreamBoard.board.defaultDescription')
                : boardData.description}
            </p>
          )}

          {/* Canvas container */}
          <div
            ref={canvasRef}
            className={`${styles.canvasContainer} boardCanvasContainer`}
            onClick={handleCanvasClick}
          >
            {/* Content items */}
            {filteredContent.map(item => (
              <ContentItem
                key={item.id}
                content={item}
                isSelected={item.id === selectedContentId}
                onSelect={handleSelectContent}
                onUpdate={handleUpdateContent}
                readOnly={readOnly}
                categoryColors={categoryColors}
              />
            ))}

            {/* Empty canvas call-to-action when there are no images */}
            {!readOnly && imageCount === 0 && (
              <div className={styles.emptyCanvasOverlay} onClick={e => e.stopPropagation()}>
                <button className={styles.addImageButtonLarge} onClick={handleImageUpload}>
                  <span className={styles.addImageIcon}>➕</span>
                  <span>{t('dreamBoard.board.toolbar.buttons.uploadPhoto')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Toolbar container - at the bottom */}
          <div className={`${styles.actionButtons} boardActionButtons`}>
            {!readOnly && (
              <Toolbar
                mode={toolbarMode}
                onModeChange={setToolbarMode}
                onAddImage={handleImageUpload}
                onAutoArrange={handleAutoArrange}
                onSave={handleSave}
                onShare={shareHandler}
                onDelete={onDelete}
                onFilterByCategory={handleFilterByCategory}
                categories={lifeWheelCategories}
                selectedCategoryId={selectedCategoryId}
                isSaving={isSaving}
                imageCount={imageCount}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content controls - floating sidebar */}
      {showControls && selectedContent && !readOnly && (
        <ContentControls
          selectedContent={selectedContent}
          onUpdate={handleUpdateContent}
          onDelete={handleDeleteContent}
          onClose={() => {
            setSelectedContentId(null);
            setShowControls(false);
          }}
          lifeWheelCategories={lifeWheelCategories}
        />
      )}
    </div>
  );
};
