import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MobileMenu from '../MobileMenu';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('MobileMenu', () => {
  it('maps business, mentors, and coaches links to live landing section targets', () => {
    render(<MobileMenu isOpen />);

    expect(screen.getByRole('link', { name: /for business/i }).getAttribute('href')).toBe(
      '#features-title'
    );
    expect(screen.getByRole('link', { name: /for mentors/i }).getAttribute('href')).toBe(
      '#community-title'
    );
    expect(screen.getByRole('link', { name: /for coaches/i }).getAttribute('href')).toBe(
      '#prefooter-title'
    );
  });
});
