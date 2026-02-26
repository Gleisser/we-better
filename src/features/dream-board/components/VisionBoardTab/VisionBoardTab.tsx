import React from 'react';
import { Dream, DreamImageUploadInput } from '../../types';
import styles from '../../DreamBoardPage.module.css';
import DreamCategories from '../DreamCategories';
import DreamProgress from '../DreamProgress';
import QuickVision from '../QuickVision';
import { DreamBoardTimelineGallery } from '../DreamBoardTimelineGallery';

// Define CategoryDetails type
type CategoryDetails = {
  icon: string;
  illustration: string;
  gradient: string;
  hoverGradient: string;
  shadowColor: string;
  color: string;
};

interface VisionBoardTabProps {
  dreams: Dream[];
  expandedMiniBoard: boolean;
  toggleMiniBoard: () => void;
  updateDreamProgress: (dreamId: string, adjustment: number) => void;
  handleOpenMilestoneManager: (dreamId: string) => void;
  onAddDreamImage: (
    upload: DreamImageUploadInput,
    onProgress?: (percent: number) => void
  ) => Promise<void>;
  onRemoveDreamImage: (dreamId: string) => void;
  isDreamBoardSaving: boolean;
  hasUnsavedChanges: boolean;
  dreamBoardErrorMessage: string | null;
  getCategoryDetails: (category: string) => CategoryDetails;
  calculateCategoryProgress: (category: string) => number;
  hoveredCategory: string | null;
  setHoveredCategory: (category: string | null) => void;
  expandedCategory: string | null;
  toggleCategoryExpand: (category: string) => void;
  filterCategory: string | null;
  setFilterCategory: (category: string | null) => void;
  categories: string[];
  handleMilestonesLoaded: (
    dreamMilestones: Record<string, import('../../types').Milestone[]>
  ) => void;
  fetchedMilestones?: Record<string, import('../../types').Milestone[]>;
}

const VisionBoardTab: React.FC<VisionBoardTabProps> = ({
  dreams,
  expandedMiniBoard,
  toggleMiniBoard,
  updateDreamProgress,
  handleOpenMilestoneManager,
  onAddDreamImage,
  onRemoveDreamImage,
  isDreamBoardSaving,
  hasUnsavedChanges,
  dreamBoardErrorMessage,
  getCategoryDetails,
  calculateCategoryProgress,
  hoveredCategory,
  setHoveredCategory,
  expandedCategory,
  toggleCategoryExpand,
  filterCategory,
  setFilterCategory,
  categories,
  handleMilestonesLoaded,
  fetchedMilestones,
}) => {
  return (
    <>
      <DreamBoardTimelineGallery
        dreams={dreams}
        onAddImage={onAddDreamImage}
        onRemoveImage={onRemoveDreamImage}
        isDreamBoardSaving={isDreamBoardSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        errorMessage={dreamBoardErrorMessage}
        categories={categories}
      />

      {/* Quick Access Mini Vision Board */}
      <QuickVision
        dreams={dreams}
        expandedMiniBoard={expandedMiniBoard}
        toggleMiniBoard={toggleMiniBoard}
        updateDreamProgress={updateDreamProgress}
      />

      <div className={styles.visionBoardTab}>
        {/* Dream Categories Dashboard */}
        <DreamCategories
          categories={categories}
          dreams={dreams}
          getCategoryDetails={getCategoryDetails}
          calculateCategoryProgress={calculateCategoryProgress}
          hoveredCategory={hoveredCategory}
          setHoveredCategory={setHoveredCategory}
          expandedCategory={expandedCategory}
          toggleCategoryExpand={toggleCategoryExpand}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />

        {/* Dream Progress Component */}
        <DreamProgress
          dreams={dreams}
          handleOpenMilestoneManager={handleOpenMilestoneManager}
          getCategoryDetails={getCategoryDetails}
          onMilestonesLoaded={handleMilestonesLoaded}
          fetchedMilestones={fetchedMilestones}
        />
      </div>
    </>
  );
};

export default VisionBoardTab;
