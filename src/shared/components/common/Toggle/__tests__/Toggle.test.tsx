import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Toggle from '../Toggle';
import styles from '../Toggle.module.css';

vi.mock('framer-motion', () => {
  const createMotionTag =
    (tag: string) =>
    ({
      children,
      whileTap: _whileTap,
      animate: _animate,
      initial: _initial,
      exit: _exit,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) =>
      React.createElement(tag, props, children);

  const motionProxy = new Proxy(
    {},
    {
      get: (_, tag: string) => createMotionTag(tag),
    }
  );

  return {
    motion: motionProxy,
  };
});

describe('Toggle', () => {
  it('merges the wrapper className and applies state classes to the button', () => {
    const onChange = vi.fn();

    render(
      <Toggle
        enabled
        onChange={onChange}
        size="large"
        disabled
        className="custom-toggle-wrapper"
        label="Email alerts"
      />
    );

    const toggle = screen.getByRole('switch', { name: 'Email alerts' });

    expect(toggle.parentElement?.className).toContain(styles.toggleContainer);
    expect(toggle.parentElement?.className).toContain('custom-toggle-wrapper');
    expect(toggle.className).toContain(styles.toggle);
    expect(toggle.className).toContain(styles.large);
    expect(toggle.className).toContain(styles.enabled);
    expect(toggle.className).toContain(styles.disabledState);
  });

  it('triggers onChange from click and keyboard interaction when enabled', () => {
    const onChange = vi.fn();

    render(<Toggle enabled={false} onChange={onChange} aria-label="Example toggle" />);

    const toggle = screen.getByRole('switch', { name: 'Example toggle' });

    fireEvent.click(toggle);
    fireEvent.keyDown(toggle, { key: 'Enter' });
    fireEvent.keyDown(toggle, { key: ' ' });

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, true);
    expect(onChange).toHaveBeenNthCalledWith(3, true);
  });
});
