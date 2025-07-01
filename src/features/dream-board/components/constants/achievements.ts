import { Dream } from '../../types';

interface AchievementBadge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  condition: (dream: Dream) => boolean;
}

const achievementBadges: AchievementBadge[] = [
  {
    id: 'first-milestone',
    titleKey: 'dreamBoard.milestones.achievements.badges.firstStep.title',
    descriptionKey: 'dreamBoard.milestones.achievements.badges.firstStep.description',
    icon: '🚀',
    condition: (dream: Dream) => dream.milestones.some(m => m.completed),
  },
  {
    id: 'halfway',
    titleKey: 'dreamBoard.milestones.achievements.badges.halfwayThere.title',
    descriptionKey: 'dreamBoard.milestones.achievements.badges.halfwayThere.description',
    icon: '🏆',
    condition: (dream: Dream) => dream.progress >= 0.5,
  },
  {
    id: 'all-dated',
    titleKey: 'dreamBoard.milestones.achievements.badges.wellPlanned.title',
    descriptionKey: 'dreamBoard.milestones.achievements.badges.wellPlanned.description',
    icon: '📅',
    condition: (dream: Dream) =>
      dream.milestones.length > 0 && dream.milestones.every(m => m.date !== undefined),
  },
  {
    id: 'completed',
    titleKey: 'dreamBoard.milestones.achievements.badges.dreamAchieved.title',
    descriptionKey: 'dreamBoard.milestones.achievements.badges.dreamAchieved.description',
    icon: '✨',
    condition: (dream: Dream) => dream.progress >= 1,
  },
];

export default achievementBadges;
