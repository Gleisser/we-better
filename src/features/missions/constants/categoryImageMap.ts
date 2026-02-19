export type MissionCategoryId =
  | 'social'
  | 'health'
  | 'selfCare'
  | 'money'
  | 'family'
  | 'spirituality'
  | 'relationship'
  | 'career';

export interface MissionCategoryImage {
  webp: string;
  png: string;
}

const categoryImageBaseNames: Record<MissionCategoryId, string> = {
  social: 'socialicon',
  health: 'healthicon',
  selfCare: 'selfcare',
  money: 'finance',
  family: 'family',
  spirituality: 'spiruality',
  relationship: 'relationship',
  career: 'career',
};

export const missionCategoryImageMap: Record<MissionCategoryId, MissionCategoryImage> = {
  social: {
    webp: `/assets/images/missions/${categoryImageBaseNames.social}.webp`,
    png: `/assets/images/missions/${categoryImageBaseNames.social}.png`,
  },
  health: {
    webp: `/assets/images/missions/${categoryImageBaseNames.health}.webp`,
    png: `/assets/images/missions/${categoryImageBaseNames.health}.png`,
  },
  selfCare: {
    webp: `/assets/images/missions/${categoryImageBaseNames.selfCare}.webp`,
    png: `/assets/images/missions/${categoryImageBaseNames.selfCare}.png`,
  },
  money: {
    webp: `/assets/images/missions/${categoryImageBaseNames.money}.webp`,
    png: `/assets/images/missions/${categoryImageBaseNames.money}.png`,
  },
  family: {
    webp: `/assets/images/missions/${categoryImageBaseNames.family}.webp`,
    png: `/assets/images/missions/${categoryImageBaseNames.family}.png`,
  },
  spirituality: {
    webp: `/assets/images/missions/${categoryImageBaseNames.spirituality}.webp`,
    png: `/assets/images/missions/${categoryImageBaseNames.spirituality}.png`,
  },
  relationship: {
    webp: `/assets/images/missions/${categoryImageBaseNames.relationship}.webp`,
    png: `/assets/images/missions/${categoryImageBaseNames.relationship}.png`,
  },
  career: {
    webp: `/assets/images/missions/${categoryImageBaseNames.career}.webp`,
    png: `/assets/images/missions/${categoryImageBaseNames.career}.png`,
  },
};
