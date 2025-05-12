import React from 'react';
import { Dream } from '../../types';
import styles from '../../DreamBoardPage.module.css';
import DreamCategories from '../DreamCategories';
import DreamProgress from '../DreamProgress';
import QuickVision from '../QuickVision';

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
  openDreamBoardModal: () => void;
  getCategoryDetails: (category: string) => CategoryDetails;
  calculateCategoryProgress: (category: string) => number;
  hoveredCategory: string | null;
  setHoveredCategory: (category: string | null) => void;
  expandedCategory: string | null;
  toggleCategoryExpand: (category: string) => void;
  filterCategory: string | null;
  setFilterCategory: (category: string | null) => void;
  categories: string[];
}

const VisionBoardTab: React.FC<VisionBoardTabProps> = ({
  dreams,
  expandedMiniBoard,
  toggleMiniBoard,
  updateDreamProgress,
  handleOpenMilestoneManager,
  openDreamBoardModal,
  getCategoryDetails,
  calculateCategoryProgress,
  hoveredCategory,
  setHoveredCategory,
  expandedCategory,
  toggleCategoryExpand,
  filterCategory,
  setFilterCategory,
  categories,
}) => {
  return (
    <>
      {/* Quick Access Mini Vision Board */}
      <QuickVision
        dreams={dreams}
        expandedMiniBoard={expandedMiniBoard}
        toggleMiniBoard={toggleMiniBoard}
        updateDreamProgress={updateDreamProgress}
        openDreamBoardModal={openDreamBoardModal}
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
        />
      </div>
    </>
  );
};

export default VisionBoardTab;
