import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import styles from './WeeklyMissions.module.css';

interface LifeCategory {
  id: string;
  name: string;
  color: {
    from: string;
    to: string;
  };
  icon: string;
}

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

interface WeeklyMissionsProps {
  category: LifeCategory;
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

const effortLabels: Record<MissionState['effort'], string> = {
  light: 'Light effort',
  moderate: 'Moderate effort',
  intense: 'High effort',
};

const difficultyBadges: Record<MissionDifficulty, string> = {
  bronze: 'Bronze Path',
  silver: 'Silver Path',
  gold: 'Gold Path',
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

  const [holdMission, setHoldMission] = useState<string | null>(null);
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

  const handleToggleStretch = (id: string): void => {
    setMissionStatus(id, mission => ({
      ...mission,
      isStretch: !mission.isStretch,
    }));
  };

  const triggerCompletion = (id: string): void => {
    setMissionStatus(id, mission => ({
      ...mission,
      status: 'completed',
    }));
  };

  const handleHoldStart = (id: string): void => {
    if (prefersReducedMotion) {
      triggerCompletion(id);
      return;
    }

    setHoldMission(id);
    timers.current[id] = window.setTimeout(() => {
      triggerCompletion(id);
      setHoldMission(null);
    }, 1200);
  };

  const handleHoldEnd = (id: string): void => {
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
    setHoldMission(current => (current === id ? null : current));
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
            orb to log your win. Toggle <strong>Add Stretch</strong> for an extra challenge.
          </p>
        </div>

        <div className={styles.missionGrid}>
          {missions.map(mission => (
            <motion.div
              key={mission.id}
              className={`${styles.missionCard} ${
                mission.status === 'completed' ? styles.missionCompleted : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.05 }}
            >
              <div className={`${styles.difficultyBadge} ${styles[mission.difficulty]}`}>
                <span className={styles.difficultyGlow} />
                <span className={styles.difficultyText}>
                  {difficultyBadges[mission.difficulty]}
                </span>
              </div>

              <motion.button
                className={`${styles.stretchBadge} ${mission.isStretch ? styles.stretchActive : ''}`}
                onClick={() => handleToggleStretch(mission.id)}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.2 }}
                type="button"
              >
                {mission.isStretch ? 'Stretch On' : 'Add Stretch'}
              </motion.button>

              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h4 className={styles.cardTitle}>{mission.title}</h4>
                  <span className={styles.cardEffort}>{effortLabels[mission.effort]}</span>
                </div>
                <p className={styles.cardDescription}>
                  {mission.isStretch ? mission.stretchGoal : mission.description}
                </p>
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>⏱️</span>
                    <span className={styles.metaText}>{mission.estimatedMinutes} min</span>
                  </div>
                  <motion.div
                    className={styles.energyPulse}
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            backgroundPosition: ['0% 50%', '200% 50%'],
                          }
                    }
                    transition={
                      prefersReducedMotion
                        ? undefined
                        : {
                            repeat: Infinity,
                            duration: 2.5,
                            ease: 'linear',
                          }
                    }
                  />
                </div>

                <div className={styles.cardActions}>
                  {mission.status === 'pending' && (
                    <motion.button
                      className={styles.primaryAction}
                      onClick={() => handleStartMission(mission.id)}
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                      type="button"
                    >
                      Start Mission
                    </motion.button>
                  )}

                  {mission.status === 'active' && (
                    <motion.button
                      className={`${styles.progressOrb} ${
                        holdMission === mission.id ? styles.progressHolding : ''
                      }`}
                      onPointerDown={() => handleHoldStart(mission.id)}
                      onPointerUp={() => handleHoldEnd(mission.id)}
                      onPointerLeave={() => handleHoldEnd(mission.id)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          triggerCompletion(mission.id);
                        }
                      }}
                      type="button"
                      aria-label="Hold to complete mission"
                    >
                      <span className={styles.progressCore} />
                    </motion.button>
                  )}

                  {mission.status === 'completed' && (
                    <motion.div
                      className={styles.completedBadge}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className={styles.completedIcon}>✔</span>
                      <span>Mission complete</span>
                    </motion.div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  {mission.status === 'pending' && (
                    <p className={styles.cardHint}>
                      Tap <span className={styles.inlineHighlight}>Start Mission</span> to begin,
                      then press and hold the orb when you are finished.
                    </p>
                  )}
                  {mission.status === 'active' && (
                    <p className={styles.cardHint}>
                      Press and hold the orb to complete this mission.
                    </p>
                  )}
                  {mission.status === 'completed' && (
                    <p className={styles.cardHint}>
                      Mission logged—celebrate your win and explore the stretch goal.
                    </p>
                  )}
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyMissions;
