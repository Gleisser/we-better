import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import styles from './CardsWidget.module.css';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { affirmationService } from '@/core/services/affirmationService';
import {
  checkTodayStatus,
  logAffirmation as logAffirmationEntry,
} from '@/core/services/affirmationsService';

type AffirmationCategory =
  | 'personal'
  | 'beauty'
  | 'blessing'
  | 'gratitude'
  | 'happiness'
  | 'health'
  | 'love'
  | 'money'
  | 'sleep'
  | 'spiritual';

interface CategoryTheme {
  icon: string;
  label: string;
  accent: string;
}

type CategoryThemeMap = Record<AffirmationCategory, CategoryTheme>;

interface AffirmationCard {
  id: string;
  text: string;
  category: AffirmationCategory;
  label: string;
  icon: string;
  accent: string;
}

const buildCategoryTheme = (t: (key: string) => string | string[]): CategoryThemeMap => ({
  personal: {
    icon: '💫',
    label: t('widgets.affirmation.categories.personal') as string,
    accent: '#ec4899',
  },
  beauty: {
    icon: '✨',
    label: t('widgets.affirmation.categories.beauty') as string,
    accent: '#f472b6',
  },
  blessing: {
    icon: '🙌',
    label: t('widgets.affirmation.categories.blessing') as string,
    accent: '#8b5cf6',
  },
  gratitude: {
    icon: '🙏',
    label: t('widgets.affirmation.categories.gratitude') as string,
    accent: '#f59e0b',
  },
  happiness: {
    icon: '😊',
    label: t('widgets.affirmation.categories.happiness') as string,
    accent: '#facc15',
  },
  health: {
    icon: '💪',
    label: t('widgets.affirmation.categories.health') as string,
    accent: '#22c55e',
  },
  love: {
    icon: '❤️',
    label: t('widgets.affirmation.categories.love') as string,
    accent: '#ef4444',
  },
  money: {
    icon: '💰',
    label: t('widgets.affirmation.categories.money') as string,
    accent: '#10b981',
  },
  sleep: {
    icon: '😴',
    label: t('widgets.affirmation.categories.sleep') as string,
    accent: '#6366f1',
  },
  spiritual: {
    icon: '🕊️',
    label: t('widgets.affirmation.categories.spiritual') as string,
    accent: '#a855f7',
  },
});

const hexToRgba = (hex: string, alpha: number): string => {
  const sanitized = hex.replace('#', '').trim();

  if (![3, 6].includes(sanitized.length)) {
    return hex;
  }

  const normalized =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map(char => char + char)
          .join('')
      : sanitized;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  const clampedAlpha = Math.min(Math.max(alpha, 0), 1);
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
};

const createCardBackground = (accent: string): string => {
  const tinted = hexToRgba(accent, 0.28);
  const overlay = 'rgba(15, 23, 42, 0.92)';
  return `linear-gradient(140deg, ${tinted} 0%, ${overlay} 100%)`;
};

const CARD_OUT_DURATION = 600;
const DEFAULT_ERROR_MESSAGE = 'Unable to load affirmations right now.';
const CELEBRATION_PARTICLES = 12;
const celebrationPalette = ['#f472b6', '#a855f7', '#38bdf8', '#facc15', '#4ade80', '#f97316'];

const CardsWidget = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const categoryTheme = useMemo(() => buildCategoryTheme(t), [t]);

  const [cards, setCards] = useState<AffirmationCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outIndex, setOutIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAffirming, setIsAffirming] = useState(false);
  const [hasAffirmedToday, setHasAffirmedToday] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAffirmations = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const categories = Object.keys(categoryTheme) as AffirmationCategory[];

        const cardsByCategory = await Promise.all(
          categories.map(async category => {
            try {
              const response = await affirmationService.getAffirmationsByCategory(category, {
                sort: 'publishedAt:desc',
                pagination: {
                  page: 1,
                  pageSize: 5,
                },
                populate: ['categories'],
              });

              const mappedAffirmations = affirmationService.mapAffirmationResponse(response);

              if (mappedAffirmations.length === 0) {
                return null;
              }

              const selectedAffirmation =
                mappedAffirmations[Math.floor(Math.random() * mappedAffirmations.length)];
              const theme = categoryTheme[category];

              if (!theme) {
                return null;
              }

              return {
                id: selectedAffirmation.documentId ?? `affirmation-${selectedAffirmation.id}`,
                text: selectedAffirmation.text,
                category,
                label: theme.label,
                icon: theme.icon,
                accent: theme.accent,
              } satisfies AffirmationCard;
            } catch (categoryError) {
              console.error(`Failed to load affirmations for category ${category}:`, categoryError);
              return null;
            }
          })
        );

        if (!isMounted) {
          return;
        }

        const validCards = cardsByCategory.filter((card): card is AffirmationCard => card !== null);

        if (validCards.length === 0) {
          setCards([]);
          setError('No affirmations available right now.');
          return;
        }

        setCards(validCards);
        setCurrentIndex(0);
        setOutIndex(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error('Failed to load affirmations for CardsWidget:', err);
        setCards([]);
        setError(DEFAULT_ERROR_MESSAGE);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadAffirmations();

    return () => {
      isMounted = false;
    };
  }, [categoryTheme]);

  useEffect(() => {
    let isMounted = true;

    const verifyAffirmationStatus = async (): Promise<void> => {
      try {
        const status = await checkTodayStatus();
        if (isMounted) {
          setHasAffirmedToday(status);
        }
      } catch (statusError) {
        console.error('Unable to verify daily affirmation status:', statusError);
      }
    };

    void verifyAffirmationStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isCelebrating) {
      return;
    }

    const timer = window.setTimeout(() => setIsCelebrating(false), 1400);
    return () => window.clearTimeout(timer);
  }, [isCelebrating]);

  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length) {
      setCurrentIndex(0);
    }
  }, [cards.length, currentIndex]);

  useEffect(() => {
    if (outIndex === null) {
      return;
    }

    const timer = window.setTimeout(() => setOutIndex(null), CARD_OUT_DURATION);
    return () => window.clearTimeout(timer);
  }, [outIndex]);

  const goToIndex = useCallback(
    (targetIndex: number) => {
      if (cards.length === 0) {
        return;
      }

      const normalizedIndex = ((targetIndex % cards.length) + cards.length) % cards.length;

      setCurrentIndex(previousIndex => {
        if (previousIndex === normalizedIndex) {
          return previousIndex;
        }

        if (previousIndex >= 0 && previousIndex < cards.length) {
          setOutIndex(previousIndex);
        } else {
          setOutIndex(null);
        }

        return normalizedIndex;
      });
    },
    [cards.length]
  );

  const handleCardClick = useCallback(
    (index: number) => {
      if (index === currentIndex) {
        return;
      }

      goToIndex(index);
    },
    [currentIndex, goToIndex]
  );

  const handleRefresh = useCallback(() => {
    if (cards.length <= 1) {
      return;
    }

    goToIndex(currentIndex + 1);
  }, [cards.length, currentIndex, goToIndex]);

  const handleKeyboardNavigation = useCallback(
    (event: KeyboardEvent<HTMLLIElement>, index: number) => {
      if (cards.length === 0) {
        return;
      }

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleCardClick(index);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          goToIndex(currentIndex + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          goToIndex(currentIndex - 1);
          break;
        default:
          break;
      }
    },
    [cards.length, currentIndex, goToIndex, handleCardClick]
  );

  const celebrationParticles = useMemo(
    () => Array.from({ length: CELEBRATION_PARTICLES }, (_, index) => index),
    []
  );

  const nextIndex = cards.length > 0 ? (currentIndex + 1) % cards.length : -1;
  const activeCard = cards.length > 0 ? cards[currentIndex] : undefined;
  const activeCardId = cards.length > 0 ? cards[currentIndex]?.id : undefined;
  const isRotateDisabled = loading || cards.length <= 1;
  const isAffirmDisabled = loading || !activeCard || isAffirming || hasAffirmedToday;

  const handleAffirm = useCallback(async () => {
    if (isAffirming || hasAffirmedToday || !activeCard) {
      return;
    }

    try {
      setIsAffirming(true);
      setIsCelebrating(true);
      const logEntry = await logAffirmationEntry(activeCard.text);

      if (logEntry) {
        setHasAffirmedToday(true);
      }
    } catch (affirmError) {
      console.error('Failed to register affirmation from CardsWidget:', affirmError);
    } finally {
      setIsAffirming(false);
    }
  }, [activeCard, hasAffirmedToday, isAffirming]);

  const buttonClassNames = [styles.affirmButton];
  if (isAffirming) {
    buttonClassNames.push(styles.affirming);
  }
  if (hasAffirmedToday) {
    buttonClassNames.push(styles.affirmed);
  }

  const affirmIcon = hasAffirmedToday ? '✔️' : '✨';
  const affirmLabel = hasAffirmedToday
    ? 'Affirmed Today'
    : (t('widgets.affirmation.iAffirm') as string);
  const affirmSubLabel = hasAffirmedToday
    ? 'Daily intention locked in'
    : "Celebrate today's affirmation";

  return (
    <section className={styles.container} aria-label="Affirmation cards widget">
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <h2 className={styles.title}>Affirmation Cards</h2>
          <p className={styles.subtitle}>Tap a card to surface the next uplifting statement.</p>
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={isRotateDisabled}
        >
          Next affirmation
        </button>
      </header>

      <div className={styles.cardsWrapper}>
        {loading ? (
          <div className={styles.status} role="status">
            Loading affirmations…
          </div>
        ) : error ? (
          <div className={styles.status} role="alert">
            {error}
          </div>
        ) : cards.length === 0 ? (
          <div className={styles.status}>No affirmations available yet.</div>
        ) : (
          <ul className={styles.cards} role="listbox" aria-activedescendant={activeCardId}>
            {cards.map((card, index) => {
              const classNames = [styles.card];

              if (index === currentIndex) {
                classNames.push(styles.cardCurrent);
              } else if (index === nextIndex) {
                classNames.push(styles.cardNext);
              } else if (index === outIndex) {
                classNames.push(styles.cardOut);
              }

              const accentBorder = hexToRgba(card.accent, 0.45);
              const accentBackground = createCardBackground(card.accent);
              const tagBorder = hexToRgba(card.accent, 0.35);
              const tagBackground = hexToRgba(card.accent, 0.18);

              const cardStyle: CSSProperties = {
                borderColor: accentBorder,
                background: accentBackground,
                ['--accent-color' as const]: card.accent,
              };

              const tagStyle: CSSProperties = {
                borderColor: tagBorder,
                background: tagBackground,
                color: card.accent,
              };

              return (
                <li
                  key={card.id}
                  id={card.id}
                  className={classNames.join(' ')}
                  style={cardStyle}
                  role="option"
                  aria-selected={index === currentIndex}
                  tabIndex={index === currentIndex ? 0 : -1}
                  onClick={() => handleCardClick(index)}
                  onKeyDown={event => handleKeyboardNavigation(event, index)}
                >
                  <span className={styles.srOnly}>
                    {card.label} affirmation. {index === currentIndex ? 'Active.' : 'Inactive.'}
                  </span>

                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.tag} style={tagStyle}>
                        <span className={styles.tagIcon} aria-hidden="true">
                          {card.icon}
                        </span>
                        {card.label}
                      </span>
                    </div>

                    <p className={styles.affirmationText}>&ldquo;{card.text}&rdquo;</p>

                    <div className={styles.cardFooter}>
                      <span className={styles.hint}>Tap or use arrow keys to rotate</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={styles.actions}>
        <div
          className={`${styles.celebrationOverlay} ${
            isCelebrating ? styles.celebrationActive : ''
          }`}
          aria-hidden="true"
        >
          {celebrationParticles.map(particle => {
            const totalParticles = celebrationParticles.length || 1;
            const angle = (particle / totalParticles) * Math.PI * 2;
            const distance = 70 + (particle % 3) * 26;
            const wobble = Math.sin(particle * 1.2) * 12;
            const x = Math.cos(angle) * distance + wobble;
            const y = Math.sin(angle) * distance + wobble * 0.4;
            const particleStyle: CSSProperties = {
              ['--sparkle-delay' as const]: `${particle * 38}ms`,
              ['--sparkle-x' as const]: `${x}px`,
              ['--sparkle-y' as const]: `${y}px`,
              ['--sparkle-color' as const]: activeCard
                ? hexToRgba(activeCard.accent, 0.95)
                : celebrationPalette[particle % celebrationPalette.length],
              ['--sparkle-secondary' as const]:
                celebrationPalette[(particle + 3) % celebrationPalette.length],
            };

            return <span key={particle} className={styles.sparkle} style={particleStyle} />;
          })}
        </div>
        <button
          type="button"
          className={buttonClassNames.join(' ')}
          onClick={handleAffirm}
          disabled={isAffirmDisabled}
          aria-label={affirmLabel}
        >
          <span className={styles.affirmBackdrop} aria-hidden="true" />
          <span className={styles.affirmIcon} aria-hidden="true">
            {affirmIcon}
          </span>
          <span className={styles.affirmCopy}>
            <span className={styles.affirmLabel}>{affirmLabel}</span>
            <span className={styles.affirmSubLabel}>{affirmSubLabel}</span>
          </span>
        </button>
      </div>
    </section>
  );
};

export default CardsWidget;
