import type { LatestDreamProgress } from '@/core/services/dreamProgressService';
import type { DreamMilestone } from '../../api/dreamMilestonesApi';
import type { Dream, Milestone } from '../../types';

interface NodeWithDream {
  dream: {
    id: string;
    category: string;
  };
  x: number;
  y: number;
}

interface PositionedNode {
  x: number;
  y: number;
}

export interface CategoryCenter {
  x: number;
  y: number;
}

export interface NodeLookups<T extends NodeWithDream> {
  nodesById: Map<string, T>;
  nodesByCategory: Map<string, T[]>;
}

export const normalizeCategory = (category: string): string =>
  category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

const clampProgress = (value: number): number => Math.max(0, Math.min(1, value));

export const buildDreamProgressMap = (
  dreams: Dream[],
  latestProgressEntries: LatestDreamProgress[]
): Record<string, number> => {
  const progressMap = dreams.reduce<Record<string, number>>((map, dream) => {
    map[dream.id] = clampProgress(dream.progress);
    return map;
  }, {});

  latestProgressEntries.forEach(entry => {
    if (Object.prototype.hasOwnProperty.call(progressMap, entry.dream_board_content_id)) {
      progressMap[entry.dream_board_content_id] = clampProgress(entry.progress_value);
    }
  });

  return progressMap;
};

export const buildDreamMilestonesMap = (
  dreams: Dream[],
  milestoneGroups: Record<string, DreamMilestone[]> | null | undefined
): Record<string, Milestone[]> =>
  dreams.reduce<Record<string, Milestone[]>>((map, dream) => {
    const milestones = milestoneGroups?.[dream.id];

    map[dream.id] = milestones
      ? milestones.map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description || '',
          completed: milestone.completed,
          date: milestone.due_date || milestone.created_at,
        }))
      : dream.milestones || [];

    return map;
  }, {});

export const buildNodeLookups = <T extends NodeWithDream>(nodes: T[]): NodeLookups<T> => {
  const nodesById = new Map<string, T>();
  const nodesByCategory = new Map<string, T[]>();

  nodes.forEach(node => {
    nodesById.set(node.dream.id, node);

    const categoryKey = normalizeCategory(node.dream.category);
    const categoryNodes = nodesByCategory.get(categoryKey);

    if (categoryNodes) {
      categoryNodes.push(node);
      return;
    }

    nodesByCategory.set(categoryKey, [node]);
  });

  return {
    nodesById,
    nodesByCategory,
  };
};

export const computeCategoryCenters = <T extends PositionedNode>(
  nodesByCategory: Map<string, T[]>
): Map<string, CategoryCenter> => {
  const categoryCenters = new Map<string, CategoryCenter>();

  nodesByCategory.forEach((categoryNodes, category) => {
    if (categoryNodes.length === 0) {
      return;
    }

    let totalX = 0;
    let totalY = 0;

    categoryNodes.forEach(node => {
      totalX += node.x;
      totalY += node.y;
    });

    categoryCenters.set(category, {
      x: totalX / categoryNodes.length,
      y: totalY / categoryNodes.length,
    });
  });

  return categoryCenters;
};
