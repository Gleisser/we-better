import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OnboardingPage from './OnboardingPage';

const navigateMock = vi.fn();
const useAuthMock = vi.fn();
let currentLanguage = 'en';
const standardPropsRef: {
  current: Record<string, unknown> | null;
} = { current: null };

const translationMap: Record<string, Record<string, string>> = {
  en: {
    'onboarding.actions.skip': 'Skip for now',
    'onboarding.actions.retry': 'Try again',
    'onboarding.actions.continue': 'Continue setup',
    'onboarding.native.dream': 'Dream label',
    'onboarding.native.goal': 'Goal label',
    'onboarding.native.habit': 'Habit label',
  },
  pt: {
    'onboarding.actions.skip': 'Pular por agora',
    'onboarding.actions.retry': 'Tentar novamente',
    'onboarding.actions.continue': 'Continuar',
    'onboarding.native.dream': 'Sonho',
    'onboarding.native.goal': 'Meta',
    'onboarding.native.habit': 'Hábito',
  },
};

vi.mock('@typebot.io/react', () => ({
  Standard: (props: Record<string, unknown>) => {
    standardPropsRef.current = props;
    return <div data-testid="typebot-standard" />;
  },
}));

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('@/shared/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => translationMap[currentLanguage]?.[key] ?? key,
    changeLanguage: vi.fn(),
    currentLanguage,
    isLoading: false,
    isReady: true,
    i18n: { language: currentLanguage },
  }),
}));

describe('OnboardingPage', () => {
  beforeEach(() => {
    currentLanguage = 'en';
    navigateMock.mockReset();
    standardPropsRef.current = null;
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_TYPEBOT_ONBOARDING_ID', 'typebot-onboarding');
    vi.stubEnv('VITE_TYPEBOT_ONBOARDING_COMPLETION_SIGNAL', 'onboarding-complete');
    vi.stubEnv('VITE_TYPEBOT_API_HOST', 'https://typebot.io');
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as never;

    useAuthMock.mockReturnValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        display_name: 'Test User',
      },
      skipOnboarding: vi.fn().mockResolvedValue(true),
      completeOnboarding: vi.fn().mockResolvedValue(true),
    });
  });

  it('starts in the intro presentation state before the chat stage takes over', () => {
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('onboarding-page').getAttribute('data-phase')).toBe('intro');
    expect(screen.getByTestId('onboarding-hero')).not.toBeNull();
  });

  it('renders the Typebot embed with prefilled user context', () => {
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('typebot-standard')).not.toBeNull();
    expect(standardPropsRef.current).toMatchObject({
      typebot: 'typebot-onboarding',
      apiHost: 'https://typebot.io',
      prefilledVariables: {
        'User name': 'Test User',
        'User email': 'user@example.com',
      },
    });
  });

  it('renders the premium stage shell with a loading state before the embed becomes primary', () => {
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('onboarding-stage')).not.toBeNull();
    expect(screen.getByTestId('onboarding-stage-loading')).not.toBeNull();
  });

  it('shows retry and skip actions when the embed is unavailable', () => {
    vi.stubEnv('VITE_TYPEBOT_ONBOARDING_ID', '');

    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('onboarding.actions.retry')).not.toBeNull();
    expect(screen.getAllByText('onboarding.actions.skip').length).toBeGreaterThan(0);
  });

  it('dispatches intro and fallback analytics events', async () => {
    const events: string[] = [];
    const listener = ((event: CustomEvent) => {
      events.push(event.detail.eventName);
    }) as EventListener;

    window.addEventListener('we-better:onboarding-analytics', listener);
    vi.stubEnv('VITE_TYPEBOT_ONBOARDING_ID', '');

    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(events).toContain('onboarding_intro_shown');
      expect(events).toContain('onboarding_fallback_shown');
    });

    window.removeEventListener('we-better:onboarding-analytics', listener);
  });

  it('retries the embed stage without leaving the onboarding route', async () => {
    vi.stubEnv('VITE_TYPEBOT_ONBOARDING_ID', '');

    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('onboarding.actions.retry'));
    });

    expect(screen.getByTestId('onboarding-stage')).not.toBeNull();
  });

  it('marks onboarding as skipped and redirects to the dashboard', async () => {
    const user = userEvent.setup();
    const skipOnboarding = vi.fn().mockResolvedValue(true);

    useAuthMock.mockReturnValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        display_name: 'Test User',
      },
      skipOnboarding,
      completeOnboarding: vi.fn().mockResolvedValue(true),
    });

    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'onboarding.actions.skip' }));
    });

    await waitFor(() => {
      expect(skipOnboarding).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/app/dashboard', { replace: true });
    });
  });

  it('marks onboarding as completed when the configured Typebot completion signal fires', async () => {
    const completeOnboarding = vi.fn().mockResolvedValue(true);

    useAuthMock.mockReturnValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        display_name: 'Test User',
      },
      skipOnboarding: vi.fn().mockResolvedValue(true),
      completeOnboarding,
    });

    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    const callback = standardPropsRef.current?.onScriptExecutionSuccess;

    expect(typeof callback).toBe('function');

    await act(async () => {
      await callback?.('onboarding-complete');
    });

    await waitFor(() => {
      expect(completeOnboarding).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/app/dashboard', { replace: true });
    });
  });

  it('switches from the Typebot embed to native personalization when a structured payload arrives', async () => {
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    const callback = standardPropsRef.current?.onScriptExecutionSuccess as
      | ((value: unknown) => void | Promise<void>)
      | undefined;

    await act(async () => {
      await callback?.({
        signal: 'onboarding-complete',
        focusArea: 'health',
        selectedDreamKey: 'sleep-with-consistency',
        selectedDreamLabel: 'Dormir com mais consistência',
        microPreferences: ['lighter'],
        regenerationCount: 1,
        usedRegeneration: true,
      });
    });

    expect(screen.getByTestId('onboarding-personalization')).toBeInTheDocument();
    expect(screen.getByText('Dream label')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue setup' })).toBeInTheDocument();
    expect(screen.getByTestId('starter-dream-preview')).toHaveTextContent(
      'Dormir com mais consistência'
    );
    expect(screen.queryByTestId('typebot-standard')).toBeNull();
  });

  it('updates the preview when a personalization control changes', async () => {
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    const callback = standardPropsRef.current?.onScriptExecutionSuccess as
      | ((value: unknown) => void | Promise<void>)
      | undefined;

    await act(async () => {
      await callback?.({
        signal: 'onboarding-complete',
        focusArea: 'finances',
        selectedDreamKey: 'build-an-emergency-fund',
        selectedDreamLabel: 'Montar minha reserva de emergência',
        microPreferences: [],
        regenerationCount: 0,
        usedRegeneration: false,
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Focused' }));

    expect(screen.getByTestId('starter-habit-preview')).toHaveTextContent('15 minutes');
  });

  it('uses the configured completion signal for postMessage fallback handoff', async () => {
    vi.stubEnv('VITE_TYPEBOT_ONBOARDING_COMPLETION_SIGNAL', 'custom-complete');

    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            signal: 'custom-complete',
            focusArea: 'health',
            selectedDreamKey: 'sleep-with-consistency',
            selectedDreamLabel: 'Sleep more consistently',
            microPreferences: ['lighter'],
            regenerationCount: 1,
            usedRegeneration: true,
          },
        })
      );
    });

    expect(screen.getByTestId('onboarding-personalization')).toBeInTheDocument();
    expect(screen.getByTestId('starter-dream-preview')).toHaveTextContent(
      'Sleep more consistently'
    );
  });
});
