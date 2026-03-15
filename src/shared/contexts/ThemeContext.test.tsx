import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from './ThemeContext';
import { useUserPreferences } from '@/shared/hooks/useUserPreferences';

vi.mock('@/shared/hooks/useUserPreferences', () => ({
  useUserPreferences: vi.fn(),
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it('initializes from local storage without loading backend preferences', async () => {
    localStorage.setItem('theme-mode', 'light');
    localStorage.setItem('time-based-theme', 'false');

    render(
      <ThemeProvider>
        <div>theme-child</div>
      </ThemeProvider>
    );

    expect(await screen.findByText('theme-child')).not.toBeNull();
    expect(vi.mocked(useUserPreferences)).not.toHaveBeenCalled();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
