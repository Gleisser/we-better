import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDreamBoardTranslation } from '@/shared/hooks/useTranslation';
import { cn } from '@/utils/classnames';
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
import { mockCategories, mockInsights, mockNotifications } from './mock-data';
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
import { deleteDreamBoardStorageFiles, uploadDreamBoardImageFile } from './utils/imageStorage';
import { formatDreamBoardImageLimit, validateDreamBoardUploadFile } from './utils/imagePersistence';

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
const TAB_BUTTON_CLASS_NAME =
  'rounded-lg border px-4 py-2 text-slate-50 transition-all duration-200';
const TAB_BUTTON_INACTIVE_CLASS_NAME =
  'border-violet-500/30 bg-neutral-950/60 hover:border-violet-500/50 hover:bg-neutral-800/60';
const TAB_BUTTON_ACTIVE_CLASS_NAME = 'border-violet-500/70 bg-violet-500/20';
const ERROR_NOTIFICATION_CLASS_NAME =
  'fixed right-5 top-5 z-[1000] flex max-w-[400px] items-center justify-between gap-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-[0_4px_12px_rgba(0,0,0,0.1)]';
const ERROR_NOTIFICATION_BUTTON_CLASS_NAME =
  'flex h-6 w-6 items-center justify-center rounded-full p-0 text-xl text-rose-700 transition hover:bg-rose-100';

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
  const { t } = useDreamBoardTranslation();

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
      imageStorageBucket: contentItem.storageBucket,
      imageStoragePath: contentItem.storagePath,
      imageMimeType: contentItem.mimeType,
      imageFileSizeBytes: contentItem.fileSizeBytes,
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
        storageBucket: dream.imageStorageBucket,
        storagePath: dream.imageStoragePath,
        mimeType: dream.imageMimeType,
        fileSizeBytes: dream.imageFileSizeBytes,
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
      onProgress?.(5);
      const newDreamId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const uploadedImage = await uploadDreamBoardImageFile(upload.file, newDreamId);
      onProgress?.(35);
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
        id: newDreamId,
        title: upload.title,
        description: upload.caption || '',
        category: upload.category || mockCategories[0] || 'General',
        timeframe: 'mid-term',
        progress: 0,
        createdAt: new Date().toISOString(),
        imageUrl: uploadedImage.publicUrl,
        imageStorageBucket: uploadedImage.bucket,
        imageStoragePath: uploadedImage.path,
        imageMimeType: uploadedImage.mimeType,
        imageFileSizeBytes: uploadedImage.fileSizeBytes,
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
        await deleteDreamBoardStorageFiles([
          {
            bucket: uploadedImage.bucket,
            path: uploadedImage.path,
          },
        ]);
        delete pendingMilestonesRef.current[newDream.id];
        setDreams(prevDreams => prevDreams.filter(dream => dream.id !== newDream.id));
        pendingDreamsRef.current = null;
        setHasUnsavedChanges(false);
        throw new Error('Dream board upload save failed');
      }
    } catch (error) {
      console.error('Error adding dream image:', error);
      const errorMessage = error instanceof Error ? error.message : '';

      if (errorMessage.includes('Unsupported dream board image format')) {
        setSaveError(t('dreamBoard.board.imageUnsupportedType') as string);
      } else if (errorMessage.includes('5 MB upload limit')) {
        setSaveError(
          t('dreamBoard.board.imageUploadLimit', {
            limit: formatDreamBoardImageLimit(),
          }) as string
        );
      } else {
        setSaveError('SAVE_FAILED');
      }
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
  const experienceCategories = useMemo(
    () => [...new Set(dreams.map(dream => dream.category))],
    [dreams]
  );
  const footerWeather = useMemo(
    () =>
      dreamWeather ?? {
        overall: 'cloudy' as const,
        message: weatherError ? 'Unable to load weather data' : 'Loading weather...',
        categoryStatus: {},
      },
    [dreamWeather, weatherError]
  );

  const triggerFirstImageUpload = (): void => {
    firstImageInputRef.current?.click();
  };

  const handleFirstImageSelection = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    void (async () => {
      const validationResult = await validateDreamBoardUploadFile(selectedFile);

      if (!validationResult.fitsLimit) {
        setSaveError(
          validationResult.reason === 'unsupportedType'
            ? (t('dreamBoard.board.imageUnsupportedType') as string) || ''
            : (t('dreamBoard.board.imageUploadLimit', {
                limit: formatDreamBoardImageLimit(),
              }) as string) || ''
        );
        return;
      }

      const defaultTitle = selectedFile.name.replace(/\.[^/.]+$/, '').trim() || 'My Dream';

      try {
        await handleAddDreamImage({
          file: selectedFile,
          title: defaultTitle,
          category: mockCategories[0] || 'General',
          milestones: [],
        });
      } catch (error) {
        console.error('Error handling first dream image selection:', error);
      }
    })();
  };

  // Empty state content
  const renderEmptyState = (): JSX.Element => (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-[650px] rounded-3xl border border-violet-500/20 bg-[linear-gradient(135deg,rgba(30,30,60,0.8),rgba(45,35,75,0.8))] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-[10px] md:p-12">
        <div className="mb-6 inline-block text-6xl motion-safe:animate-pulse">✨</div>
        <h2 className="mb-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 bg-clip-text text-[1.8rem] font-bold text-transparent md:text-[2.2rem]">
          {t('dreamBoard.emptyState.firstImage.title')}
        </h2>
        <p className="mb-5 text-base leading-7 text-white/90 md:text-[1.1rem]">
          {t('dreamBoard.emptyState.firstImage.description')}
        </p>
        <ul className="mb-8 grid gap-2.5">
          <li className="rounded-[0.55rem] border border-white/15 bg-white/10 px-3 py-2.5 text-[0.96rem] text-slate-100/95">
            {t('dreamBoard.emptyState.firstImage.features.quickVision')}
          </li>
          <li className="rounded-[0.55rem] border border-white/15 bg-white/10 px-3 py-2.5 text-[0.96rem] text-slate-100/95">
            {t('dreamBoard.emptyState.firstImage.features.categories')}
          </li>
          <li className="rounded-[0.55rem] border border-white/15 bg-white/10 px-3 py-2.5 text-[0.96rem] text-slate-100/95">
            {t('dreamBoard.emptyState.firstImage.features.insights')}
          </li>
        </ul>
        <button
          className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-white shadow-[0_10px_25px_rgba(139,92,246,0.4),inset_0_0_0_1px_rgba(255,255,255,0.1)] transition hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(139,92,246,0.5),inset_0_0_0_1px_rgba(255,255,255,0.2)] active:-translate-y-px active:shadow-[0_5px_15px_rgba(139,92,246,0.4),inset_0_0_0_1px_rgba(255,255,255,0.1)] md:px-8 md:text-[1.1rem]"
          onClick={triggerFirstImageUpload}
          type="button"
        >
          <span className="text-[1.4rem] leading-none">+</span>
          {t('dreamBoard.emptyState.firstImage.cta')}
        </button>
        <input
          id="dream-board-first-image-upload"
          name="firstDreamBoardImage"
          ref={firstImageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFirstImageSelection}
          className="hidden"
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
  const getTabButtonClassName = (tab: string): string =>
    cn(
      TAB_BUTTON_CLASS_NAME,
      activeTab === tab ? TAB_BUTTON_ACTIVE_CLASS_NAME : TAB_BUTTON_INACTIVE_CLASS_NAME
    );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 text-slate-50 md:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        {!hasNoDreams && (
          <div className="flex items-center gap-2">
            <h1 className="bg-gradient-to-br from-violet-500 to-fuchsia-500 bg-clip-text text-3xl font-bold text-transparent md:text-[2rem]">
              {t('dreamBoard.title')}
            </h1>
            {hasUnsavedChanges && (
              <span className="-mt-1 text-xl leading-none text-amber-500 animate-pulse">●</span>
            )}
          </div>
        )}
        {!hasNoDreams && (
          <div className="flex flex-wrap gap-4">
            <button
              className={getTabButtonClassName('vision-board')}
              onClick={() => setActiveTab('vision-board')}
              type="button"
            >
              {t('dreamBoard.tabs.visionBoard')}
            </button>
            <button
              className={getTabButtonClassName('experience')}
              onClick={() => setActiveTab('experience')}
              type="button"
            >
              {t('dreamBoard.tabs.experience')}
            </button>
            <button
              className={getTabButtonClassName('insights')}
              onClick={() => setActiveTab('insights')}
              type="button"
            >
              {t('dreamBoard.tabs.insights')}
            </button>
          </div>
        )}
      </header>

      {/* Main Content Section */}
      <main className="mb-8">
        {isLoading ? (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <div className="rounded-xl bg-white p-8 text-center text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-violet-500"></div>
              <p>{t('dreamBoard.loading.dreamBoard')}</p>
            </div>
          </div>
        ) : loadError ? (
          <div className={ERROR_NOTIFICATION_CLASS_NAME}>
            <p>{loadError === 'LOAD_FAILED' ? t('dreamBoard.errors.loadFailed') : loadError}</p>
            <button
              className={ERROR_NOTIFICATION_BUTTON_CLASS_NAME}
              onClick={() => setLoadError(null)}
              type="button"
            >
              ×
            </button>
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
              <div>
                <CosmicDreamExperience
                  dreams={dreams}
                  categories={experienceCategories}
                  onDreamSelect={handleDreamSelect}
                  activeDream={activeDream}
                />
              </div>
            )}

            {activeTab === 'insights' && <DreamInsights dreams={dreams} insights={mockInsights} />}
          </>
        )}
      </main>

      {/* Footer Tools Section - Only show if the user has dreams */}
      {!hasNoDreams && (
        <div className="mt-8 grid gap-4 md:gap-8 lg:grid-cols-2">
          <FooterTools weather={footerWeather} notifications={mockNotifications} />
          <DreamChallengeContainer dreams={dreams} />
        </div>
      )}

      {/* Save Error Notification */}
      {saveError && (
        <div className={ERROR_NOTIFICATION_CLASS_NAME}>
          <p>{saveErrorMessage}</p>
          <button
            className={ERROR_NOTIFICATION_BUTTON_CLASS_NAME}
            onClick={() => setSaveError(null)}
            type="button"
          >
            ×
          </button>
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
