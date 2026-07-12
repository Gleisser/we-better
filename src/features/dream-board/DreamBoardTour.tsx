import { GuidedTour, type GuidedTourStep } from '@/features/dashboard/DashboardTour';
import { useDreamBoardTranslation } from '@/shared/hooks/useTranslation';

const DREAM_BOARD_TOUR_STEPS: GuidedTourStep[] = [
  { id: 'welcome' },
  { id: 'start', selector: '[data-tour="dream-board-empty"], [data-tour="dream-board-gallery"]' },
  { id: 'tabs', selector: '[data-tour="dream-board-tabs"]' },
  { id: 'quickVision', selector: '[data-tour="dream-board-quick-vision"]' },
  { id: 'categories', selector: '[data-tour="dream-board-categories"]' },
  { id: 'progress', selector: '[data-tour="dream-board-progress"]' },
  { id: 'tools', selector: '[data-tour="dream-board-tools"]' },
  { id: 'finish' },
];

const DreamBoardTour = (): JSX.Element => {
  const { t } = useDreamBoardTranslation();

  return (
    <GuidedTour
      tourId="dream-board"
      steps={DREAM_BOARD_TOUR_STEPS}
      t={t}
      translationPrefix="guidedTour"
    />
  );
};

export default DreamBoardTour;
