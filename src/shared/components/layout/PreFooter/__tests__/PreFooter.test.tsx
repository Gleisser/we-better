import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PreFooter from '../PreFooter';
import { usePrefooter } from '@/shared/hooks/usePrefooter';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';

vi.mock('@/shared/hooks/usePrefooter', () => ({
  usePrefooter: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

const mockedUsePrefooter = vi.mocked(usePrefooter);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

describe('PreFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUsePrefooter.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof usePrefooter>);
    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
    } as ReturnType<typeof useErrorHandler>);
  });

  it('renders a responsive lazy-loaded preview image', () => {
    render(<PreFooter />);

    const image = screen.getByRole('img', {
      name: /interactive preview of we better platform/i,
    });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image.getAttribute('src') ?? '').not.toContain('.gif');
  });
});
