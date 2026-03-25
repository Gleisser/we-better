import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardGrid from './DashboardGrid';
import styles from './DashboardGrid.module.css';

const mockUseDeferredSectionQuery = vi.fn();
const mockUseIdleActivation = vi.fn();

vi.mock('@/shared/hooks/utils/useDeferredSectionQuery', () => ({
  useDeferredSectionQuery: (...args: unknown[]) => mockUseDeferredSectionQuery(...args),
}));

vi.mock('@/shared/hooks/utils/useIdleActivation', () => ({
  useIdleActivation: (...args: unknown[]) => mockUseIdleActivation(...args),
}));

vi.mock('@/shared/components/widgets/QuoteWidget/QuoteWidget', () => ({
  default: () => <div data-testid="mock-quote-widget" />,
}));

vi.mock('@/shared/components/widgets/HabitsWidget/HabitsWidget', () => ({
  default: () => <div data-testid="mock-habits-widget" />,
}));

vi.mock('@/shared/components/widgets/GoalsWidget/GoalsWidget', () => ({
  default: () => <div data-testid="mock-goals-widget" />,
}));

vi.mock('@/shared/components/widgets/CardsWidget/CardsWidget', () => ({
  default: () => <div data-testid="mock-cards-widget" />,
}));

vi.mock('@/shared/components/widgets/RadialLifeChartWidget/RadialLifeChartWidget', () => ({
  default: () => <div data-testid="mock-radial-widget" />,
}));

vi.mock('@/shared/components/widgets/MoodWidget/MoodWidget', () => ({
  default: () => <div data-testid="mock-mood-widget" />,
}));

vi.mock('@/shared/components/widgets/DreamBoardTimelineWidget', () => ({
  default: () => <div data-testid="mock-dream-board-widget" />,
}));

describe('DashboardGrid', () => {
  beforeEach(() => {
    mockUseDeferredSectionQuery.mockReturnValue(true);
    mockUseIdleActivation.mockReturnValue(false);
  });

  it('renders the first dashboard row immediately while lower widgets remain deferred', async () => {
    mockUseDeferredSectionQuery.mockReturnValue(false);

    render(<DashboardGrid />);

    expect(await screen.findByTestId('mock-quote-widget')).not.toBeNull();
    expect(await screen.findByTestId('mock-cards-widget')).not.toBeNull();
    expect(await screen.findByTestId('mock-radial-widget')).not.toBeNull();

    expect(screen.queryByTestId('mock-mood-widget')).toBeNull();
    expect(screen.queryByTestId('mock-dream-board-widget')).toBeNull();
    expect(screen.queryByTestId('mock-habits-widget')).toBeNull();
    expect(screen.queryByTestId('mock-goals-widget')).toBeNull();

    expect(screen.getByTestId('mood-slot').getAttribute('data-dashboard-state')).toBe('deferred');
    expect(screen.getByTestId('dreamBoard-slot').getAttribute('data-dashboard-state')).toBe(
      'deferred'
    );
  });

  it('keeps optional lower widgets deferred until the dashboard is unlocked', async () => {
    render(<DashboardGrid />);

    expect(await screen.findByTestId('mock-mood-widget')).not.toBeNull();
    expect(screen.queryByTestId('mock-dream-board-widget')).toBeNull();
    expect(screen.queryByTestId('mock-habits-widget')).toBeNull();
    expect(screen.queryByTestId('mock-goals-widget')).toBeNull();

    expect(screen.getByTestId('dreamBoard-slot').getAttribute('data-dashboard-state')).toBe(
      'deferred'
    );
    expect(screen.getByTestId('habits-slot').getAttribute('data-dashboard-state')).toBe('deferred');
    expect(screen.getByTestId('goals-slot').getAttribute('data-dashboard-state')).toBe('deferred');
  });

  it('renders Dream Board widget after Mood widget once optional widgets are unlocked', async () => {
    mockUseIdleActivation.mockReturnValue(true);

    render(<DashboardGrid />);

    const moodWidget = await screen.findByTestId('mock-mood-widget');
    const dreamBoardWidget = await screen.findByTestId('mock-dream-board-widget');

    expect(
      Boolean(
        moodWidget.compareDocumentPosition(dreamBoardWidget) & Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);

    const dreamBoardWrapper = dreamBoardWidget.parentElement;
    expect(dreamBoardWrapper).not.toBeNull();
    expect(dreamBoardWrapper?.className).toContain(styles.dreamBoard);
  });
});
