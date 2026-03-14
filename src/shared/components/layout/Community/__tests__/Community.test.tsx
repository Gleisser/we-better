import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Community from '../Community';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';

vi.mock('@/shared/hooks/useCommunity', () => ({
  useCommunity: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

const mockedUseCommunity = vi.mocked(useCommunity);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

describe('Community', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseCommunity.mockReturnValue({
      data: {
        data: {
          title: 'Community of achievers',
          label: '#1 Self Improvement Community',
          buttonText: 'Join Now',
        },
      },
      isLoading: false,
    } as ReturnType<typeof useCommunity>);
    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
    } as ReturnType<typeof useErrorHandler>);
  });

  it('renders community profiles with native lazy loading', () => {
    const { container } = render(<Community />);

    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(6);
    images.forEach(image => {
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image.getAttribute('src') ?? '').toContain('/assets/images/community/');
      expect(image.getAttribute('src') ?? '').not.toContain('.gif');
    });
  });
});
