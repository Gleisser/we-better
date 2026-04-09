import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { useMenu } from '@/shared/hooks/useMenu';
import { HEADER_CONSTANTS, MEGA_MENU_CONFIG } from '@/utils/constants/fallback/header';

vi.mock('@/shared/hooks/useMenu', () => ({
  useMenu: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useScroll: () => ({
    scrollY: {
      get: () => 0,
      on: () => () => undefined,
    },
  }),
  useMotionValueEvent: vi.fn(),
}));

vi.mock('../MobileMenu', () => ({
  default: ({ isOpen }: any) => (isOpen ? <div role="dialog">Mobile Menu Content</div> : null),
}));

vi.mock('../MegaMenu', () => ({
  default: ({ isOpen }: any) => (isOpen ? <div>Mega Menu Content</div> : null),
}));

vi.mock('../SolutionsMegaMenu', () => ({
  default: ({ isOpen }: any) => (isOpen ? <div>Solutions Menu Content</div> : null),
}));

vi.mock('../ResourcesMegaMenu', () => ({
  default: ({ isOpen }: any) => (isOpen ? <div>Resources Menu Content</div> : null),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fallback data when menu data is unavailable', () => {
    vi.mocked(useMenu).mockReturnValue({
      data: null,
    } as ReturnType<typeof useMenu>);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /We Better Home/i })).not.toBeNull();
    expect(screen.getAllByRole('img', { name: /We Better/i })).toHaveLength(2);
    expect(screen.getByRole('navigation', { name: /Main menu/i })).not.toBeNull();

    MEGA_MENU_CONFIG.forEach(item => {
      expect(screen.getByText(item.title)).not.toBeNull();
    });

    expect(screen.getByRole('button', { name: HEADER_CONSTANTS.Cta.title })).not.toBeNull();
  });

  it('renders fallback data when the menu response shape is invalid', () => {
    vi.mocked(useMenu).mockReturnValue({
      data: '<!doctype html>' as unknown,
    } as ReturnType<typeof useMenu>);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    MEGA_MENU_CONFIG.forEach(item => {
      expect(screen.getByText(item.title)).not.toBeNull();
    });

    expect(
      screen.getByRole('link', { name: HEADER_CONSTANTS.Business.title }).getAttribute('href')
    ).toBe('#features-title');
    expect(
      screen.getByRole('link', { name: HEADER_CONSTANTS.Mentors.title }).getAttribute('href')
    ).toBe('#community-title');
    expect(
      screen.getByRole('link', { name: HEADER_CONSTANTS.Coaches.title }).getAttribute('href')
    ).toBe('#prefooter-title');
  });

  it('handles mobile menu interactions correctly', () => {
    vi.mocked(useMenu).mockReturnValue({
      data: null,
    } as ReturnType<typeof useMenu>);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /toggle menu/i }));
    expect(screen.getByRole('dialog')).not.toBeNull();
  });
});
