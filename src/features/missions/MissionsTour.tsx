import { GuidedTour, type GuidedTourStep } from '@/features/dashboard/DashboardTour';
import { useMissionsTranslation } from '@/shared/hooks/useTranslation';

const MISSIONS_TOUR_STEPS: GuidedTourStep[] = [
  { id: 'welcome' },
  { id: 'categories', selector: '[data-tour="mission-categories"]' },
  { id: 'weeklyFocus', selector: '[data-tour="mission-weekly-focus"]' },
  { id: 'filters', selector: '[data-tour="mission-filters"]' },
  { id: 'cards', selector: '[data-tour="mission-cards"]' },
  { id: 'action', selector: '[data-tour="mission-card-action"]' },
  { id: 'finish' },
];

const MissionsTour = (): JSX.Element => {
  const { t } = useMissionsTranslation();

  return (
    <GuidedTour
      tourId="missions"
      steps={MISSIONS_TOUR_STEPS}
      t={t}
      translationPrefix="guidedTour"
    />
  );
};

export default MissionsTour;
