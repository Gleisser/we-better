import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Footer from '../Footer';
import { useFooter } from '@/shared/hooks/useFooter';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';

vi.mock('@/shared/hooks/useFooter', () => ({
  useFooter: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

const mockedUseFooter = vi.mocked(useFooter);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseFooter.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useFooter>);
    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
    } as ReturnType<typeof useErrorHandler>);
  });

  it('renders footer navigation without image preload side effects', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /footer navigation/i })).toBeInTheDocument();
  });
});
