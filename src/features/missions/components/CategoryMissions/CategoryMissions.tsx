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
  badge?: MissionBadgeId;
  stretchGoal: string;
  tip: string;
  completedAt?: string | null;
}

interface MissionState extends Mission {
  status: MissionStatus;
  isStretch: boolean;
}

export interface CategoryMissionData extends Mission {
  status: MissionStatus;
}

interface CategoryMissionsProps {
  category: MissionCategory;
  missions: CategoryMissionData[];
  onMissionStatusChange?: (
    missionId: string,
    status: Exclude<MissionStatus, 'pending'>
  ) => Promise<void>;
}

type MissionFilterTab = 'pending' | 'completed';
const MAX_VISIBLE_PENDING_MISSIONS = 4;
const NEXT_MISSION_DELAY_DAYS = 7;

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

type MissionBadgeId =
  | 'explorer'
  | 'connector'
  | 'kindred'
  | 'spark'
  | 'momentum'
  | 'fuel-up'
  | 'recharge'
  | 'listener'
  | 'hydrated'
  | 'calm-core'
  | 'reflector'
  | 'protector'
  | 'unplugged'
  | 'tracker'
  | 'optimizer'
  | 'builder'
  | 'accelerator'
  | 'heartbeat'
  | 'memory-maker'
  | 'supporter'
  | 'tradition'
  | 'stillness'
  | 'grateful'
  | 'earthbound'
  | 'giver'
  | 'heartline'
  | 'presence'
  | 'bridge'
  | 'respect'
  | 'focus'
  | 'upskill'
  | 'spotlight'
  | 'connector-plus'
  | 'seed-planter'
  | 'pathfinder'
  | 'glow-up'
  | 'north-star';

interface MissionBadgeMeta {
  title: string;
  icon: string;
  skin: BadgeSkin;
}

const DEFAULT_MISSION_BADGE_ID: MissionBadgeId = 'explorer';

const missionBadgeCatalog: Record<MissionBadgeId, MissionBadgeMeta> = {
  explorer: {
    title: 'Explorer',
    icon: '✨',
    skin: 'purple',
  },
  connector: {
    title: 'Connector',
    icon: '🔗',
    skin: 'yellow',
  },
  kindred: {
    title: 'Kindred',
    icon: '💛',
    skin: 'pink',
  },
  spark: {
    title: 'Spark',
    icon: '🎉',
    skin: 'orange',
  },
  momentum: {
    title: 'Momentum',
    icon: '⚡',
    skin: 'teal',
  },
  'fuel-up': {
    title: 'Fuel Up',
    icon: '🥗',
    skin: 'green',
  },
  recharge: {
    title: 'Recharge',
    icon: '🌙',
    skin: 'purple',
  },
  listener: {
    title: 'Listener',
    icon: '🎧',
    skin: 'blue',
  },
  hydrated: {
    title: 'Hydrated',
    icon: '💧',
    skin: 'blueDark',
  },
  'calm-core': {
    title: 'Calm Core',
    icon: '🫁',
    skin: 'teal',
  },
  reflector: {
    title: 'Reflector',
    icon: '📓',
    skin: 'purple',
  },
  protector: {
    title: 'Protector',
    icon: '🛡️',
    skin: 'greenDark',
  },
  unplugged: {
    title: 'Unplugged',
    icon: '🌆',
    skin: 'orange',
  },
  tracker: {
    title: 'Tracker',
    icon: '🧾',
    skin: 'silver',
  },
  optimizer: {
    title: 'Optimizer',
    icon: '✂️',
    skin: 'green',
  },
  builder: {
    title: 'Builder',
    icon: '🏦',
    skin: 'blue',
  },
  accelerator: {
    title: 'Accelerator',
    icon: '🚀',
    skin: 'gold',
  },
  heartbeat: {
    title: 'Heartbeat',
    icon: '💬',
    skin: 'pink',
  },
  'memory-maker': {
    title: 'Memory Maker',
    icon: '📸',
    skin: 'yellow',
  },
  supporter: {
    title: 'Supporter',
    icon: '🤝',
    skin: 'teal',
  },
  tradition: {
    title: 'Tradition',
    icon: '🕯️',
    skin: 'orange',
  },
  stillness: {
    title: 'Stillness',
    icon: '🫧',
    skin: 'silver',
  },
  grateful: {
    title: 'Grateful',
    icon: '🙏',
    skin: 'yellow',
  },
  earthbound: {
    title: 'Earthbound',
    icon: '🌿',
    skin: 'greenDark',
  },
  giver: {
    title: 'Giver',
    icon: '🤲',
    skin: 'gold',
  },
  heartline: {
    title: 'Heartline',
    icon: '💗',
    skin: 'pink',
  },
  presence: {
    title: 'Presence',
    icon: '🕯️',
    skin: 'red',
  },
  bridge: {
    title: 'Bridge',
    icon: '🌉',
    skin: 'blueDark',
  },
  respect: {
    title: 'Respect',
    icon: '🧭',
    skin: 'purple',
  },
  focus: {
    title: 'Focus',
    icon: '🎯',
    skin: 'blue',
  },
  upskill: {
    title: 'Upskill',
    icon: '📘',
    skin: 'teal',
  },
  spotlight: {
    title: 'Spotlight',
    icon: '📣',
    skin: 'orange',
  },
  'connector-plus': {
    title: 'Connector+',
    icon: '🕸️',
    skin: 'gold',
  },
  'seed-planter': {
    title: 'Seed Planter',
    icon: '🌱',
    skin: 'greenDark',
  },
  pathfinder: {
    title: 'Pathfinder',
    icon: '🧭',
    skin: 'blue',
  },
  'glow-up': {
    title: 'Glow Up',
    icon: '🏵️',
    skin: 'gold',
  },
  'north-star': {
    title: 'North Star',
    icon: '🧭',
    skin: 'blueDark',
  },
};

const defaultBadge: MissionBadgeMeta = {
  ...missionBadgeCatalog[DEFAULT_MISSION_BADGE_ID],
};

const missionBadgeFallbackByMissionId: Record<string, MissionBadgeId> = {
  'social-connect': 'connector',
  'social-kindness': 'kindred',
  'social-host': 'spark',
  'health-move': 'momentum',
  'health-nourish': 'fuel-up',
  'health-reset': 'recharge',
  'social-listen': 'listener',
  'health-hydrate': 'hydrated',
  'selfCare-breathe': 'calm-core',
  'selfCare-journal': 'reflector',
  'selfCare-boundary': 'protector',
  'selfCare-digital-sunset': 'unplugged',
  'money-checkin': 'tracker',
  'money-trim': 'optimizer',
  'money-save': 'builder',
  'money-income': 'accelerator',
  'family-checkin': 'heartbeat',
  'family-memory': 'memory-maker',
  'family-support': 'supporter',
  'family-ritual': 'tradition',
  'spirituality-silence': 'stillness',
  'spirituality-gratitude': 'grateful',
  'spirituality-nature': 'earthbound',
  'spirituality-service': 'giver',
  'relationship-appreciation': 'heartline',
  'relationship-date': 'presence',
  'relationship-repair': 'bridge',
  'relationship-boundary': 'respect',
  'career-priority': 'focus',
  'career-learn': 'upskill',
  'career-visibility': 'spotlight',
  'career-network': 'connector-plus',
};

const useWeekNumber = (): number => {
  return useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.max(1, Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7));
  }, []);
};

const mapMissionDataToState = (source: CategoryMissionData[]): MissionState[] =>
  source.map(mission => ({
    id: mission.id,
    title: mission.title,
    description: mission.description,
    effort: mission.effort,
    estimatedMinutes: mission.estimatedMinutes,
    difficulty: mission.difficulty,
    badge: mission.badge,
    stretchGoal: mission.stretchGoal,
    tip: mission.tip,
    completedAt: mission.completedAt ?? null,
    status: mission.status,
    isStretch: false,
  }));

const CategoryMissions = ({
  category,
  missions: missionsFromApi,
  onMissionStatusChange,
}: CategoryMissionsProps): JSX.Element => {
  const { t } = useCommonTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const missionCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prefersReducedMotion = useReducedMotion();
  const [isRibbonCollapsed, setRibbonCollapsed] = useState(false);
  const [showWhyPanel, setShowWhyPanel] = useState(false);
  const [highlightedMissionId, setHighlightedMissionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MissionFilterTab>('pending');
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
      tabs: {
        pending: t('missions.content.tabs.pending') as string,
        completed: t('missions.content.tabs.completed') as string,
      },
      emptyState: {
        noDataTitle: t('missions.content.emptyState.noDataTitle') as string,
        noDataDescription: t('missions.content.emptyState.noDataDescription') as string,
        noPendingTitle: t('missions.content.emptyState.noPendingTitle') as string,
        noPendingDescription: t('missions.content.emptyState.noPendingDescription') as string,
        noCompletedTitle: t('missions.content.emptyState.noCompletedTitle') as string,
        noCompletedDescription: t('missions.content.emptyState.noCompletedDescription') as string,
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
  const guidanceKeys = categoryHeaderGuidance[category.id] ?? headerGuidanceFallback;
  const guidance = useMemo(
    () => ({
      summary: t(guidanceKeys.summaryKey) as string,
      improvementFocus: t(guidanceKeys.improvementFocusKey) as string,
      microHabit: t(guidanceKeys.microHabitKey) as string,
    }),
    [guidanceKeys.improvementFocusKey, guidanceKeys.microHabitKey, guidanceKeys.summaryKey, t]
  );

  const [missions, setMissions] = useState<MissionState[]>(() =>
    mapMissionDataToState(missionsFromApi)
  );

  useEffect(() => {
    setMissions(mapMissionDataToState(missionsFromApi));
    setShowWhyPanel(false);
    setHighlightedMissionId(null);
    setActiveTab('pending');
  }, [category.id, missionsFromApi]);

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

  const persistStatus = (id: string, status: Exclude<MissionStatus, 'pending'>): void => {
    if (!onMissionStatusChange) return;

    void onMissionStatusChange(id, status).catch(error => {
      console.error(`Failed to persist mission status (${id}, ${status}):`, error);
    });
  };

  const handleStartMission = (id: string): void => {
    setMissionStatus(id, mission => ({ ...mission, status: 'active' }));
    persistStatus(id, 'active');
  };

  const triggerCompletion = (id: string): void => {
    setMissionStatus(id, mission => ({
      ...mission,
      status: 'completed',
    }));
    persistStatus(id, 'completed');
  };

  const totalMissions = missions.length;
  const weeklyMissionTarget = Math.min(MAX_VISIBLE_PENDING_MISSIONS, totalMissions);
  const completedMissions = useMemo(
    () =>
      missions
        .filter(mission => mission.status === 'completed')
        .sort((a, b) => {
          const aTime = a.completedAt ? Date.parse(a.completedAt) : 0;
          const bTime = b.completedAt ? Date.parse(b.completedAt) : 0;
          if (aTime !== bTime) return bTime - aTime;
          return a.id.localeCompare(b.id);
        }),
    [missions]
  );
  const unresolvedMissions = useMemo(() => {
    const activeMissions = missions.filter(mission => mission.status === 'active');
    const pendingMissions = missions.filter(mission => mission.status === 'pending');
    return [...activeMissions, ...pendingMissions];
  }, [missions]);
  const cooldownActive = useMemo(() => {
    if (weeklyMissionTarget === 0 || completedMissions.length < weeklyMissionTarget) return false;

    const latestCompletedAt = completedMissions.reduce<number | null>((latest, mission) => {
      const timestamp = mission.completedAt ? Date.parse(mission.completedAt) : Number.NaN;
      if (Number.isNaN(timestamp)) return latest;
      if (latest === null || timestamp > latest) return timestamp;
      return latest;
    }, null);

    if (latestCompletedAt === null) {
      return true;
    }

    const cooldownMs = NEXT_MISSION_DELAY_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() < latestCompletedAt + cooldownMs;
  }, [completedMissions, weeklyMissionTarget]);
  const visibleCompletedMissions = useMemo(
    () =>
      completedMissions.length >= weeklyMissionTarget && !cooldownActive
        ? []
        : completedMissions.slice(0, weeklyMissionTarget),
    [completedMissions, cooldownActive, weeklyMissionTarget]
  );
  const visiblePendingMissions = useMemo(() => {
    const pendingSlots = Math.max(0, weeklyMissionTarget - visibleCompletedMissions.length);
    return unresolvedMissions.slice(0, pendingSlots);
  }, [unresolvedMissions, visibleCompletedMissions.length, weeklyMissionTarget]);

  const completedCount = visibleCompletedMissions.length;
  const activeCount = visiblePendingMissions.filter(mission => mission.status === 'active').length;
  const pendingCount = visiblePendingMissions.filter(
    mission => mission.status === 'pending'
  ).length;
  const pendingTabCount = visiblePendingMissions.length;
  const completedTabCount = visibleCompletedMissions.length;
  const visibleMissions =
    activeTab === 'completed' ? visibleCompletedMissions : visiblePendingMissions;
  const allMissionsCompleted = weeklyMissionTarget > 0 && completedCount === weeklyMissionTarget;
  const hasCategoryMissions = weeklyMissionTarget > 0;
  const completionPercent =
    weeklyMissionTarget > 0 ? Math.round((completedCount / weeklyMissionTarget) * 100) : 0;
  const nextMission =
    visiblePendingMissions.find(mission => mission.status === 'active') ??
    visiblePendingMissions.find(mission => mission.status === 'pending') ??
    null;

  const momentumState: MomentumState = useMemo(() => {
    if (allMissionsCompleted && weeklyMissionTarget > 0) return 'completed';
    if (completedCount === 0 && activeCount === 0) return 'not_started';
    return 'in_progress';
  }, [activeCount, allMissionsCompleted, completedCount, weeklyMissionTarget]);

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
    nextMission ?? (momentumState === 'completed' ? (visibleCompletedMissions[0] ?? null) : null);

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

  const emptyStateContent = useMemo(() => {
    if (!hasCategoryMissions) {
      return {
        title: translations.emptyState.noDataTitle,
        description: translations.emptyState.noDataDescription,
      };
    }

    if (activeTab === 'completed') {
      return {
        title: translations.emptyState.noCompletedTitle,
        description: translations.emptyState.noCompletedDescription,
      };
    }

    return {
      title: translations.emptyState.noPendingTitle,
      description: translations.emptyState.noPendingDescription,
    };
  }, [activeTab, hasCategoryMissions, translations.emptyState]);

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
                  {translations.header.completed}: {completedCount}/{weeklyMissionTarget}
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

        <div className={styles.tabBar} role="tablist" aria-label={category.name}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pending'}
            className={`${styles.tabButton} ${activeTab === 'pending' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            {translations.tabs.pending} ({pendingTabCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'completed'}
            className={`${styles.tabButton} ${activeTab === 'completed' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            {translations.tabs.completed} ({completedTabCount})
          </button>
        </div>

        {visibleMissions.length === 0 ? (
          <div className={styles.categoryEmptyState}>
            <p className={styles.categoryEmptyTitle}>{emptyStateContent.title}</p>
            <p className={styles.categoryEmptyDescription}>{emptyStateContent.description}</p>
          </div>
        ) : (
          <div className={styles.missionGrid}>
            {visibleMissions.map(mission => {
              const palette = difficultyPalettes[mission.difficulty];
              const badgeId =
                mission.badge ??
                missionBadgeFallbackByMissionId[mission.id] ??
                DEFAULT_MISSION_BADGE_ID;
              const badge = missionBadgeCatalog[badgeId] ?? defaultBadge;
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
                          state={
                            mission.status === 'completed'
                              ? 'completed'
                              : mission.status === 'active'
                                ? 'active'
                                : undefined
                          }
                          holdDuration={1000}
                          onHoldComplete={() => {
                            triggerCompletion(mission.id);
                          }}
                          onClick={() => {
                            if (mission.status !== 'pending') return;
                            handleStartMission(mission.id);
                          }}
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
                    <span className={styles.ribbonLabel}>
                      {difficultyBadges[mission.difficulty]}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryMissions;
