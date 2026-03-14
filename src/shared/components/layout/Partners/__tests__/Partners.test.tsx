import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Partners from '../Partners';
import { usePartner } from '@/shared/hooks/usePartner';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';

vi.mock('@/shared/hooks/usePartner', () => ({
  usePartner: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

const mockedUsePartner = vi.mocked(usePartner);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

describe('Partners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUsePartner.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof usePartner>);
    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
    } as ReturnType<typeof useErrorHandler>);
  });

  it('renders partner logos with lazy loading', () => {
    render(<Partners />);

    const logos = screen.getAllByRole('img');
    expect(logos.length).toBeGreaterThan(0);
    logos.forEach(logo => {
      expect(logo).toHaveAttribute('loading', 'lazy');
    });
  });
});
