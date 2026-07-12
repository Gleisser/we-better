import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPendingOnboardingSignup,
  deriveOnboardingState,
  markOnboardingCompletedLocally,
  markPendingOnboardingSignup,
  markOnboardingSkippedLocally,
} from './onboardingStateStore';

describe('onboardingStateStore', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T12:00:00.000Z'));
  });

  it('requires onboarding when a pending signup email matches the confirmed user', () => {
    markPendingOnboardingSignup('new-user@example.com');

    expect(
      deriveOnboardingState({
        id: 'user-1',
        email: 'new-user@example.com',
      })
    ).toEqual({
      required: true,
      skippedAt: null,
      completedAt: null,
    });
  });

  it('requires onboarding for a newly created account on first sign in without a backend payload', () => {
    expect(
      deriveOnboardingState({
        id: 'user-2',
        email: 'fresh-user@example.com',
        createdAt: '2026-04-16T11:59:00.000Z',
        lastSignInAt: '2026-04-16T11:59:30.000Z',
      })
    ).toEqual({
      required: true,
      skippedAt: null,
      completedAt: null,
    });
  });

  it('remembers a local skip state when the backend onboarding endpoint is unavailable', () => {
    markPendingOnboardingSignup('skip-user@example.com');
    markOnboardingSkippedLocally({
      id: 'user-3',
      email: 'skip-user@example.com',
    });

    expect(
      deriveOnboardingState({
        id: 'user-3',
        email: 'skip-user@example.com',
      })
    ).toEqual({
      required: true,
      skippedAt: '2026-04-16T12:00:00.000Z',
      completedAt: null,
    });

    expect(
      deriveOnboardingState({
        id: 'user-3',
        email: 'skip-user@example.com',
      })?.completedAt
    ).toBeNull();
  });

  it('remembers a local completion state when the backend onboarding endpoint is unavailable', () => {
    markPendingOnboardingSignup('complete-user@example.com');
    markOnboardingCompletedLocally({
      id: 'user-4',
      email: 'complete-user@example.com',
    });

    expect(
      deriveOnboardingState({
        id: 'user-4',
        email: 'complete-user@example.com',
      })
    ).toEqual({
      required: false,
      skippedAt: null,
      completedAt: '2026-04-16T12:00:00.000Z',
    });
  });

  it('clears a consumed pending signup marker after completion', () => {
    markPendingOnboardingSignup('clear-user@example.com');
    markOnboardingCompletedLocally({
      id: 'user-5',
      email: 'clear-user@example.com',
    });

    clearPendingOnboardingSignup();

    expect(
      deriveOnboardingState({
        id: 'user-6',
        email: 'clear-user@example.com',
      })
    ).toBeNull();
  });
});
