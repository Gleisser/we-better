import { Dream } from '../../types';

const achievementBadges = [
  {
    id: 'first-milestone',
    title: 'First Step',
    description: 'Completed your first milestone',
    icon: '🚀',
    condition: (dream: Dream) => dream.milestones.some(m => m.completed),
  },
  {
    id: 'halfway',
    title: 'Halfway There',
    description: 'Reached 50% completion',
    icon: '🏆',
    condition: (dream: Dream) => dream.progress >= 0.5,
  },
  {
    id: 'all-dated',
    title: 'Well Planned',
    description: 'Set target dates for all milestones',
    icon: '📅',
    condition: (dream: Dream) =>
      dream.milestones.length > 0 && dream.milestones.every(m => m.date !== undefined),
  },
  {
    id: 'completed',
    title: 'Dream Achieved',
    description: 'Completed all milestones',
    icon: '✨',
    condition: (dream: Dream) => dream.progress >= 1,
  },
];

export default achievementBadges;
