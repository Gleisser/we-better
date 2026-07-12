import { GuidedTour, type GuidedTourStep } from '@/features/dashboard/DashboardTour';
import { useLifeWheelTranslation } from '@/shared/hooks/useTranslation';

const LIFE_WHEEL_TOUR_STEPS: GuidedTourStep[] = [
  { id: 'welcome' },
  { id: 'tabs', selector: '[data-tour="life-wheel-tabs"]' },
  { id: 'chart', selector: '[data-tour="life-wheel-chart"]' },
  { id: 'scores', selector: '[data-tour="life-wheel-scores"]' },
  { id: 'save', selector: '[data-tour="life-wheel-save"]' },
  { id: 'history', selector: '[data-tour="life-wheel-history-tab"]' },
  { id: 'insights', selector: '[data-tour="life-wheel-insights-tab"]' },
  { id: 'finish' },
];

const LifeWheelTour = (): JSX.Element => {
  const { t } = useLifeWheelTranslation();

  return (
    <GuidedTour
      tourId="life-wheel"
      steps={LIFE_WHEEL_TOUR_STEPS}
      t={t}
      translationPrefix="guidedTour"
    />
  );
};

export default LifeWheelTour;
