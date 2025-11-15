import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { LifeCategory as BaseLifeCategory } from '@/shared/hooks/useLifeCategories';
import { GamifiedCTAButton } from '../../common';
import styles from './WeeklyMissions.module.css';

type MissionDifficulty = 'bronze' | 'silver' | 'gold';

type MissionStatus = 'pending' | 'active' | 'completed';

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

type WeeklyMissionsCategory = Pick<BaseLifeCategory, 'id' | 'name' | 'color' | 'icon'>;

interface WeeklyMissionsProps {
  category: WeeklyMissionsCategory;
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
};

const useWeekNumber = (): number => {
  return useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.max(1, Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7));
  }, []);
};

const WeeklyMissions = ({ category }: WeeklyMissionsProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isRibbonCollapsed, setRibbonCollapsed] = useState(false);
  const weekNumber = useWeekNumber();
  const baseMissions = useMemo(() => missionLibrary[category.id] ?? defaultMissions, [category.id]);

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

  const completedCount = missions.filter(mission => mission.status === 'completed').length;
  const allMissionsCompleted = completedCount === missions.length;

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
              <span className={styles.ribbonIcon}>{category.icon}</span>
              <div>
                <p className={styles.ribbonTitle}>{category.name}</p>
                <p className={styles.ribbonSubtitle}>
                  Week {weekNumber} • {category.name} Quest
                </p>
              </div>
            </div>
            <motion.div
              className={styles.ribbonWave}
              animate={prefersReducedMotion ? {} : { backgroundPosition: ['0% 50%', '200% 50%'] }}
              transition={
                prefersReducedMotion ? undefined : { duration: 6, repeat: Infinity, ease: 'linear' }
              }
            />
          </div>
        </motion.div>

        <div className={styles.panelGuide}>
          <p className={styles.panelGuideText}>
            Tap <strong>Start Mission</strong> when you are ready, then press and hold the glowing
            orb to log your win.
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
                className={styles.missionCardWrapper}
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

                    <GamifiedCTAButton
                      primaryLabel="Start Mission"
                      secondaryLabel="In Progress"
                      holdLabel="Mission Complete"
                      holdDuration={1000}
                      onHoldComplete={() => {
                        triggerCompletion(mission.id);
                      }}
                      onClick={() => handleStartMission(mission.id)}
                    />

                    <div className={styles.cardFooter}>
                      <div className={styles.coachStrip}>
                        <span className={styles.coachAvatar}>✨</span>
                        {mission.status === 'pending' && (
                          <p className={styles.cardHint}>
                            Tap <span className={styles.inlineHighlight}>Start Mission</span>, then
                            hold the orb when you finish the action.
                          </p>
                        )}
                        {mission.status === 'active' && (
                          <p className={styles.cardHint}>
                            Keep momentum—press and hold the orb until it blooms to log your win.
                          </p>
                        )}
                        {mission.status === 'completed' && (
                          <p className={styles.cardHint}>
                            Beautiful! Banked into your vault. Stretch missions await if you want
                            extra shine.
                          </p>
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

export default WeeklyMissions;
