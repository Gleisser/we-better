import { describe, expect, it } from 'vitest';
import {
  buildDreamMilestonesMap,
  buildDreamProgressMap,
  buildNodeLookups,
  computeCategoryCenters,
} from './CosmicDreamExperience.utils';
import type { Dream, Milestone } from '../../types';
import type { LatestDreamProgress } from '@/core/services/dreamProgressService';
import type { DreamMilestone } from '../../api/dreamMilestonesApi';

const createDream = (
  id: string,
  category: string,
  progress: number,
  milestones: Milestone[]
): Dream => ({
  id,
  title: `Dream ${id}`,
  description: `Description for ${id}`,
  category,
  timeframe: 'short-term',
  progress,
  createdAt: '2026-01-01T00:00:00.000Z',
  milestones,
  isShared: false,
});

describe('CosmicDreamExperience utils', () => {
  it('buildDreamProgressMap keeps fallback progress and applies latest entries for matching dreams', () => {
    const dreams = [
      createDream('dream-1', 'travel', 0.4, []),
      createDream('dream-2', 'health', 0.2, []),
    ];
    const progressEntries: LatestDreamProgress[] = [
      {
        id: 'progress-1',
        user_id: 'user-1',
        dream_board_content_id: 'dream-1',
        dream_title: 'Dream 1',
        dream_category: 'travel',
        progress_value: 1.25,
        previous_value: 0.4,
        adjustment_value: 0.85,
        created_at: '2026-01-02T00:00:00.000Z',
        updated_at: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 'progress-ignored',
        user_id: 'user-1',
        dream_board_content_id: 'dream-3',
        dream_title: 'Dream 3',
        dream_category: 'career',
        progress_value: 0.9,
        previous_value: 0.1,
        adjustment_value: 0.8,
        created_at: '2026-01-02T00:00:00.000Z',
        updated_at: '2026-01-02T00:00:00.000Z',
      },
    ];

    expect(buildDreamProgressMap(dreams, progressEntries)).toEqual({
      'dream-1': 1,
      'dream-2': 0.2,
    });
  });

  it('buildDreamMilestonesMap converts backend milestones and falls back to dream milestones when missing', () => {
    const fallbackMilestone: Milestone = {
      id: 'fallback-1',
      title: 'Fallback milestone',
      description: 'Fallback description',
      completed: false,
      date: '2026-01-03',
    };
    const dreams = [
      createDream('dream-1', 'travel', 0.4, [fallbackMilestone]),
      createDream('dream-2', 'health', 0.2, []),
    ];
    const milestoneGroups: Record<string, DreamMilestone[]> = {
      'dream-1': [
        {
          id: 'milestone-1',
          dream_board_content_id: 'dream-1',
          user_id: 'user-1',
          title: 'Backend milestone',
          description: 'Mapped from API',
          completed: true,
          due_date: '2026-01-10',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    };

    expect(buildDreamMilestonesMap(dreams, milestoneGroups)).toEqual({
      'dream-1': [
        {
          id: 'milestone-1',
          title: 'Backend milestone',
          description: 'Mapped from API',
          completed: true,
          date: '2026-01-10',
        },
      ],
      'dream-2': [],
    });

    expect(buildDreamMilestonesMap(dreams, null)).toEqual({
      'dream-1': [fallbackMilestone],
      'dream-2': [],
    });
  });

  it('buildNodeLookups normalizes category keys and computeCategoryCenters averages node positions', () => {
    const nodes = [
      {
        dream: createDream('dream-1', 'travel', 0.4, []),
        x: 10,
        y: 20,
      },
      {
        dream: createDream('dream-2', 'Travel', 0.2, []),
        x: 30,
        y: 40,
      },
      {
        dream: createDream('dream-3', 'health', 0.7, []),
        x: 50,
        y: 80,
      },
    ];

    const lookups = buildNodeLookups(nodes);
    const centers = computeCategoryCenters(lookups.nodesByCategory);

    expect(lookups.nodesById.get('dream-1')).toBe(nodes[0]);
    expect(lookups.nodesByCategory.get('Travel')).toEqual([nodes[0], nodes[1]]);
    expect(lookups.nodesByCategory.get('Health')).toEqual([nodes[2]]);
    expect(centers.get('Travel')).toEqual({ x: 20, y: 30 });
    expect(centers.get('Health')).toEqual({ x: 50, y: 80 });
  });
});
