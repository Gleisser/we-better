import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { GamifiedCTAButton } from '@/shared/components/common';
import styles from './CategoryMissions.module.css';
import type { MissionCategory } from '../MissionCategories/MissionCategories';
import {
  categoryHeaderGuidance,
  headerGuidanceFallback,
} from '@/features/missions/constants/categoryHeaderGuidance';

type MissionDifficulty = 'bronze' | 'silver' | 'gold';

type MissionStatus = 'pending' | 'active' | 'completed';
type MomentumState = 'not_started' | 'in_progress' | 'completed';

interface Mission {
  id: string;
  title: string;
  description: string;
  effort: 'light' | 'moderate' | 'intense';
  estimatedMinutes: number;
  difficulty: MissionDifficulty;
  stretchGoal: string;
  tip: string;
}

interface MissionState extends Mission {
  status: MissionStatus;
  isStretch: boolean;
}

interface CategoryMissionsProps {
  category: MissionCategory;
}

const missionLibrary: Record<string, Mission[]> = {
  social: [
    {
      id: 'social-connect',
      title: 'Reconnect with someone',
      description: 'Send a heartfelt message to a friend you have not spoken with lately.',
      effort: 'light',
      estimatedMinutes: 15,
      difficulty: 'bronze',
      stretchGoal: 'Schedule a video call instead of messaging.',
      tip: 'Use a voice note to make it feel more personal.',
    },
    {
      id: 'social-kindness',
      title: 'Acts of kindness',
      description: 'Do something thoughtful for someone in your circle this week.',
      effort: 'moderate',
      estimatedMinutes: 30,
      difficulty: 'silver',
      stretchGoal: 'Surprise them with a small gift or written note.',
      tip: 'Keep it simple—your presence matters most.',
    },
    {
      id: 'social-host',
      title: 'Host a mini gathering',
      description: 'Plan a casual meetup or group activity before the weekend ends.',
      effort: 'intense',
      estimatedMinutes: 90,
      difficulty: 'gold',
      stretchGoal: 'Invite someone new to expand your circle.',
      tip: 'Pick a setting that lets everyone participate easily.',
    },
    {
      id: 'social-listen',
      title: 'Deep-listen conversation',
      description: 'Give someone your full attention for 20 minutes without multitasking.',
      effort: 'moderate',
      estimatedMinutes: 25,
      difficulty: 'silver',
      stretchGoal: 'End with one thoughtful follow-up question.',
      tip: 'Put your phone face down to stay fully present.',
    },
  ],
  health: [
    {
      id: 'health-move',
      title: 'Move with intention',
      description: 'Complete a focused 20-minute workout tailored to your energy level.',
      effort: 'moderate',
      estimatedMinutes: 20,
      difficulty: 'bronze',
      stretchGoal: 'Extend the session to 35 minutes with added mobility.',
      tip: 'Queue your favorite playlist before you start.',
    },
    {
      id: 'health-nourish',
      title: 'Nourish smartly',
      description: 'Prepare a nutrient-dense meal from scratch this week.',
      effort: 'moderate',
      estimatedMinutes: 45,
      difficulty: 'silver',
      stretchGoal: 'Meal-prep two servings to cover another day.',
      tip: 'Plan ingredients in advance to stay on track.',
    },
    {
      id: 'health-reset',
      title: 'Sleep reset',
      description: 'Create a calming pre-sleep ritual and stick with it for three nights.',
      effort: 'light',
      estimatedMinutes: 15,
      difficulty: 'gold',
      stretchGoal: 'Extend the ritual to a full week for deeper benefits.',
      tip: 'Dim the lights and avoid screens 30 minutes before bed.',
    },
    {
      id: 'health-hydrate',
      title: 'Hydration streak',
      description: 'Hit your hydration target for the next four consecutive days.',
      effort: 'light',
      estimatedMinutes: 10,
      difficulty: 'silver',
      stretchGoal: 'Pair each glass with a quick posture reset.',
      tip: 'Fill one bottle in the morning so progress is visible.',
    },
  ],
  selfCare: [
    {
      id: 'selfCare-breathe',
      title: 'Breathing reset',
      description: 'Run a 5-minute breath cycle to calm your nervous system.',
      effort: 'light',
      estimatedMinutes: 10,
      difficulty: 'bronze',
      stretchGoal: 'Repeat before lunch and before sleep.',
      tip: 'Try a 4-4-6 cadence: inhale, hold, exhale.',
    },
    {
      id: 'selfCare-journal',
      title: 'Micro-journaling',
      description: 'Write one page on what drained and restored your energy today.',
      effort: 'light',
      estimatedMinutes: 15,
      difficulty: 'bronze',
      stretchGoal: 'Close with one commitment for tomorrow.',
      tip: 'Use bullet points if a full page feels heavy.',
    },
    {
      id: 'selfCare-boundary',
      title: 'Set one boundary',
      description: 'Protect one focus block by saying no to a non-essential request.',
      effort: 'moderate',
      estimatedMinutes: 25,
      difficulty: 'silver',
      stretchGoal: 'Communicate your boundary clearly and kindly.',
      tip: 'Use: “I can’t today, but I can revisit on Friday.”',
    },
    {
      id: 'selfCare-digital-sunset',
      title: 'Digital sunset',
      description: 'Create a 45-minute no-screen window before bed this week.',
      effort: 'moderate',
      estimatedMinutes: 45,
      difficulty: 'gold',
      stretchGoal: 'Replace the window with reading or gentle stretching.',
      tip: 'Set a nightly alarm labeled “power down.”',
    },
  ],
  money: [
    {
      id: 'money-checkin',
      title: 'Weekly money check-in',
      description: 'Review last week spending and tag three avoidable purchases.',
      effort: 'light',
      estimatedMinutes: 20,
      difficulty: 'bronze',
      stretchGoal: 'Create one rule for next week spending.',
      tip: 'Group spending into needs, wants, and leaks.',
    },
    {
      id: 'money-trim',
      title: 'Trim one expense',
      description: 'Cancel, downgrade, or renegotiate one recurring subscription.',
      effort: 'moderate',
      estimatedMinutes: 35,
      difficulty: 'silver',
      stretchGoal: 'Redirect the savings to a goal account immediately.',
      tip: 'Start with services you forgot you were paying for.',
    },
    {
      id: 'money-save',
      title: 'Automatic savings move',
      description: 'Set up or increase an automatic weekly transfer.',
      effort: 'moderate',
      estimatedMinutes: 30,
      difficulty: 'silver',
      stretchGoal: 'Raise the transfer by 10 percent next month.',
      tip: 'Automation beats willpower on busy weeks.',
    },
    {
      id: 'money-income',
      title: 'Income expansion step',
      description: 'Take one concrete action that can increase your income.',
      effort: 'intense',
      estimatedMinutes: 90,
      difficulty: 'gold',
      stretchGoal: 'Schedule the second action before this week ends.',
      tip: 'Pitch, publish, or apply: pick one and execute today.',
    },
  ],
  family: [
    {
      id: 'family-checkin',
      title: 'Family check-in',
      description: 'Start a 20-minute check-in with one family member.',
      effort: 'light',
      estimatedMinutes: 20,
      difficulty: 'bronze',
      stretchGoal: 'Ask one question you usually avoid.',
      tip: 'Lead with curiosity, not solutions.',
    },
    {
      id: 'family-memory',
      title: 'Create a memory',
      description: 'Plan a simple shared activity and capture one photo or note.',
      effort: 'moderate',
      estimatedMinutes: 40,
      difficulty: 'silver',
      stretchGoal: 'Turn it into a weekly ritual slot.',
      tip: 'Simple and consistent beats elaborate and rare.',
    },
    {
      id: 'family-support',
      title: 'Support in action',
      description: 'Take one task off a family member’s plate this week.',
      effort: 'moderate',
      estimatedMinutes: 30,
      difficulty: 'silver',
      stretchGoal: 'Do it anonymously and observe the impact.',
      tip: 'Choose something concrete and time-bound.',
    },
    {
      id: 'family-ritual',
      title: 'Build a family ritual',
      description: 'Design and run a weekly ritual everyone can join.',
      effort: 'intense',
      estimatedMinutes: 75,
      difficulty: 'gold',
      stretchGoal: 'Collect feedback and improve it for next week.',
      tip: 'Anchor the ritual to a fixed day and time.',
    },
  ],
  spirituality: [
    {
      id: 'spirituality-silence',
      title: 'Silent reset',
      description: 'Spend 12 minutes in silence and observe your thoughts without judgment.',
      effort: 'light',
      estimatedMinutes: 15,
      difficulty: 'bronze',
      stretchGoal: 'Repeat daily for three days.',
      tip: 'A timer removes the urge to check the clock.',
    },
    {
      id: 'spirituality-gratitude',
      title: 'Gratitude triad',
      description: 'Write three specific gratitudes and why they matter.',
      effort: 'light',
      estimatedMinutes: 10,
      difficulty: 'bronze',
      stretchGoal: 'Share one gratitude directly with someone.',
      tip: 'Specific details create stronger emotional recall.',
    },
    {
      id: 'spirituality-nature',
      title: 'Nature reconnection',
      description: 'Take a mindful walk with no audio for at least 30 minutes.',
      effort: 'moderate',
      estimatedMinutes: 45,
      difficulty: 'silver',
      stretchGoal: 'End with five quiet breaths before leaving.',
      tip: 'Notice textures, sounds, and temperature shifts.',
    },
    {
      id: 'spirituality-service',
      title: 'Service act',
      description: 'Offer one selfless act expecting nothing in return.',
      effort: 'intense',
      estimatedMinutes: 60,
      difficulty: 'gold',
      stretchGoal: 'Make service a repeating weekly intention.',
      tip: 'Small acts done sincerely still count.',
    },
  ],
  relationship: [
    {
      id: 'relationship-appreciation',
      title: 'Intentional appreciation',
      description: 'Express one sincere appreciation to your partner or close person.',
      effort: 'light',
      estimatedMinutes: 10,
      difficulty: 'bronze',
      stretchGoal: 'Name the behavior and the impact it had on you.',
      tip: 'Specific appreciation lands deeper than generic praise.',
    },
    {
      id: 'relationship-date',
      title: 'Presence date',
      description: 'Plan quality time with full presence and no phone interruptions.',
      effort: 'moderate',
      estimatedMinutes: 90,
      difficulty: 'silver',
      stretchGoal: 'Include one meaningful prompt to deepen connection.',
      tip: 'Pick an activity that creates conversation naturally.',
    },
    {
      id: 'relationship-repair',
      title: 'Repair a tension',
      description: 'Address one unresolved tension with calm and clarity.',
      effort: 'moderate',
      estimatedMinutes: 35,
      difficulty: 'silver',
      stretchGoal: 'Summarize each other’s perspective before responding.',
      tip: 'Lead with “I felt...” instead of blame language.',
    },
    {
      id: 'relationship-boundary',
      title: 'Relational boundary',
      description: 'Set one healthy boundary that supports trust and consistency.',
      effort: 'intense',
      estimatedMinutes: 45,
      difficulty: 'gold',
      stretchGoal: 'Agree on a check-in date to review how it is working.',
      tip: 'Boundaries are agreements, not punishments.',
    },
  ],
  career: [
    {
      id: 'career-priority',
      title: 'Priority sprint',
      description: 'Block a 45-minute deep-work sprint on your highest-impact task.',
      effort: 'light',
      estimatedMinutes: 45,
      difficulty: 'bronze',
      stretchGoal: 'Run two sprints on separate days.',
      tip: 'Define “done” before the timer starts.',
    },
    {
      id: 'career-learn',
      title: 'Skill upgrade',
      description: 'Learn one practical skill and apply it immediately.',
      effort: 'moderate',
      estimatedMinutes: 50,
      difficulty: 'silver',
      stretchGoal: 'Share the outcome with a teammate or mentor.',
      tip: 'Application cements learning faster than notes alone.',
    },
    {
      id: 'career-visibility',
      title: 'Visibility move',
      description: 'Publish or present one update on meaningful progress.',
      effort: 'moderate',
      estimatedMinutes: 30,
      difficulty: 'silver',
      stretchGoal: 'Tie the update to measurable business impact.',
      tip: 'Keep the message short and outcome-first.',
    },
    {
      id: 'career-network',
      title: 'Network catalyst',
      description: 'Reach out to two valuable contacts and schedule one conversation.',
      effort: 'intense',
      estimatedMinutes: 60,
      difficulty: 'gold',
      stretchGoal: 'Prepare one clear ask before each conversation.',
      tip: 'Warm introductions usually convert better than cold outreach.',
    },
  ],
};

const defaultMissions: Mission[] = [
  {
    id: 'default-reflect',
    title: 'Plant a new seed',
    description: 'Choose a meaningful action that nudges this life area forward.',
    effort: 'light',
    estimatedMinutes: 20,
    difficulty: 'bronze',
    stretchGoal: 'Repeat the action twice this week.',
    tip: 'Small consistent moves compound faster than you think.',
  },
  {
    id: 'default-expand',
    title: 'Explore a new angle',
    description: 'Learn one new insight or technique related to this life area.',
    effort: 'moderate',
    estimatedMinutes: 35,
    difficulty: 'silver',
    stretchGoal: 'Share the insight with someone for accountability.',
    tip: 'Audio clips or short articles keep the bar friendly.',
  },
  {
    id: 'default-celebrate',
    title: 'Celebrate progress',
    description: 'Document one win and how it made you feel.',
    effort: 'light',
    estimatedMinutes: 10,
    difficulty: 'bronze',
    stretchGoal: 'Turn the win into a ritual you repeat weekly.',
    tip: 'Write it down—seeing your words boosts recall.',
  },
  {
    id: 'default-align',
    title: 'Refocus next move',
    description: 'Choose one clear next action and schedule it on your calendar.',
    effort: 'moderate',
    estimatedMinutes: 20,
    difficulty: 'silver',
    stretchGoal: 'Block a backup slot in case your day shifts.',
    tip: 'Time-boxed commitments reduce decision fatigue.',
  },
];

const difficultyBadges: Record<MissionDifficulty, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
};

const difficultyPalettes: Record<
  MissionDifficulty,
  {
    primary: string;
    secondary: string;
  }
> = {
  bronze: { primary: '#D97706', secondary: '#FDE68A' },
  silver: { primary: '#60A5FA', secondary: '#E0F2FE' },
  gold: { primary: '#FBBF24', secondary: '#FEF08A' },
};

type BadgeSkin =
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'red'
  | 'purple'
  | 'teal'
  | 'blue'
  | 'blueDark'
  | 'green'
  | 'greenDark'
  | 'silver'
  | 'gold';

interface MissionBadgeMeta {
  title: string;
  icon: string;
  skin: BadgeSkin;
}

const defaultBadge: MissionBadgeMeta = {
  title: 'Explorer',
  icon: '✨',
  skin: 'purple',
};

const missionBadges: Record<string, MissionBadgeMeta> = {
  'social-connect': {
    title: 'Connector',
    icon: '🔗',
    skin: 'yellow',
  },
  'social-kindness': {
    title: 'Kindred',
    icon: '💛',
    skin: 'pink',
  },
  'social-host': {
    title: 'Spark',
    icon: '🎉',
    skin: 'orange',
  },
  'health-move': {
    title: 'Momentum',
    icon: '⚡',
    skin: 'teal',
  },
  'health-nourish': {
    title: 'Fuel Up',
    icon: '🥗',
    skin: 'green',
  },
  'health-reset': {
    title: 'Recharge',
    icon: '🌙',
    skin: 'purple',
  },
  'social-listen': {
    title: 'Listener',
    icon: '🎧',
    skin: 'blue',
  },
  'health-hydrate': {
    title: 'Hydrated',
    icon: '💧',
    skin: 'blueDark',
  },
  'selfCare-breathe': {
    title: 'Calm Core',
    icon: '🫁',
    skin: 'teal',
  },
  'selfCare-journal': {
    title: 'Reflector',
    icon: '📓',
    skin: 'purple',
  },
  'selfCare-boundary': {
    title: 'Protector',
    icon: '🛡️',
    skin: 'greenDark',
  },
  'selfCare-digital-sunset': {
    title: 'Unplugged',
    icon: '🌆',
    skin: 'orange',
  },
  'money-checkin': {
    title: 'Tracker',
    icon: '🧾',
    skin: 'silver',
  },
  'money-trim': {
    title: 'Optimizer',
    icon: '✂️',
    skin: 'green',
  },
  'money-save': {
    title: 'Builder',
    icon: '🏦',
    skin: 'blue',
  },
  'money-income': {
    title: 'Accelerator',
    icon: '🚀',
    skin: 'gold',
  },
  'family-checkin': {
    title: 'Heartbeat',
    icon: '💬',
    skin: 'pink',
  },
  'family-memory': {
    title: 'Memory Maker',
    icon: '📸',
    skin: 'yellow',
  },
  'family-support': {
    title: 'Supporter',
    icon: '🤝',
    skin: 'teal',
  },
  'family-ritual': {
    title: 'Tradition',
    icon: '🕯️',
    skin: 'orange',
  },
  'spirituality-silence': {
    title: 'Stillness',
    icon: '🫧',
    skin: 'silver',
  },
  'spirituality-gratitude': {
    title: 'Grateful',
    icon: '🙏',
    skin: 'yellow',
  },
  'spirituality-nature': {
    title: 'Earthbound',
    icon: '🌿',
    skin: 'greenDark',
  },
  'spirituality-service': {
    title: 'Giver',
    icon: '🤲',
    skin: 'gold',
  },
  'relationship-appreciation': {
    title: 'Heartline',
    icon: '💗',
    skin: 'pink',
  },
  'relationship-date': {
    title: 'Presence',
    icon: '🕯️',
    skin: 'red',
  },
  'relationship-repair': {
    title: 'Bridge',
    icon: '🌉',
    skin: 'blueDark',
  },
  'relationship-boundary': {
    title: 'Respect',
    icon: '🧭',
    skin: 'purple',
  },
  'career-priority': {
    title: 'Focus',
    icon: '🎯',
    skin: 'blue',
  },
  'career-learn': {
    title: 'Upskill',
    icon: '📘',
    skin: 'teal',
  },
  'career-visibility': {
    title: 'Spotlight',
    icon: '📣',
    skin: 'orange',
  },
  'career-network': {
    title: 'Connector+',
    icon: '🕸️',
    skin: 'gold',
  },
  'default-reflect': {
    title: 'Seed Planter',
    icon: '🌱',
    skin: 'greenDark',
  },
  'default-expand': {
    title: 'Pathfinder',
    icon: '🧭',
    skin: 'blue',
  },
  'default-celebrate': {
    title: 'Glow Up',
    icon: '🏵️',
    skin: 'gold',
  },
  'default-align': {
    title: 'North Star',
    icon: '🧭',
    skin: 'blueDark',
  },
};

const useWeekNumber = (): number => {
  return useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.max(1, Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7));
  }, []);
};

const CategoryMissions = ({ category }: CategoryMissionsProps): JSX.Element => {
  const { t } = useCommonTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const missionCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prefersReducedMotion = useReducedMotion();
  const [isRibbonCollapsed, setRibbonCollapsed] = useState(false);
  const [showWhyPanel, setShowWhyPanel] = useState(false);
  const [highlightedMissionId, setHighlightedMissionId] = useState<string | null>(null);
  const weekNumber = useWeekNumber();
  const translations = useMemo(
    () => ({
      weekLabel: t('missions.content.week') as string,
      questLabel: t('missions.content.quest') as string,
      guidePrefix: t('missions.content.guidePrefix') as string,
      guideAction: t('missions.content.guideAction') as string,
      guideSuffix: t('missions.content.guideSuffix') as string,
      cta: {
        start: t('missions.content.cta.start') as string,
        inProgress: t('missions.content.cta.inProgress') as string,
        complete: t('missions.content.cta.complete') as string,
      },
      hints: {
        pendingPrefix: t('missions.content.hints.pendingPrefix') as string,
        pendingAction: t('missions.content.hints.pendingAction') as string,
        pendingSuffix: t('missions.content.hints.pendingSuffix') as string,
        active: t('missions.content.hints.active') as string,
        completed: t('missions.content.hints.completed') as string,
      },
      header: {
        progress: t('missions.content.header.progress') as string,
        completed: t('missions.content.header.completed') as string,
        pending: t('missions.content.header.pending') as string,
        active: t('missions.content.header.active') as string,
        actions: {
          startNext: t('missions.content.header.actions.startNext') as string,
          continue: t('missions.content.header.actions.continue') as string,
          reviewWins: t('missions.content.header.actions.reviewWins') as string,
          why: t('missions.content.header.actions.why') as string,
        },
        panels: {
          whyTitle: t('missions.content.header.panels.whyTitle') as string,
          microHabit: t('missions.content.header.panels.microHabit') as string,
        },
      },
    }),
    [t]
  );
  const baseMissions = useMemo(() => missionLibrary[category.id] ?? defaultMissions, [category.id]);
  const guidanceKeys = categoryHeaderGuidance[category.id] ?? headerGuidanceFallback;
  const guidance = useMemo(
    () => ({
      summary: t(guidanceKeys.summaryKey) as string,
      improvementFocus: t(guidanceKeys.improvementFocusKey) as string,
      microHabit: t(guidanceKeys.microHabitKey) as string,
    }),
    [guidanceKeys.improvementFocusKey, guidanceKeys.microHabitKey, guidanceKeys.summaryKey, t]
  );

  const [missions, setMissions] = useState<MissionState[]>(
    baseMissions.map(mission => ({
      ...mission,
      status: 'pending',
      isStretch: false,
    }))
  );

  useEffect(() => {
    setMissions(
      baseMissions.map(mission => ({
        ...mission,
        status: 'pending',
        isStretch: false,
      }))
    );
    setShowWhyPanel(false);
    setHighlightedMissionId(null);
  }, [baseMissions]);

  useEffect(() => {
    const current = containerRef.current;
    if (!current) return;

    const handleScroll = (): void => {
      setRibbonCollapsed(current.scrollTop > 80);
    };

    current.addEventListener('scroll', handleScroll);
    return () => {
      current.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(timer => {
        window.clearTimeout(timer);
      });
      timers.current = {};
    };
  }, []);

  const setMissionStatus = (id: string, updater: (mission: MissionState) => MissionState): void => {
    setMissions(prev =>
      prev.map(mission => {
        if (mission.id !== id) return mission;
        return updater(mission);
      })
    );
  };

  const handleStartMission = (id: string): void => {
    setMissionStatus(id, mission => ({ ...mission, status: 'active' }));
  };

  const triggerCompletion = (id: string): void => {
    setMissionStatus(id, mission => ({
      ...mission,
      status: 'completed',
    }));
  };

  const totalMissions = missions.length;
  const completedCount = missions.filter(mission => mission.status === 'completed').length;
  const activeCount = missions.filter(mission => mission.status === 'active').length;
  const pendingCount = missions.filter(mission => mission.status === 'pending').length;
  const allMissionsCompleted = completedCount === totalMissions;
  const completionPercent =
    totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;
  const nextMission =
    missions.find(mission => mission.status === 'pending') ??
    missions.find(mission => mission.status === 'active') ??
    null;

  const momentumState: MomentumState = useMemo(() => {
    if (allMissionsCompleted && totalMissions > 0) return 'completed';
    if (completedCount === 0 && activeCount === 0) return 'not_started';
    return 'in_progress';
  }, [activeCount, allMissionsCompleted, completedCount, totalMissions]);

  const recommendationText = useMemo(() => {
    const missionName = nextMission?.title || category.name;
    if (momentumState === 'not_started') {
      return t('missions.content.header.states.notStarted', { mission: missionName }) as string;
    }
    if (momentumState === 'in_progress') {
      return t('missions.content.header.states.inProgress', { mission: missionName }) as string;
    }
    return t('missions.content.header.states.completed', { category: category.name }) as string;
  }, [category.name, momentumState, nextMission?.title, t]);

  const primaryActionLabel =
    momentumState === 'not_started'
      ? translations.header.actions.startNext
      : momentumState === 'in_progress'
        ? translations.header.actions.continue
        : translations.header.actions.reviewWins;
  const actionMission =
    nextMission ?? (momentumState === 'completed' ? (missions[0] ?? null) : null);

  const focusNextMission = (): void => {
    if (!actionMission) return;
    const missionElement = missionCardRefs.current[actionMission.id];
    if (!missionElement) return;

    missionElement.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
    setHighlightedMissionId(actionMission.id);

    if (timers.current.highlight) {
      window.clearTimeout(timers.current.highlight);
    }
    timers.current.highlight = window.setTimeout(() => {
      setHighlightedMissionId(current => (current === actionMission.id ? null : current));
    }, 1600);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.ambient}>
        <motion.div
          className={styles.particleField}
          animate={{
            opacity: allMissionsCompleted ? 0.9 : 0.4 + completedCount * 0.15,
            scale: allMissionsCompleted ? 1.1 : 1,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: 'easeOut' }}
        />
        <AnimatePresence>
          {allMissionsCompleted && !prefersReducedMotion && (
            <motion.div
              className={styles.surge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </div>

      <div
        ref={containerRef}
        className={`${styles.missionScroll} ${isRibbonCollapsed ? styles.ribbonCollapsed : ''}`}
      >
        <motion.div
          className={styles.heroRibbon}
          style={{
            background: `linear-gradient(120deg, ${category.color.from}, ${category.color.to})`,
          }}
          animate={isRibbonCollapsed ? { y: -60, opacity: 0.95 } : { y: 0, opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' }}
        >
          <div className={styles.ribbonGlow} />
          <div className={styles.ribbonContent}>
            <div className={styles.ribbonMain}>
              <div className={styles.ribbonIdentityMedia}>
                <picture>
                  <source srcSet={category.image.webp} type="image/webp" />
                  <img
                    className={styles.ribbonCategoryImage}
                    src={category.image.png}
                    alt={category.name}
                    width={64}
                    height={64}
                    decoding="async"
                  />
                </picture>
              </div>
              <div className={styles.ribbonIdentityCopy}>
                <p className={styles.ribbonTitle}>{category.name}</p>
                <p className={styles.ribbonSubtitle}>
                  {translations.weekLabel} {weekNumber} • {category.name} {translations.questLabel}
                </p>
              </div>
            </div>
            <div className={styles.ribbonInsight}>
              <p className={styles.ribbonSummary}>{guidance.summary}</p>
              <div className={styles.ribbonStats} aria-live="polite">
                <span className={styles.statPill}>
                  {translations.header.progress}: {completionPercent}%
                </span>
                <span className={styles.statPill}>
                  {translations.header.completed}: {completedCount}/{totalMissions}
                </span>
                <span className={styles.statPill}>
                  {translations.header.active}: {activeCount}
                </span>
                <span className={styles.statPill}>
                  {translations.header.pending}: {pendingCount}
                </span>
              </div>
              <p className={styles.ribbonRecommendation} aria-live="polite">
                {recommendationText}
              </p>
            </div>
            <div className={styles.ribbonActions}>
              <button
                className={styles.ribbonActionPrimary}
                onClick={focusNextMission}
                type="button"
              >
                {primaryActionLabel}
              </button>
              <button
                className={styles.ribbonActionSecondary}
                onClick={() => setShowWhyPanel(open => !open)}
                type="button"
                aria-expanded={showWhyPanel}
                aria-controls={`mission-why-panel-${category.id}`}
              >
                {translations.header.actions.why}
              </button>
            </div>
            <motion.div
              className={styles.ribbonWave}
              animate={prefersReducedMotion ? {} : { backgroundPosition: ['0% 50%', '200% 50%'] }}
              transition={
                prefersReducedMotion ? undefined : { duration: 6, repeat: Infinity, ease: 'linear' }
              }
            />
          </div>
          <AnimatePresence>
            {showWhyPanel && (
              <motion.div
                id={`mission-why-panel-${category.id}`}
                className={styles.whyPanel}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              >
                <p className={styles.whyPanelTitle}>{translations.header.panels.whyTitle}</p>
                <p className={styles.whyPanelFocus}>{guidance.improvementFocus}</p>
                <p className={styles.whyPanelHabit}>
                  <strong>{translations.header.panels.microHabit}</strong> {guidance.microHabit}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className={styles.panelGuide}>
          <p className={styles.panelGuideText}>
            {translations.guidePrefix} <strong>{translations.guideAction}</strong>{' '}
            {translations.guideSuffix}
          </p>
        </div>

        <div className={styles.missionGrid}>
          {missions.map(mission => {
            const palette = difficultyPalettes[mission.difficulty];
            const badge = missionBadges[mission.id] ?? defaultBadge;
            const cardStyle = {
              '--mission-primary': palette.primary,
              '--mission-secondary': palette.secondary,
            } as CSSProperties;

            return (
              <motion.div
                key={mission.id}
                className={`${styles.missionCardWrapper} ${
                  highlightedMissionId === mission.id ? styles.cardHighlighted : ''
                }`}
                ref={element => {
                  missionCardRefs.current[mission.id] = element;
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotateX: -2,
                        rotateY: 3,
                        translateY: -10,
                        boxShadow: '0 50px 90px -45px rgba(15,23,42,0.95)',
                      }
                }
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                transition={{
                  delay: prefersReducedMotion ? 0 : 0.05,
                  type: 'spring',
                  stiffness: 220,
                  damping: 26,
                }}
              >
                <div
                  className={`${styles.missionCard} ${
                    mission.status === 'completed' ? styles.missionCompleted : ''
                  }`}
                  style={cardStyle}
                >
                  <div className={styles.cardAtmosphere}>
                    <span className={styles.cardAurora} />
                    <span className={styles.cardShard} />
                  </div>

                  <motion.div
                    className={`${styles.missionBadge} ${styles[badge.skin]}`}
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            y: [0, -2, 0],
                            rotate: [0, 2, -1.5, 0],
                          }
                    }
                    transition={
                      prefersReducedMotion
                        ? undefined
                        : {
                            duration: 6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }
                    }
                  >
                    <div className={styles.badgeCircle}>
                      <span className={styles.badgeIcon}>{badge.icon}</span>
                    </div>
                    <span className={styles.badgeRibbon}>{badge.title}</span>
                  </motion.div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      <h4 className={styles.cardTitle}>{mission.title}</h4>
                    </div>
                    <p className={styles.cardDescription}>
                      {mission.isStretch ? mission.stretchGoal : mission.description}
                    </p>

                    <div className={styles.missionCta}>
                      <GamifiedCTAButton
                        primaryLabel={translations.cta.start}
                        secondaryLabel={translations.cta.inProgress}
                        holdLabel={translations.cta.complete}
                        holdDuration={1000}
                        onHoldComplete={() => {
                          triggerCompletion(mission.id);
                        }}
                        onClick={() => handleStartMission(mission.id)}
                      />
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.coachStrip}>
                        <span className={styles.coachAvatar}>✨</span>
                        {mission.status === 'pending' && (
                          <p className={styles.cardHint}>
                            {translations.hints.pendingPrefix}{' '}
                            <span className={styles.inlineHighlight}>
                              {translations.hints.pendingAction}
                            </span>
                            , {translations.hints.pendingSuffix}
                          </p>
                        )}
                        {mission.status === 'active' && (
                          <p className={styles.cardHint}>{translations.hints.active}</p>
                        )}
                        {mission.status === 'completed' && (
                          <p className={styles.cardHint}>{translations.hints.completed}</p>
                        )}
                      </div>
                      <motion.p
                        className={styles.cardTip}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: prefersReducedMotion ? 0 : 0.1 }}
                      >
                        {mission.tip}
                      </motion.p>
                    </div>
                  </div>
                </div>
                <div className={`${styles.difficultyRibbon} ${styles[mission.difficulty]}`}>
                  <span className={styles.ribbonLabel}>{difficultyBadges[mission.difficulty]}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryMissions;
