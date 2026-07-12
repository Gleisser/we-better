import React from 'react';
import { Dream, DreamImageUploadInput } from '../../types';
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
      <div data-tour="dream-board-gallery">
        <DreamBoardTimelineGallery
          dreams={dreams}
          onAddImage={onAddDreamImage}
          onRemoveImage={onRemoveDreamImage}
          isDreamBoardSaving={isDreamBoardSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          errorMessage={dreamBoardErrorMessage}
          categories={categories}
        />
      </div>

      {/* Quick Access Mini Vision Board */}
      <div data-tour="dream-board-quick-vision">
        <QuickVision
          dreams={dreams}
          expandedMiniBoard={expandedMiniBoard}
          toggleMiniBoard={toggleMiniBoard}
          updateDreamProgress={updateDreamProgress}
        />
      </div>

      <div>
        {/* Dream Categories Dashboard */}
        <div data-tour="dream-board-categories">
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
        </div>

        {/* Dream Progress Component */}
        <div data-tour="dream-board-progress">
          <DreamProgress
            dreams={dreams}
            handleOpenMilestoneManager={handleOpenMilestoneManager}
            getCategoryDetails={getCategoryDetails}
            onMilestonesLoaded={handleMilestonesLoaded}
            fetchedMilestones={fetchedMilestones}
          />
        </div>
      </div>
    </>
  );
};

export default VisionBoardTab;
