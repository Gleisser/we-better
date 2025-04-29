import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { useMenu } from '@/shared/hooks/useMenu';
import { HEADER_CONSTANTS, MEGA_MENU_CONFIG } from '@/constants/fallback/header';
import styles from '../Header.module.css';

// Mock the hooks
vi.mock('@/hooks/useMenu', () => ({
  useMenu: vi.fn()
}));

// Mock framer-motion with AnimatePresence
vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  useScroll: () => ({ 
    scrollY: { 
      get: () => 0,
      on: () => () => {} 
    } 
  }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimate: () => [null, () => {}]
}));

// Mock menu components
vi.mock('../MobileMenu', () => ({
  default: ({ isOpen }: any) => isOpen ? <div role="dialog">Mobile Menu Content</div> : null
}));

vi.mock('../MegaMenu', () => ({
  default: ({ isOpen }: any) => isOpen ? <div>Mega Menu Content</div> : null
}));

vi.mock('../SolutionsMegaMenu', () => ({
  default: ({ isOpen }: any) => isOpen ? <div>Solutions Menu Content</div> : null
}));

vi.mock('../ResourcesMegaMenu', () => ({
  default: ({ isOpen }: any) => isOpen ? <div>Resources Menu Content</div> : null
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with fallback data when API data is not available', () => {
    // Mock menu data with null to trigger fallback
    (useMenu as any).mockReturnValue({
      data: null
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Check logo and navigation
    expect(screen.getByRole('link', { name: /We Better Home/i })).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /We Better/i })).toHaveLength(2);
    expect(screen.getByRole('navigation', { name: /Main menu/i })).toBeInTheDocument();

    // Check fallback menu items
    MEGA_MENU_CONFIG.forEach(item => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });

    // Check hamburger menu button in mobile controls
    const mobileControls = screen.getByLabelText('Mobile navigation controls');
    expect(mobileControls).toBeInTheDocument();
    expect(mobileControls.querySelector('button')).toBeInTheDocument();

    // Check CTA button
    const ctaButton = screen.getByRole('link', { name: HEADER_CONSTANTS.Cta.title });
    expect(ctaButton).toBeInTheDocument();
  });

  it('handles menu interactions correctly', () => {
    (useMenu as any).mockReturnValue({
      data: null
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Test mobile menu toggle
    const mobileControls = screen.getByLabelText('Mobile navigation controls');
    const menuButton = mobileControls.querySelector('button');
    fireEvent.click(menuButton!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Test mega menu hover interactions
    MEGA_MENU_CONFIG.forEach(item => {
      const menuItem = screen.getByText(item.title);
      expect(menuItem).toBeInTheDocument();
      
      fireEvent.mouseEnter(menuItem);
      fireEvent.mouseLeave(menuItem);
    });
  });
}); 