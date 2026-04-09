import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CtaButton from './CtaButton';

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('CtaButton', () => {
  it('routes new users to auth signup from hero primary CTA', () => {
    render(
      <MemoryRouter>
        <CtaButton text="Join the Movement" />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /join the movement/i }).getAttribute('href')).toBe(
      '/auth/signup'
    );
  });
});
