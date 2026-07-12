import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardTour, { GuidedTour } from './DashboardTour';

vi.mock('@/shared/components/common/Portal/Portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-42' } }),
}));

vi.mock('@/shared/hooks/useTranslation', () => ({
  useDashboardTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      key === 'tour.progress' ? `${options?.current} of ${options?.total}` : key,
  }),
}));

describe('DashboardTour', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('opens automatically only when this user has not completed the guide', () => {
    const { unmount } = render(<DashboardTour />);

    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => vi.advanceTimersByTime(650));
    expect(screen.getByRole('dialog')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'tour.close' }));
    expect(localStorage.getItem('we-better:dashboard-tour:v1:user-42')).toBe('completed');
    unmount();

    render(<DashboardTour />);
    act(() => vi.advanceTimersByTime(650));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('can be reopened manually and lets the user skip a step', () => {
    localStorage.setItem('we-better:dashboard-tour:v1:user-42', 'completed');
    render(<DashboardTour />);

    fireEvent.click(screen.getByRole('button', { name: 'tour.launch' }));
    expect(screen.getByText('tour.steps.welcome.title')).not.toBeNull();
    expect(screen.getByText('1 of 10')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'tour.skipStep' }));
    expect(screen.getByText('tour.steps.navigation.title')).not.toBeNull();
    expect(screen.getByText('2 of 10')).not.toBeNull();
  });

  it('supports keyboard navigation and escape to stop', () => {
    render(<DashboardTour />);
    act(() => vi.advanceTimersByTime(650));

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('tour.steps.navigation.title')).not.toBeNull();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps completion independent for every guided page', () => {
    const translate = (key: string, options?: Record<string, unknown>): string =>
      key === 'guide.progress' ? `${options?.current} of ${options?.total}` : key;

    render(
      <GuidedTour
        tourId="dream-board"
        steps={[{ id: 'welcome' }, { id: 'finish' }]}
        t={translate}
        translationPrefix="guide"
      />
    );
    act(() => vi.advanceTimersByTime(650));

    fireEvent.click(screen.getByRole('button', { name: 'guide.close' }));
    expect(localStorage.getItem('we-better:dream-board-tour:v1:user-42')).toBe('completed');
    expect(localStorage.getItem('we-better:dashboard-tour:v1:user-42')).toBeNull();
  });

  it('constrains a positioned card to the remaining viewport height', () => {
    localStorage.setItem('we-better:missions-tour:v1:user-42', 'completed');
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 2048 });
    const target = document.createElement('div');
    target.dataset.tour = 'mission-filters';
    target.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 52,
      bottom: 140,
      left: 80,
      right: 2020,
      width: 1940,
      height: 88,
    });
    document.body.appendChild(target);

    render(
      <GuidedTour
        tourId="missions"
        steps={[{ id: 'filters', selector: '[data-tour="mission-filters"]' }]}
        t={key => key}
        translationPrefix="guide"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'guide.launch' }));

    expect(screen.getByRole('dialog').style.maxHeight).toBe('590px');
    target.remove();
  });
});
