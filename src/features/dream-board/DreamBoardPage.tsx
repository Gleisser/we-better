import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './DreamBoardPage.module.css';
import {
  Dream,
  DreamImageUploadInput,
  DreamImageMilestoneInput,
  Milestone,
  DreamBoardData,
  DreamBoardContent,
  DreamBoardContentType,
} from './types';
import { saveDreamBoardData, getLatestDreamBoardData } from './api/dreamBoardApi';
import { mockCategories, mockResources, mockInsights, mockNotifications } from './mock-data';
import { useDreamWeather } from './hooks/useDreamWeather';
import { CosmicDreamExperience } from './components/CosmicDreamExperience/CosmicDreamExperience';
import categoryDetails from './components/constants/dreamboard';
import achievementBadges from './components/constants/achievements';
import VisionBoardTab from './components/VisionBoardTab';
import DreamInsights from './components/DreamInsights';
import FooterTools from './components/FooterTools';
import MilestonesPopup from './components/MilestonesPopup';
import { DreamChallengeContainer } from './components/DreamChallenge';
import {
  createMilestoneForContent,
  updateMilestoneForContent,
  deleteMilestoneForContent,
  toggleMilestoneCompletionForContent,
} from './services/milestonesService';

type CategoryDetails = {
  icon: string;
  illustration: string;
  gradient: string;
  hoverGradient: string;
  shadowColor: string;
  color: string;
};

const AUTOSAVE_DELAY_MS = 900;
const MAX_DREAM_BOARD_IMAGES = 7;

// Utility function to get category details
const getCategoryDetails = (category: string): CategoryDetails => {
  return (
    categoryDetails[category as keyof typeof categoryDetails] || {
      icon: '🌟',
      illustration: '/assets/images/dreamboard/spirituality.webp', // Default placeholder image
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      hoverGradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
      shadowColor: 'rgba(139, 92, 246, 0.4)',
      color: '#8B5CF6',
    }
  );
};

const DreamBoardPage: React.FC = () => {
  const { t } = useCommonTranslation();

  // Dream Weather hook
  const { weather: dreamWeather, error: weatherError } = useDreamWeather({
    includeMetrics: false,
    includeCategoryStatus: true,
    autoFetch: true,
  });

  // Add a state to track if the user has created a dream board yet
  const [expandedMiniBoard, setExpandedMiniBoard] = useState(true);
  const [activeTab, setActiveTab] = useState('vision-board');
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [activeDream, setActiveDream] = useState<Dream | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dreamBoardId, setDreamBoardId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autosaveTimeoutRef = useRef<number | null>(null);
  const pendingDreamsRef = useRef<Dream[] | null>(null);
  const pendingMilestonesRef = useRef<Record<string, DreamImageMilestoneInput[]>>({});
  const firstImageInputRef = useRef<HTMLInputElement>(null);

  // New state variables for Dream Categories section
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // New state variables for milestone management
  const [selectedDreamForMilestones, setSelectedDreamForMilestones] = useState<string | null>(null);
  const [milestoneAction, setMilestoneAction] = useState<'add' | 'edit' | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [milestoneHistory, setMilestoneHistory] = useState<
    Array<{ dreamId: string; milestoneId: string; action: string; timestamp: string }>
  >([]);
  const [showMilestonesPopup, setShowMilestonesPopup] = useState(false);

  // New state for inline form display
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  // New state for visualizations
  const [activeVizTab, setActiveVizTab] = useState<'timeline' | 'chart' | 'achievements' | null>(
    null
  );

  // New state for fetched dream milestones
  const [fetchedDreamMilestones, setFetchedDreamMilestones] = useState<Record<string, Milestone[]>>(
    {}
  );

  // Toggle mini vision board expansion
  const toggleMiniBoard = (): void => {
    setExpandedMiniBoard(!expandedMiniBoard);
  };

  // Handle dream selection
  const handleDreamSelect = (dream: Dream | null): void => {
    setActiveDream(dream);
  };

  // Calculate the overall progress for a category
  const calculateCategoryProgress = (category: string): number => {
    const categoryDreams = dreams.filter(dream => dream.category === category);
    if (categoryDreams.length === 0) return 0;

    const totalProgress = categoryDreams.reduce((sum, dream) => sum + dream.progress, 0);
    return totalProgress / categoryDreams.length;
  };

  // Handle category card expansion
  const toggleCategoryExpand = (category: string): void => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  // Milestone Management Functions
  const handleMilestoneComplete = async (
    dreamId: string,
    milestoneId: string,
    isComplete: boolean
  ): Promise<void> => {
    try {
      // Update milestone completion status in backend
      const updatedMilestone = await toggleMilestoneCompletionForContent(milestoneId);

      // Update local fetched milestones state
      setFetchedDreamMilestones(prev => ({
        ...prev,
        [dreamId]: prev[dreamId]?.map(m => (m.id === milestoneId ? updatedMilestone : m)) || [],
      }));

      // Add to history
      setMilestoneHistory(prev => [
        ...prev,
        {
          dreamId,
          milestoneId,
          action: isComplete ? 'completed' : 'uncompleted',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('❌ Error updating milestone completion:', error);
    }
  };

  const handleDeleteMilestone = async (dreamId: string, milestoneId: string): Promise<void> => {
    if (window.confirm(t('dreamBoard.milestones.deleteConfirm') as string)) {
      try {
        // Delete milestone from backend
        await deleteMilestoneForContent(milestoneId);

        // Update local fetched milestones state
        setFetchedDreamMilestones(prev => ({
          ...prev,
          [dreamId]: (prev[dreamId] || []).filter(m => m.id !== milestoneId),
        }));

        // Add to history
        setMilestoneHistory(prev => [
          ...prev,
          {
            dreamId,
            milestoneId,
            action: 'deleted',
            timestamp: new Date().toISOString(),
          },
        ]);

        // Close editing mode if we were editing this milestone
        if (currentMilestone?.id === milestoneId) {
          setCurrentMilestone(null);
          setMilestoneAction(null);
          setShowMilestoneForm(false);
        }
      } catch (error) {
        console.error('❌ Error deleting milestone:', error);
      }
    }
  };

  // Handle opening the milestone management popup
  const handleOpenMilestoneManager = (dreamId: string): void => {
    setSelectedDreamForMilestones(dreamId);
    setShowMilestonesPopup(true);
    // Reset milestone form view whenever popup opens
    setShowMilestoneForm(false);
    setMilestoneAction(null);
    setCurrentMilestone(null);
  };

  // Convert DreamBoardData to Dreams format for frontend
  const convertDreamBoardDataToDreams = (data: DreamBoardData): Dream[] => {
    const backendData = data as DreamBoardData & { created_at?: string; updated_at?: string };

    return data.content.map((contentItem, index) => ({
      id: contentItem.id,
      title: contentItem.alt || contentItem.caption || `Dream ${index + 1}`,
      description: contentItem.caption || '',
      category: contentItem.categoryId || 'General',
      timeframe: 'mid-term' as const,
      progress: 0,
      createdAt: data.createdAt || backendData.created_at || new Date().toISOString(),
      imageUrl: contentItem.src,
      milestones: [],
      isShared: false,
      // Preserve position data from dream board
      position: contentItem.position,
      size: contentItem.size,
      rotation: contentItem.rotation,
    }));
  };

  // Convert Dreams to DreamBoardData format for API
  const convertDreamsToDreamBoardData = useCallback(
    (dreams: Dream[]): DreamBoardData => {
      const categories = [...new Set(dreams.map(dream => dream.category))];
      const content: DreamBoardContent[] = dreams.map((dream, index) => ({
        id: dream.id,
        type: DreamBoardContentType.IMAGE,
        // Use preserved position data if available, otherwise use default positioning
        position: dream.position || { x: index * 100, y: index * 100 },
        size: dream.size || { width: 200, height: 150 },
        rotation: dream.rotation || 0,
        categoryId: dream.category,
        src: dream.imageUrl,
        alt: dream.title,
        caption: dream.description,
      }));

      return {
        title: t('dreamBoard.board.defaultTitle') as string,
        description: t('dreamBoard.board.defaultDescription') as string,
        categories: categories.length > 0 ? categories : ['Uncategorized'],
        content,
      };
    },
    [t]
  );

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (!reader.result || typeof reader.result !== 'string') {
          reject(new Error('Failed to read selected image'));
          return;
        }
        resolve(reader.result);
      };
      reader.onerror = () => reject(reader.error || new Error('Failed to read selected image'));
      reader.readAsDataURL(file);
    });

  const persistDreamBoard = useCallback(
    async (
      dreamsToSave: Dream[],
      onUploadProgress?: (percent: number) => void
    ): Promise<boolean> => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const dreamBoardData = convertDreamsToDreamBoardData(dreamsToSave);
        if (dreamBoardId) {
          dreamBoardData.id = dreamBoardId;
        }

        const result = await saveDreamBoardData(dreamBoardData, {
          onUploadProgress,
        });
        if (!result) {
          setSaveError('SAVE_FAILED');
          return false;
        }

        if (!dreamBoardId && result.id) {
          setDreamBoardId(result.id);
        }

        const pendingMilestoneEntries = Object.entries(pendingMilestonesRef.current);
        for (const [dreamId, milestoneInputs] of pendingMilestoneEntries) {
          if (milestoneInputs.length === 0) {
            delete pendingMilestonesRef.current[dreamId];
            continue;
          }

          const createdMilestones: Milestone[] = [];
          const failedMilestones: DreamImageMilestoneInput[] = [];

          for (const milestoneInput of milestoneInputs) {
            try {
              const createdMilestone = await createMilestoneForContent(dreamId, {
                title: milestoneInput.title,
                description: milestoneInput.description,
                date: milestoneInput.date,
              });
              createdMilestones.push(createdMilestone);
            } catch (error) {
              console.error('Error creating milestone during image upload:', error);
              failedMilestones.push(milestoneInput);
            }
          }

          if (createdMilestones.length > 0) {
            setFetchedDreamMilestones(previous => ({
              ...previous,
              [dreamId]: [...(previous[dreamId] || []), ...createdMilestones],
            }));
          }

          if (failedMilestones.length > 0) {
            pendingMilestonesRef.current[dreamId] = failedMilestones;
          } else {
            delete pendingMilestonesRef.current[dreamId];
          }
        }

        setHasUnsavedChanges(false);
        return true;
      } catch (error) {
        console.error('Error saving dream board:', error);
        setSaveError('SAVE_FAILED');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [convertDreamsToDreamBoardData, dreamBoardId]
  );

  const queueDreamBoardSave = useCallback(
    (nextDreams: Dream[]): void => {
      pendingDreamsRef.current = nextDreams;
      setHasUnsavedChanges(true);

      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
      }

      autosaveTimeoutRef.current = window.setTimeout(() => {
        const dreamsToPersist = pendingDreamsRef.current;
        if (!dreamsToPersist) {
          return;
        }

        void persistDreamBoard(dreamsToPersist);
      }, AUTOSAVE_DELAY_MS);
    },
    [persistDreamBoard]
  );

  // Update dream progress
  const updateDreamProgress = (dreamId: string, adjustment: number): void => {
    setDreams(prevDreams => {
      const updatedDreams = prevDreams.map(dream => {
        if (dream.id !== dreamId) {
          return dream;
        }

        const newProgress = Math.min(1, Math.max(0, dream.progress + adjustment));
        return { ...dream, progress: newProgress };
      });

      queueDreamBoardSave(updatedDreams);
      return updatedDreams;
    });
  };

  const handleAddDreamImage = async (
    upload: DreamImageUploadInput,
    onProgress?: (percent: number) => void
  ): Promise<void> => {
    if (dreams.length >= MAX_DREAM_BOARD_IMAGES) {
      setSaveError('IMAGE_LIMIT');
      throw new Error('Image limit reached');
    }

    try {
      const imageSource = await readFileAsDataUrl(upload.file);
      const uploadMilestones = upload.milestones.map(milestone => ({
        id:
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: milestone.title,
        description: milestone.description,
        completed: false,
        date: milestone.date,
      }));
      const newDream: Dream = {
        id:
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: upload.title,
        description: upload.caption || '',
        category: upload.category || mockCategories[0] || 'General',
        timeframe: 'mid-term',
        progress: 0,
        createdAt: new Date().toISOString(),
        imageUrl: imageSource,
        milestones: uploadMilestones,
        isShared: false,
      };

      if (upload.milestones.length > 0) {
        pendingMilestonesRef.current[newDream.id] = upload.milestones;
      }

      let updatedDreams: Dream[] = [];
      setDreams(prevDreams => {
        updatedDreams = [...prevDreams, newDream];
        return updatedDreams;
      });

      pendingDreamsRef.current = updatedDreams;
      setHasUnsavedChanges(true);
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }

      const didPersist = await persistDreamBoard(updatedDreams, onProgress);
      if (!didPersist) {
        delete pendingMilestonesRef.current[newDream.id];
        setDreams(prevDreams => prevDreams.filter(dream => dream.id !== newDream.id));
        pendingDreamsRef.current = null;
        setHasUnsavedChanges(false);
        throw new Error('Dream board upload save failed');
      }
    } catch (error) {
      console.error('Error adding dream image:', error);
      setSaveError('SAVE_FAILED');
      throw error;
    }
  };

  const handleRemoveDreamImage = (dreamId: string): void => {
    delete pendingMilestonesRef.current[dreamId];
    setFetchedDreamMilestones(previous => {
      if (!previous[dreamId]) {
        return previous;
      }

      const nextState = { ...previous };
      delete nextState[dreamId];
      return nextState;
    });

    setDreams(prevDreams => {
      const updatedDreams = prevDreams.filter(dream => dream.id !== dreamId);
      queueDreamBoardSave(updatedDreams);
      return updatedDreams;
    });
  };

  // Load existing dream board data on component mount
  useEffect(() => {
    const loadDreamBoardData = async (): Promise<void> => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await getLatestDreamBoardData();
        if (data?.id) {
          setDreamBoardId(data.id);
        }

        if (data?.content && data.content.length > 0) {
          setDreams(convertDreamBoardDataToDreams(data));
        } else {
          setDreams([]);
        }
      } catch (error) {
        console.error('Error loading dream board:', error);
        setLoadError('LOAD_FAILED');
      } finally {
        setIsLoading(false);
      }
    };

    loadDreamBoardData();
  }, []);

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle initiating add/edit milestone
  const handleInitiateMilestoneAction = (
    action: 'add' | 'edit',
    milestone: Milestone | null = null
  ): void => {
    setMilestoneAction(action);
    setCurrentMilestone(milestone);
    setShowMilestoneForm(true);
  };

  // Handle save milestone with integrated form
  const handleSaveMilestone = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const description = (
      form.elements.namedItem('description') as HTMLTextAreaElement
    ).value.trim();
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;

    if (!selectedDreamForMilestones || !title) return;

    try {
      if (milestoneAction === 'add') {
        // Create new milestone in backend
        const newMilestone = await createMilestoneForContent(selectedDreamForMilestones, {
          title,
          description: description || undefined,
          date: date || undefined,
        });

        // Update local fetched milestones state
        setFetchedDreamMilestones(prev => ({
          ...prev,
          [selectedDreamForMilestones]: [...(prev[selectedDreamForMilestones] || []), newMilestone],
        }));

        // Add to history
        setMilestoneHistory(prev => [
          ...prev,
          {
            dreamId: selectedDreamForMilestones,
            milestoneId: newMilestone.id,
            action: 'added',
            timestamp: new Date().toISOString(),
          },
        ]);
      } else if (milestoneAction === 'edit' && currentMilestone) {
        // Update existing milestone in backend
        const milestoneToUpdate = {
          ...currentMilestone,
          title,
          description: description || undefined,
          date: date || undefined,
        };

        const updatedMilestone = await updateMilestoneForContent(milestoneToUpdate);

        // Update local fetched milestones state
        setFetchedDreamMilestones(prev => ({
          ...prev,
          [selectedDreamForMilestones]: (prev[selectedDreamForMilestones] || []).map(m =>
            m.id === currentMilestone.id ? updatedMilestone : m
          ),
        }));

        // Add to history
        setMilestoneHistory(prev => [
          ...prev,
          {
            dreamId: selectedDreamForMilestones,
            milestoneId: updatedMilestone.id,
            action: 'edited',
            timestamp: new Date().toISOString(),
          },
        ]);
      }

      // Reset form state
      setShowMilestoneForm(false);
      setMilestoneAction(null);
      setCurrentMilestone(null);
    } catch (error) {
      console.error('❌ Error saving milestone:', error);
    }
  };

  // Cancel milestone editing/adding
  const handleCancelMilestoneForm = (): void => {
    setShowMilestoneForm(false);
    setMilestoneAction(null);
    setCurrentMilestone(null);
  };

  // Format date for display
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return t('dreamBoard.milestones.noDateSet') as string;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Get selected dream object
  const selectedDream = dreams.find(dream => dream.id === selectedDreamForMilestones);

  // Generate path for the progress chart
  const generateProgressChartPath = (
    dataPoints: Array<{ date: Date; percentage: number }>,
    width: number,
    height: number
  ): string => {
    if (dataPoints.length === 0) return '';

    // Find min and max dates for scaling
    const minDate = dataPoints[0].date;
    const maxDate = dataPoints[dataPoints.length - 1].date;
    const timeRange = maxDate.getTime() - minDate.getTime();

    // Create SVG path
    return dataPoints
      .map((point, index) => {
        const x = width * ((point.date.getTime() - minDate.getTime()) / timeRange);
        const y = height - (point.percentage / 100) * height;
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');
  };

  // Get completion events from backend to create progress chart data
  const getProgressChartData = async (
    dreamId: string
  ): Promise<Array<{ date: Date; percentage: number }>> => {
    try {
      // Import the milestone events API
      const { getProgressTimelineForContent } = await import('./api/dreamMilestoneEventsApi');

      // Get progress timeline data from backend
      const timelineData = await getProgressTimelineForContent(dreamId);

      // Transform backend data to the format expected by the chart
      const chartPoints = timelineData.map(point => ({
        date: new Date(point.date),
        percentage: point.percentage,
        milestone_title: point.milestone_title,
        event_type: point.event_type,
      }));

      // If no timeline data but we have current milestones, create a current state point
      if (chartPoints.length === 0) {
        const currentMilestones = fetchedDreamMilestones[dreamId] || [];
        const totalMilestones = currentMilestones.length;
        const currentCompletedCount = currentMilestones.filter(m => m.completed).length;
        const currentPercentage =
          totalMilestones > 0 ? (currentCompletedCount / totalMilestones) * 100 : 0;

        if (totalMilestones > 0) {
          return [
            {
              date: new Date(),
              percentage: currentPercentage,
            },
          ];
        }
        return [];
      }

      return chartPoints;
    } catch (error) {
      console.error('❌ Error fetching progress chart data from backend:', error);

      // Fallback to current milestone state if backend fails
      const currentMilestones = fetchedDreamMilestones[dreamId] || [];
      const totalMilestones = currentMilestones.length;
      const currentCompletedCount = currentMilestones.filter(m => m.completed).length;
      const currentPercentage =
        totalMilestones > 0 ? (currentCompletedCount / totalMilestones) * 100 : 0;

      if (totalMilestones > 0) {
        return [
          {
            date: new Date(),
            percentage: currentPercentage,
          },
        ];
      }
      return [];
    }
  };

  // Check if the user has any dreams
  const hasNoDreams = dreams.length === 0;
  const saveErrorMessage =
    saveError === 'SAVE_FAILED'
      ? (t('dreamBoard.errors.saveFailed') as string)
      : saveError === 'IMAGE_LIMIT'
        ? (t('dreamBoard.board.imageLimit') as string)
        : saveError;

  const triggerFirstImageUpload = (): void => {
    firstImageInputRef.current?.click();
  };

  const handleFirstImageSelection = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    const defaultTitle = selectedFile.name.replace(/\.[^/.]+$/, '').trim() || 'My Dream';
    void handleAddDreamImage({
      file: selectedFile,
      title: defaultTitle,
      category: mockCategories[0] || 'General',
      milestones: [],
    });
  };

  // Empty state content
  const renderEmptyState = (): JSX.Element => (
    <div className={styles.emptyDreamBoardContainer}>
      <div className={styles.emptyDreamBoardContent}>
        <div className={styles.emptyDreamBoardIcon}>✨</div>
        <h2 className={styles.emptyDreamBoardTitle}>
          {t('dreamBoard.emptyState.firstImage.title')}
        </h2>
        <p className={styles.emptyDreamBoardDescription}>
          {t('dreamBoard.emptyState.firstImage.description')}
        </p>
        <ul className={styles.emptyDreamBoardFeatureList}>
          <li>{t('dreamBoard.emptyState.firstImage.features.quickVision')}</li>
          <li>{t('dreamBoard.emptyState.firstImage.features.categories')}</li>
          <li>{t('dreamBoard.emptyState.firstImage.features.insights')}</li>
        </ul>
        <button className={styles.createDreamBoardButton} onClick={triggerFirstImageUpload}>
          <span className={styles.createButtonIcon}>+</span>
          {t('dreamBoard.emptyState.firstImage.cta')}
        </button>
        <input
          ref={firstImageInputRef}
          type="file"
          accept="image/*"
          onChange={handleFirstImageSelection}
          className={styles.hiddenFileInput}
          aria-label={t('dreamBoard.emptyState.firstImage.cta') as string}
          data-testid="dream-board-empty-upload-input"
        />
      </div>
    </div>
  );

  // Handle fetched milestones from DreamProgress component
  const handleMilestonesLoaded = useCallback(
    (dreamMilestones: Record<string, Milestone[]>): void => {
      setFetchedDreamMilestones(dreamMilestones);
    },
    []
  );

  return (
    <div className={styles.dreamBoardContainer}>
      <header className={styles.header}>
        {!hasNoDreams && (
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>{t('dreamBoard.title')}</h1>
            {hasUnsavedChanges && <span className={styles.unsavedIndicator}>●</span>}
          </div>
        )}
        {!hasNoDreams && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'vision-board' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('vision-board')}
            >
              {t('dreamBoard.tabs.visionBoard')}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'experience' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              {t('dreamBoard.tabs.experience')}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'insights' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              {t('dreamBoard.tabs.insights')}
            </button>
          </div>
        )}
      </header>

      {/* Main Content Section */}
      <main className={styles.mainContent}>
        {isLoading ? (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <p>{t('dreamBoard.loading.dreamBoard')}</p>
            </div>
          </div>
        ) : loadError ? (
          <div className={styles.errorNotification}>
            <p>{loadError === 'LOAD_FAILED' ? t('dreamBoard.errors.loadFailed') : loadError}</p>
            <button onClick={() => setLoadError(null)}>×</button>
          </div>
        ) : hasNoDreams ? (
          renderEmptyState()
        ) : (
          <>
            {activeTab === 'vision-board' && (
              <VisionBoardTab
                dreams={dreams}
                expandedMiniBoard={expandedMiniBoard}
                toggleMiniBoard={toggleMiniBoard}
                updateDreamProgress={updateDreamProgress}
                handleOpenMilestoneManager={handleOpenMilestoneManager}
                onAddDreamImage={handleAddDreamImage}
                onRemoveDreamImage={handleRemoveDreamImage}
                isDreamBoardSaving={isSaving}
                hasUnsavedChanges={hasUnsavedChanges}
                dreamBoardErrorMessage={saveErrorMessage}
                getCategoryDetails={getCategoryDetails}
                calculateCategoryProgress={calculateCategoryProgress}
                hoveredCategory={hoveredCategory}
                setHoveredCategory={setHoveredCategory}
                expandedCategory={expandedCategory}
                toggleCategoryExpand={toggleCategoryExpand}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                categories={mockCategories}
                handleMilestonesLoaded={handleMilestonesLoaded}
                fetchedMilestones={fetchedDreamMilestones}
              />
            )}

            {activeTab === 'experience' && (
              <div className={styles.experienceTab}>
                <CosmicDreamExperience
                  dreams={dreams}
                  categories={[...new Set(dreams.map(dream => dream.category))]}
                  onDreamSelect={handleDreamSelect}
                  activeDream={activeDream}
                />
              </div>
            )}

            {activeTab === 'insights' && (
              <DreamInsights dreams={dreams} insights={mockInsights} resources={mockResources} />
            )}
          </>
        )}
      </main>

      {/* Footer Tools Section - Only show if the user has dreams */}
      {!hasNoDreams && (
        <div className={styles.bottomToolsContainer}>
          <FooterTools
            weather={
              dreamWeather || {
                overall: 'cloudy',
                message: weatherError ? 'Unable to load weather data' : 'Loading weather...',
                categoryStatus: {},
              }
            }
            notifications={mockNotifications}
          />
          <DreamChallengeContainer dreams={dreams} />
        </div>
      )}

      {/* Save Error Notification */}
      {saveError && (
        <div className={styles.errorNotification}>
          <p>{saveErrorMessage}</p>
          <button onClick={() => setSaveError(null)}>×</button>
        </div>
      )}

      {/* Milestones Management Popup */}
      {showMilestonesPopup && selectedDream && (
        <MilestonesPopup
          selectedDream={selectedDream}
          showMilestonesPopup={showMilestonesPopup}
          showMilestoneForm={showMilestoneForm}
          setShowMilestonesPopup={setShowMilestonesPopup}
          milestoneAction={milestoneAction}
          currentMilestone={currentMilestone}
          activeVizTab={activeVizTab}
          setActiveVizTab={setActiveVizTab}
          handleMilestoneComplete={handleMilestoneComplete}
          handleDeleteMilestone={handleDeleteMilestone}
          handleInitiateMilestoneAction={handleInitiateMilestoneAction}
          handleSaveMilestone={handleSaveMilestone}
          handleCancelMilestoneForm={handleCancelMilestoneForm}
          formatDisplayDate={formatDisplayDate}
          generateProgressChartPath={generateProgressChartPath}
          getProgressChartData={getProgressChartData}
          milestoneHistory={milestoneHistory}
          achievementBadges={achievementBadges}
          fetchedMilestones={selectedDream ? fetchedDreamMilestones[selectedDream.id] : undefined}
        />
      )}
    </div>
  );
};

export default DreamBoardPage;
