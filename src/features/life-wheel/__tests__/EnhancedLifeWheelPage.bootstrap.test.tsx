import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EnhancedLifeWheelPage from '../EnhancedLifeWheelPage';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  getLifeWheelHistory,
  getLifeWheelOverview,
  getLatestLifeWheelData,
  getTodaysLifeWheelData,
} from '@/features/life-wheel/api/lifeWheelApi';
import type { LifeCategory } from '../types';

const apiMocks = vi.hoisted(() => ({
  getLifeWheelOverview: vi.fn(),
  getLatestLifeWheelData: vi.fn(),
  getTodaysLifeWheelData: vi.fn(),
  getLifeWheelHistory: vi.fn(),
}));

const translationMocks = vi.hoisted(() => {
  const translations: Record<string, string> = {
    'widgets.lifeWheel.assessment': 'Life Wheel Assessment',
    'widgets.lifeWheel.loading': 'Loading',
    'widgets.lifeWheel.tabs.current': 'Current Assessment',
    'widgets.lifeWheel.tabs.history': 'History',
    'widgets.lifeWheel.tabs.insights': 'Insights',
    'widgets.lifeWheel.actions.saveAssessment': 'Save assessment',
    'widgets.lifeWheel.actions.updateAssessment': 'Update assessment',
    'widgets.lifeWheel.actions.saving': 'Saving',
    'widgets.lifeWheel.actions.saveSuccess': 'Saved successfully',
    'widgets.lifeWheel.errors.failedToLoad': 'Failed to load',
    'widgets.lifeWheel.errors.somethingWentWrong': 'Something went wrong',
    'widgets.lifeWheel.errors.tryAgain': 'Try again',
    'widgets.lifeWheel.history.title': 'History',
    'widgets.lifeWheel.history.loadingHistory': 'Loading history',
    'widgets.lifeWheel.history.noHistoryYet': 'No history yet',
    'widgets.lifeWheel.history.compare': 'Compare',
    'widgets.lifeWheel.categories.career': 'Career',
    'widgets.lifeWheel.categories.health': 'Health',
    'widgets.lifeWheel.categories.finances': 'Finances',
    'widgets.lifeWheel.categories.relationships': 'Relationships',
    'widgets.lifeWheel.categories.personalGrowth': 'Personal Growth',
    'widgets.lifeWheel.categories.recreation': 'Recreation',
    'widgets.lifeWheel.categories.spiritual': 'Spiritual',
    'widgets.lifeWheel.categories.community': 'Community',
    'widgets.lifeWheel.categoryDescriptions.career': 'Career description',
    'widgets.lifeWheel.categoryDescriptions.health': 'Health description',
    'widgets.lifeWheel.categoryDescriptions.finances': 'Finances description',
    'widgets.lifeWheel.categoryDescriptions.relationships': 'Relationships description',
    'widgets.lifeWheel.categoryDescriptions.personalGrowth': 'Personal growth description',
    'widgets.lifeWheel.categoryDescriptions.recreation': 'Recreation description',
    'widgets.lifeWheel.categoryDescriptions.spiritual': 'Spiritual description',
    'widgets.lifeWheel.categoryDescriptions.community': 'Community description',
  };

  return {
    t: (key: string): string => translations[key] ?? key,
  };
});

vi.mock('@/features/life-wheel/api/lifeWheelApi', () => apiMocks);

vi.mock('framer-motion', () => {
  const createMotionTag =
    (tag: string) =>
    ({
      children,
      animate: _animate,
      initial: _initial,
      exit: _exit,
      transition: _transition,
      whileHover: _whileHover,
      whileTap: _whileTap,
      layout: _layout,
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
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('../components/RadarChart/EnhancedRadarChart', () => ({
  default: () => <div data-testid="radar-chart" />,
}));

vi.mock('@/shared/hooks/useTranslation', () => ({
  useLifeWheelTranslation: () => ({
    currentLanguage: 'en',
    t: translationMocks.t,
  }),
}));

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedGetLifeWheelOverview = vi.mocked(getLifeWheelOverview);
const mockedGetLatestLifeWheelData = vi.mocked(getLatestLifeWheelData);
const mockedGetTodaysLifeWheelData = vi.mocked(getTodaysLifeWheelData);
const mockedGetLifeWheelHistory = vi.mocked(getLifeWheelHistory);

const createCategories = (): LifeCategory[] => [
  {
    id: 'career',
    name: 'Career',
    description: 'Career description',
    icon: '💼',
    color: '#000000',
    gradient: 'linear-gradient(#000000, #111111)',
    value: 8,
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Health description',
    icon: '💪',
    color: '#000000',
    gradient: 'linear-gradient(#000000, #111111)',
    value: 6,
  },
  {
    id: 'finances',
    name: 'Finances',
    description: 'Finances description',
    icon: '💰',
    color: '#000000',
    gradient: 'linear-gradient(#000000, #111111)',
    value: 9,
  },
  {
    id: 'relationships',
    name: 'Relationships',
    description: 'Relationships description',
    icon: '❤️',
    color: '#000000',
    gradient: 'linear-gradient(#000000, #111111)',
    value: 7,
  },
  {
    id: 'personal_growth',
    name: 'Personal Growth',
    description: 'Personal growth description',
    icon: '🌱',
    color: '#000000',
    gradient: 'linear-gradient(#000000, #111111)',
    value: 7,
  },
  {
    id: 'recreation',
    name: 'Recreation',
    description: 'Recreation description',
    icon: '🎮',
    color: '#000000',
    gradient: 'linear-gradient(#000000, #111111)',
    value: 9,
  },
  {
    id: 'spiritual',
    name: 'Spiritual',
    description: 'Spiritual description',
    icon: '✨',
    color: '#000000',
    gradient: 'linear-gradient(#000000, #111111)',
    value: 5,
  },
  {
    id: 'community',
    name: 'Community',
    description: 'Community description',
    icon: '🌍',
    color: '#000000',
    gradient: 'linear-gradient(#000000, #111111)',
    value: 4,
  },
];

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('EnhancedLifeWheelPage bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    mockedGetLifeWheelOverview.mockResolvedValue({
      success: true,
      hasEntryToday: false,
      currentEntry: {
        id: 'entry-1',
        date: '2026-03-25T10:00:00.000Z',
        categories: createCategories(),
      },
      history: {
        entries: [
          {
            id: 'entry-1',
            date: '2026-03-25T10:00:00.000Z',
            categories: createCategories(),
          },
        ],
        total: 1,
      },
    });
  });

  it('hydrates the route from the overview query without touching legacy bootstrap reads', async () => {
    render(<EnhancedLifeWheelPage />, { wrapper: createWrapper() });

    await screen.findByRole('button', { name: 'Save assessment' });

    expect(mockedGetLifeWheelOverview).toHaveBeenCalledTimes(1);
    expect(mockedGetLatestLifeWheelData).not.toHaveBeenCalled();
    expect(mockedGetTodaysLifeWheelData).not.toHaveBeenCalled();
    expect(mockedGetLifeWheelHistory).not.toHaveBeenCalled();
  });
});
