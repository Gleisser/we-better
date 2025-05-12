import React, { useState } from 'react';
import styles from './DreamBoardPage.module.css';
import { Dream, JournalEntry, Milestone, Challenge } from './types';
import {
  mockDreams,
  mockCategories,
  mockJournalEntries,
  mockResources,
  mockChallenges,
  mockInsights,
  mockWeather,
  mockNotifications,
} from './mock-data';
import { CosmicDreamExperience } from './components/CosmicDreamExperience/CosmicDreamExperience';
import { DreamBoardModal } from './components/DreamBoardModal';
import { DEFAULT_LIFE_CATEGORIES } from '../life-wheel/constants/categories';
import categoryDetails from './components/constants/dreamboard';
import achievementBadges from './components/constants/achievements';
import VisionBoardTab from './components/VisionBoardTab';
import DreamInsights from './components/DreamInsights';
import DetailedTimeline from './components/DetailedTimeline';
import DreamJournal from './components/DreamJournal';
import FooterTools from './components/FooterTools';
import MilestonesPopup from './components/MilestonesPopup';
import ChallengeModal from './components/DreamChallenge/ChallengeModal';

type CategoryDetails = {
  icon: string;
  illustration: string;
  gradient: string;
  hoverGradient: string;
  shadowColor: string;
  color: string;
};

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
  const [expandedMiniBoard, setExpandedMiniBoard] = useState(false);
  const [activeTab, setActiveTab] = useState('vision-board');
  const [dreams, setDreams] = useState<Dream[]>(mockDreams);
  const [journalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [activeDream, setActiveDream] = useState<Dream | null>(null);
  const [isDreamBoardModalOpen, setIsDreamBoardModalOpen] = useState(false);

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

  // New state for challenge modal
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // New state for inline form display
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  // New state variables for visualizations
  const [activeVizTab, setActiveVizTab] = useState<'timeline' | 'chart' | 'achievements' | null>(
    null
  );

  // Define achievement badge criteria

  // Toggle mini vision board expansion
  const toggleMiniBoard = (): void => {
    setExpandedMiniBoard(!expandedMiniBoard);
  };

  // Helper to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Handle dream selection
  const handleDreamSelect = (dream: Dream | null): void => {
    setActiveDream(dream);
  };

  // Update dream progress
  const updateDreamProgress = (dreamId: string, adjustment: number): void => {
    setDreams(prevDreams =>
      prevDreams.map(dream => {
        if (dream.id === dreamId) {
          // Calculate new progress and ensure it stays between 0 and 1
          const newProgress = Math.min(1, Math.max(0, dream.progress + adjustment));
          return { ...dream, progress: newProgress };
        }
        return dream;
      })
    );
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
  const handleMilestoneComplete = (
    dreamId: string,
    milestoneId: string,
    isComplete: boolean
  ): void => {
    setDreams(prevDreams =>
      prevDreams.map(dream => {
        if (dream.id === dreamId) {
          const updatedMilestones = dream.milestones.map(milestone =>
            milestone.id === milestoneId ? { ...milestone, completed: isComplete } : milestone
          );

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

          // Recalculate progress based on milestones
          const completedCount = updatedMilestones.filter(m => m.completed).length;
          const totalCount = updatedMilestones.length;
          const newProgress = totalCount > 0 ? completedCount / totalCount : 0;

          return {
            ...dream,
            milestones: updatedMilestones,
            progress: newProgress,
          };
        }
        return dream;
      })
    );
  };

  const handleDeleteMilestone = (dreamId: string, milestoneId: string): void => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      setDreams(prevDreams =>
        prevDreams.map(dream => {
          if (dream.id === dreamId) {
            const updatedMilestones = dream.milestones.filter(
              milestone => milestone.id !== milestoneId
            );

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

            // Recalculate progress
            const completedCount = updatedMilestones.filter(m => m.completed).length;
            const totalCount = updatedMilestones.length;
            const newProgress = totalCount > 0 ? completedCount / totalCount : 0;

            return {
              ...dream,
              milestones: updatedMilestones,
              progress: newProgress,
            };
          }
          return dream;
        })
      );
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

  // Handle opening the challenge modal
  const handleOpenChallengeModal = (): void => {
    setIsChallengeModalOpen(true);
  };

  // Handle closing the challenge modal
  const handleCloseChallengeModal = (): void => {
    setIsChallengeModalOpen(false);
  };

  // Handle saving a new challenge
  const handleSaveChallenge = (challengeData: Omit<Challenge, 'id'>): void => {
    // In a real app, this would save to a database
    console.info('New challenge created:', challengeData);
    // You would then update mockChallenges or fetch updated challenges
    handleCloseChallengeModal();
  };

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
  const handleSaveMilestone = (e: React.FormEvent): void => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;

    if (!selectedDreamForMilestones) return;

    const milestoneData: Milestone = {
      id: currentMilestone?.id || '',
      title,
      description,
      completed: currentMilestone?.completed || false,
      date: date ? new Date(date).toISOString() : undefined,
    };

    setDreams(prevDreams =>
      prevDreams.map(dream => {
        if (dream.id === selectedDreamForMilestones) {
          let updatedMilestones;

          if (milestoneAction === 'add') {
            // Generate a unique ID for new milestone
            const newMilestone = {
              ...milestoneData,
              id: `m${Date.now()}`,
              completed: false,
            };
            updatedMilestones = [...dream.milestones, newMilestone];

            // Add to history
            setMilestoneHistory(prev => [
              ...prev,
              {
                dreamId: dream.id,
                milestoneId: newMilestone.id,
                action: 'added',
                timestamp: new Date().toISOString(),
              },
            ]);
          } else if (milestoneAction === 'edit' && currentMilestone) {
            updatedMilestones = dream.milestones.map(m =>
              m.id === currentMilestone.id ? milestoneData : m
            );

            // Add to history
            setMilestoneHistory(prev => [
              ...prev,
              {
                dreamId: dream.id,
                milestoneId: milestoneData.id,
                action: 'edited',
                timestamp: new Date().toISOString(),
              },
            ]);
          } else {
            updatedMilestones = dream.milestones;
          }

          // Recalculate progress
          const completedCount = updatedMilestones.filter(m => m.completed).length;
          const totalCount = updatedMilestones.length;
          const newProgress = totalCount > 0 ? completedCount / totalCount : 0;

          return {
            ...dream,
            milestones: updatedMilestones,
            progress: newProgress,
          };
        }
        return dream;
      })
    );

    // Reset form state
    setShowMilestoneForm(false);
    setMilestoneAction(null);
    setCurrentMilestone(null);
  };

  // Cancel milestone editing/adding
  const handleCancelMilestoneForm = (): void => {
    setShowMilestoneForm(false);
    setMilestoneAction(null);
    setCurrentMilestone(null);
  };

  // Format date for display
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return 'No date set';
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

  // Get completion events from history to create progress chart data
  const getProgressChartData = (dreamId: string): Array<{ date: Date; percentage: number }> => {
    const relevantEvents = milestoneHistory
      .filter(
        h => h.dreamId === dreamId && (h.action === 'completed' || h.action === 'uncompleted')
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (relevantEvents.length === 0) {
      const dream = dreams.find(d => d.id === dreamId);
      if (!dream) return [];

      // If no events but we have current progress, add a single data point
      return [
        {
          date: new Date(),
          percentage: dream.progress * 100,
        },
      ];
    }

    // Calculate progress at each event
    const dream = dreams.find(d => d.id === dreamId);
    if (!dream) return [];

    const totalMilestones = dream.milestones.length;
    const points: Array<{ date: Date; percentage: number }> = [];
    let currentCompleted = 0;

    // Add starting point if we have events
    points.push({
      date: new Date(relevantEvents[0].timestamp),
      percentage: 0,
    });

    relevantEvents.forEach(event => {
      if (event.action === 'completed') {
        currentCompleted++;
      } else if (event.action === 'uncompleted') {
        currentCompleted = Math.max(0, currentCompleted - 1);
      }

      const percentage = totalMilestones > 0 ? (currentCompleted / totalMilestones) * 100 : 0;
      points.push({
        date: new Date(event.timestamp),
        percentage,
      });
    });

    return points;
  };

  return (
    <div className={styles.dreamBoardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dream Board</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'vision-board' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('vision-board')}
          >
            Vision Board
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'experience' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            Experience
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'insights' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'timeline' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'journal' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('journal')}
          >
            Journal
          </button>
        </div>
      </header>

      {/* Main Content Section */}
      <main className={styles.mainContent}>
        {activeTab === 'vision-board' && (
          <VisionBoardTab
            dreams={dreams}
            expandedMiniBoard={expandedMiniBoard}
            toggleMiniBoard={toggleMiniBoard}
            updateDreamProgress={updateDreamProgress}
            handleOpenMilestoneManager={handleOpenMilestoneManager}
            openDreamBoardModal={() => setIsDreamBoardModalOpen(true)}
            getCategoryDetails={getCategoryDetails}
            calculateCategoryProgress={calculateCategoryProgress}
            hoveredCategory={hoveredCategory}
            setHoveredCategory={setHoveredCategory}
            expandedCategory={expandedCategory}
            toggleCategoryExpand={toggleCategoryExpand}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={mockCategories}
          />
        )}

        {activeTab === 'experience' && (
          <div className={styles.experienceTab}>
            <CosmicDreamExperience
              dreams={dreams}
              categories={mockCategories}
              onDreamSelect={handleDreamSelect}
              activeDream={activeDream}
            />
          </div>
        )}

        {activeTab === 'insights' && (
          <DreamInsights dreams={dreams} insights={mockInsights} resources={mockResources} />
        )}

        {activeTab === 'timeline' && <DetailedTimeline />}

        {activeTab === 'journal' && (
          <DreamJournal dreams={dreams} journalEntries={journalEntries} formatDate={formatDate} />
        )}
      </main>

      {/* Footer Tools Section */}
      <FooterTools
        weather={mockWeather}
        notifications={mockNotifications}
        challenges={mockChallenges}
        dreams={dreams}
        onOpenChallengeModal={handleOpenChallengeModal}
      />

      {/* Dream Board Modal */}
      <DreamBoardModal
        isOpen={isDreamBoardModalOpen}
        onClose={() => setIsDreamBoardModalOpen(false)}
        categories={DEFAULT_LIFE_CATEGORIES}
      />

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
        />
      )}

      {/* Challenge Modal */}
      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={handleCloseChallengeModal}
        onSave={handleSaveChallenge}
        dreams={dreams}
      />
    </div>
  );
};

export default DreamBoardPage;
