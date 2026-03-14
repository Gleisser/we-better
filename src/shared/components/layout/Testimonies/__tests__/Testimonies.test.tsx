import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Testimonies from '../Testimonies';
import { useTestimony } from '@/shared/hooks/useTestimony';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';

vi.mock('@/shared/hooks/useTestimony', () => ({
  useTestimony: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

const mockedUseTestimony = vi.mocked(useTestimony);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

describe('Testimonies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseTestimony.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useTestimony>);
    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
    } as ReturnType<typeof useErrorHandler>);
  });

  it('renders testimonial avatars with lazy loading and responsive sources', () => {
    render(<Testimonies />);

    const avatars = screen.getAllByRole('img');
    expect(avatars.length).toBeGreaterThan(0);
    avatars.forEach(avatar => {
      expect(avatar).toHaveAttribute('loading', 'lazy');
      expect(avatar.getAttribute('src') ?? '').not.toContain('.gif');
    });
  });
});
