import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Features from '../Features';
import { useFeature } from '@/shared/hooks/useFeature';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';

vi.mock('@/shared/hooks/useFeature', () => ({
  useFeature: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

const mockedUseFeature = vi.mocked(useFeature);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

describe('Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseFeature.mockReturnValue({
      data: {
        data: {
          cards: [
            { id: 1, title: 'Track goals', description: 'Stay aligned', icon: { name: 'goal' } },
          ],
          brands: [],
          subtext: 'As featured in',
        },
      },
      isLoading: false,
    } as ReturnType<typeof useFeature>);
    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
    } as ReturnType<typeof useErrorHandler>);
  });

  it('renders featured brand logos with native lazy loading', () => {
    render(<Features />);

    const logos = screen.getAllByRole('img');
    expect(logos.length).toBeGreaterThan(0);
    logos.forEach(logo => {
      expect(logo).toHaveAttribute('loading', 'lazy');
    });
  });
});
