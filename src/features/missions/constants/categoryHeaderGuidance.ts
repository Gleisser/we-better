import type { MissionCategoryId } from './categoryImageMap';

export interface CategoryHeaderGuidance {
  summaryKey: string;
  improvementFocusKey: string;
  microHabitKey: string;
}

export const headerGuidanceFallback: CategoryHeaderGuidance = {
  summaryKey: 'missions.content.header.guidance.fallback.summary',
  improvementFocusKey: 'missions.content.header.guidance.fallback.improvementFocus',
  microHabitKey: 'missions.content.header.guidance.fallback.microHabit',
};

export const categoryHeaderGuidance: Record<MissionCategoryId, CategoryHeaderGuidance> = {
  social: {
    summaryKey: 'missions.content.header.guidance.social.summary',
    improvementFocusKey: 'missions.content.header.guidance.social.improvementFocus',
    microHabitKey: 'missions.content.header.guidance.social.microHabit',
  },
  health: {
    summaryKey: 'missions.content.header.guidance.health.summary',
    improvementFocusKey: 'missions.content.header.guidance.health.improvementFocus',
    microHabitKey: 'missions.content.header.guidance.health.microHabit',
  },
  selfCare: {
    summaryKey: 'missions.content.header.guidance.selfCare.summary',
    improvementFocusKey: 'missions.content.header.guidance.selfCare.improvementFocus',
    microHabitKey: 'missions.content.header.guidance.selfCare.microHabit',
  },
  money: {
    summaryKey: 'missions.content.header.guidance.money.summary',
    improvementFocusKey: 'missions.content.header.guidance.money.improvementFocus',
    microHabitKey: 'missions.content.header.guidance.money.microHabit',
  },
  family: {
    summaryKey: 'missions.content.header.guidance.family.summary',
    improvementFocusKey: 'missions.content.header.guidance.family.improvementFocus',
    microHabitKey: 'missions.content.header.guidance.family.microHabit',
  },
  spirituality: {
    summaryKey: 'missions.content.header.guidance.spirituality.summary',
    improvementFocusKey: 'missions.content.header.guidance.spirituality.improvementFocus',
    microHabitKey: 'missions.content.header.guidance.spirituality.microHabit',
  },
  relationship: {
    summaryKey: 'missions.content.header.guidance.relationship.summary',
    improvementFocusKey: 'missions.content.header.guidance.relationship.improvementFocus',
    microHabitKey: 'missions.content.header.guidance.relationship.microHabit',
  },
  career: {
    summaryKey: 'missions.content.header.guidance.career.summary',
    improvementFocusKey: 'missions.content.header.guidance.career.improvementFocus',
    microHabitKey: 'missions.content.header.guidance.career.microHabit',
  },
};
