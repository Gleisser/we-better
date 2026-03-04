import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DashboardGrid from './DashboardGrid';
import styles from './DashboardGrid.module.css';

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

vi.mock('../../widgets/RadialLifeChartWidget/RadialLifeChartWidget', () => ({
  default: () => <div data-testid="mock-radial-widget" />,
}));

vi.mock('../../widgets/MoodWidget/MoodWidget', () => ({
  default: () => <div data-testid="mock-mood-widget" />,
}));

vi.mock('../../widgets/DreamBoardTimelineWidget', () => ({
  default: () => <div data-testid="mock-dream-board-widget" />,
}));

describe('DashboardGrid', () => {
  it('renders Dream Board widget after Mood widget and applies dreamBoard grid class', () => {
    render(<DashboardGrid featuredArticle={null} isLoading={false} />);

    const moodWidget = screen.getByTestId('mock-mood-widget');
    const dreamBoardWidget = screen.getByTestId('mock-dream-board-widget');

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
