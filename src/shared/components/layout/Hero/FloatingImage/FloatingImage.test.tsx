import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import FloatingImage from './FloatingImage';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useScroll: () => ({ scrollY: {} }),
  useTransform: () => 0,
}));

describe('FloatingImage', () => {
  it('disables pointer events to avoid intercepting hero CTA clicks', () => {
    const { container } = render(
      <FloatingImage media={{ src: '/img.jpg', alt: 'Decorative floating image' }} />
    );

    const wrapper = container.querySelector('[role="presentation"]');
    expect(wrapper?.className).toContain('pointer-events-none');
  });
});
