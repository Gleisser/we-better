import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DreamBoardPage from '../DreamBoardPage';
import { DreamBoardContentType, DreamBoardData } from '../types';
import { getDreamBoardOverview, getLatestDreamBoardData } from '../api/dreamBoardApi';
import { getMilestonesForContents } from '../services/milestonesService';

const mockGetProgressForDream = vi.fn(async () => undefined);
const mockUpdateProgressBackend = vi.fn(async () => 0.4);
const mockDreamChallengeContainer = vi.fn(() => <div data-testid="dream-challenge" />);

vi.mock('@/shared/hooks/useTranslation', () => ({
  useDreamBoardTranslation: () => ({
    t: (key: string): string => key,
  }),
  useCommonTranslation: () => ({
    t: (key: string): string => key,
  }),
}));

vi.mock('../api/dreamBoardApi', () => ({
  getDreamBoardOverview: vi.fn(),
  getLatestDreamBoardData: vi.fn(),
  saveDreamBoardData: vi.fn(),
}));

vi.mock('../services/milestonesService', () => ({
  getMilestonesForContents: vi.fn(async () => ({})),
  createMilestoneForContent: vi.fn(),
  updateMilestoneForContent: vi.fn(),
  deleteMilestoneForContent: vi.fn(),
  toggleMilestoneCompletionForContent: vi.fn(),
}));

vi.mock('../hooks/useDreamProgress', () => ({
  useDreamProgress: () => ({
    updateDreamProgress: mockUpdateProgressBackend,
    getProgressForDream: mockGetProgressForDream,
    loading: false,
    error: null,
  }),
}));

vi.mock('../components/DreamBoardTimelineGallery', () => ({
  DreamBoardTimelineGallery: () => <div data-testid="timeline-gallery" />,
}));

vi.mock('../components/DreamInsights', () => ({
  default: () => <div data-testid="dream-insights" />,
}));

vi.mock('../components/FooterTools', () => ({
  default: () => <div data-testid="footer-tools" />,
}));

vi.mock('../components/MilestonesPopup', () => ({
  default: () => null,
}));

vi.mock('../components/DreamChallenge', () => ({
  DreamChallengeContainer: (props: unknown) => mockDreamChallengeContainer(props),
}));

vi.mock('../components/CosmicDreamExperience/CosmicDreamExperience', () => ({
  CosmicDreamExperience: () => <div data-testid="dream-experience" />,
}));

const mockedGetDreamBoardOverview = vi.mocked(getDreamBoardOverview);
const mockedGetLatestDreamBoardData = vi.mocked(getLatestDreamBoardData);
const mockedGetMilestonesForContents = vi.mocked(getMilestonesForContents);

const createDreamBoardData = (): DreamBoardData => ({
  id: 'board-1',
  title: 'My Dream Board',
  description: 'Visualize • Believe • Achieve',
  categories: ['Career'],
  content: [
    {
      id: 'dream-1',
      type: DreamBoardContentType.IMAGE,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
      rotation: 0,
      categoryId: 'Career',
      src: 'data:image/png;base64,mock-image',
      alt: 'Dream 1',
      caption: 'Dream 1',
    },
  ],
});

describe('DreamBoardPage bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedGetDreamBoardOverview.mockResolvedValue({
      board: createDreamBoardData(),
      progressByContentId: {
        'dream-1': 0.4,
      },
      milestonesByContentId: {
        'dream-1': [
          {
            id: 'milestone-1',
            title: 'First milestone',
            completed: false,
          },
        ],
      },
      weather: {
        overall: 'cloudy',
        categoryStatus: {},
        message: 'Weather snapshot',
        calculatedAt: '2026-03-25T10:00:00.000Z',
      },
      challenges: {
        activeChallenges: [
          {
            id: 'challenge-1',
            user_id: 'user-1',
            dream_id: 'dream-1',
            title: '30 day focus',
            description: 'Keep going',
            duration: 30,
            frequency: 'daily',
            selected_days: [],
            difficulty_level: 'medium',
            enable_reminders: false,
            reminder_time: null,
            start_date: '2026-03-01T00:00:00.000Z',
            current_day: 2,
            completed: false,
            created_at: '2026-03-01T00:00:00.000Z',
            updated_at: '2026-03-01T00:00:00.000Z',
          },
        ],
        completedChallenges: [],
        latestChallengeCompletionById: {
          'challenge-1': '2026-03-25T09:00:00.000Z',
        },
      },
    });
  });

  it('hydrates from the overview payload without legacy or per-dream bootstrap reads', async () => {
    render(<DreamBoardPage />);

    await screen.findByText('dreamBoard.quickVision.title');

    expect(mockedGetDreamBoardOverview).toHaveBeenCalledTimes(1);
    expect(mockedGetLatestDreamBoardData).not.toHaveBeenCalled();
    expect(mockGetProgressForDream).not.toHaveBeenCalled();
    expect(mockedGetMilestonesForContents).not.toHaveBeenCalled();
    expect(screen.getAllByText('40%').length).toBeGreaterThan(0);

    const latestDreamChallengeProps = mockDreamChallengeContainer.mock.lastCall?.[0] as
      | {
          initialChallengeData?: {
            activeChallenges: Array<{ id: string }>;
            completedChallenges: Array<{ id: string }>;
          };
        }
      | undefined;

    expect(latestDreamChallengeProps?.initialChallengeData?.activeChallenges).toHaveLength(1);
    expect(latestDreamChallengeProps?.initialChallengeData?.activeChallenges[0]?.id).toBe(
      'challenge-1'
    );
  });
});
