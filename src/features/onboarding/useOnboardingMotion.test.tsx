import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { useOnboardingMotion } from './useOnboardingMotion';
import type { OnboardingPhase } from './onboardingPresentation';

vi.mock('@gsap/react', () => ({
  useGSAP: (callback: (...args: unknown[]) => unknown) => {
    callback(
      {},
      (fn: (...args: unknown[]) => unknown) =>
        (...args: unknown[]) =>
          fn(...args)
    );
  },
}));

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    timeline: () => {
      const api = {
        call(callback: () => void) {
          callback();
          return api;
        },
        to() {
          return api;
        },
        kill: vi.fn(),
      };

      return api;
    },
  },
}));

const MotionHarness = ({
  onPhaseChange,
}: {
  onPhaseChange: (phase: OnboardingPhase) => void;
}): JSX.Element => {
  const rootRef = useRef<HTMLDivElement>(null);

  useOnboardingMotion(rootRef, onPhaseChange);

  return <div ref={rootRef} />;
};

describe('useOnboardingMotion', () => {
  it('jumps directly to reduced-motion-chat when prefers-reduced-motion is enabled', () => {
    const onPhaseChange = vi.fn();
    window.matchMedia = vi
      .fn()
      .mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as never;

    render(<MotionHarness onPhaseChange={onPhaseChange} />);

    expect(onPhaseChange).toHaveBeenCalledWith('reduced-motion-chat');
  });

  it('advances intro to transitioning and chat when reduced motion is not enabled', async () => {
    const onPhaseChange = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as never;

    render(<MotionHarness onPhaseChange={onPhaseChange} />);

    await waitFor(() => expect(onPhaseChange).toHaveBeenCalledWith('transitioning'));
    await waitFor(() => expect(onPhaseChange).toHaveBeenCalledWith('chat'));
  });
});
