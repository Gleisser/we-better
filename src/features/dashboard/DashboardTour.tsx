import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, X } from 'lucide-react';
import { Portal } from '@/shared/components/common/Portal/Portal';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDashboardTranslation } from '@/shared/hooks/useTranslation';
import styles from './DashboardTour.module.css';

const TOUR_VERSION = 'v1';

export type GuidedTourStep = {
  id: string;
  selector?: string;
};

type TourTranslation = (key: string, options?: Record<string, unknown>) => string;

interface GuidedTourProps {
  tourId: string;
  steps: GuidedTourStep[];
  t: TourTranslation;
  translationPrefix?: string;
  autoStartDelay?: number;
}

type TargetRect = Pick<DOMRect, 'top' | 'left' | 'right' | 'bottom' | 'width' | 'height'>;

const DASHBOARD_TOUR_STEPS: GuidedTourStep[] = [
  { id: 'welcome' },
  {
    id: 'navigation',
    selector: '[data-tour="main-navigation"], [data-tour="mobile-navigation"]',
  },
  { id: 'quote', selector: '[data-dashboard-widget="quote"]' },
  { id: 'cards', selector: '[data-dashboard-widget="cards"]' },
  { id: 'radial', selector: '[data-dashboard-widget="radial"]' },
  { id: 'mood', selector: '[data-dashboard-widget="mood"]' },
  { id: 'dreamBoard', selector: '[data-dashboard-widget="dreamBoard"]' },
  { id: 'habits', selector: '[data-dashboard-widget="habits"]' },
  { id: 'goals', selector: '[data-dashboard-widget="goals"]' },
  { id: 'finish' },
];

const getStorageKey = (tourId: string, userId: string): string =>
  `we-better:${tourId}-tour:${TOUR_VERSION}:${userId}`;

const getTargetElement = (selector?: string): HTMLElement | null => {
  if (!selector) return null;
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return (
    elements.find(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) ?? null
  );
};

const getRect = (selector?: string): TargetRect | null =>
  getTargetElement(selector)?.getBoundingClientRect() ?? null;

export const GuidedTour = ({
  tourId,
  steps,
  t,
  translationPrefix = 'tour',
  autoStartDelay = 650,
}: GuidedTourProps): JSX.Element => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const launchButtonRef = useRef<HTMLButtonElement>(null);
  const currentStep = steps[stepIndex];
  const storageKey = user?.id ? getStorageKey(tourId, user.id) : null;
  const isLastStep = stepIndex === steps.length - 1;

  const finishTour = useCallback(() => {
    if (storageKey) localStorage.setItem(storageKey, 'completed');
    setIsOpen(false);
    setStepIndex(0);
    window.requestAnimationFrame(() => launchButtonRef.current?.focus());
  }, [storageKey]);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!storageKey || localStorage.getItem(storageKey)) return;
    const timeoutId = window.setTimeout(() => setIsOpen(true), autoStartDelay);
    return () => window.clearTimeout(timeoutId);
  }, [autoStartDelay, storageKey]);

  useEffect(() => {
    if (!isOpen) return;
    setTargetRect(null);
    let target = getTargetElement(currentStep.selector);

    const scrollToTarget = (element: HTMLElement): void => {
      element.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    };

    if (target) scrollToTarget(target);

    let frameId = 0;
    const updatePosition = (): void => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => setTargetRect(getRect(currentStep.selector)));
    };

    updatePosition();
    const settleTimeout = window.setTimeout(updatePosition, 450);
    let targetObserver: MutationObserver | null = null;
    if (!target && currentStep.selector) {
      targetObserver = new MutationObserver(() => {
        target = getTargetElement(currentStep.selector);
        if (!target) return;
        scrollToTarget(target);
        updatePosition();
        targetObserver?.disconnect();
      });
    }
    targetObserver?.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const focusTimeout = window.setTimeout(
      () => dialogRef.current?.focus({ preventScroll: true }),
      0
    );

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(settleTimeout);
      window.clearTimeout(focusTimeout);
      targetObserver?.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') finishTour();
      if (event.key === 'ArrowRight') setStepIndex(value => Math.min(value + 1, steps.length - 1));
      if (event.key === 'ArrowLeft') setStepIndex(value => Math.max(value - 1, 0));
      if (event.key === 'Tab' && dialogRef.current) {
        const controls = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), [href], [tabindex="0"]'
          )
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finishTour, isOpen, steps.length]);

  const cardStyle = useMemo(() => {
    if (!targetRect) return undefined;
    const margin = 20;
    const cardWidth = Math.min(390, window.innerWidth - margin * 2);
    const fitsBelow = window.innerHeight - targetRect.bottom > 330;
    const top = fitsBelow
      ? Math.min(targetRect.bottom + 18, window.innerHeight - 300)
      : Math.max(margin, targetRect.top - 286);
    const left = Math.max(
      margin,
      Math.min(
        targetRect.left + targetRect.width / 2 - cardWidth / 2,
        window.innerWidth - cardWidth - margin
      )
    );
    const maxHeight = Math.max(240, window.innerHeight - top - margin);
    return { top, left, width: cardWidth, maxHeight };
  }, [targetRect]);

  const spotlightStyle = targetRect
    ? {
        top: Math.max(8, targetRect.top - 8),
        left: Math.max(8, targetRect.left - 8),
        width: Math.min(window.innerWidth - 16, targetRect.width + 16),
        height: Math.min(window.innerHeight - 16, targetRect.height + 16),
      }
    : undefined;

  return (
    <>
      <button
        ref={launchButtonRef}
        className={styles.launchButton}
        type="button"
        onClick={startTour}
      >
        <Compass aria-hidden="true" />
        <span>{t(`${translationPrefix}.launch`)}</span>
      </button>

      {isOpen ? (
        <Portal>
          <div className={styles.tourLayer} aria-live="polite">
            {targetRect ? (
              <>
                <div
                  className={styles.scrimTop}
                  style={{ height: Math.max(0, targetRect.top - 8) }}
                />
                <div
                  className={styles.scrimLeft}
                  style={{
                    top: targetRect.top - 8,
                    width: Math.max(0, targetRect.left - 8),
                    height: targetRect.height + 16,
                  }}
                />
                <div
                  className={styles.scrimRight}
                  style={{
                    top: targetRect.top - 8,
                    left: targetRect.right + 8,
                    height: targetRect.height + 16,
                  }}
                />
                <div className={styles.scrimBottom} style={{ top: targetRect.bottom + 8 }} />
                <div className={styles.spotlight} style={spotlightStyle} aria-hidden="true" />
              </>
            ) : (
              <div className={styles.fullScrim} />
            )}

            <div
              ref={dialogRef}
              className={`${styles.card} ${targetRect ? '' : styles.cardCentered}`}
              style={cardStyle}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${tourId}-tour-title`}
              aria-describedby={`${tourId}-tour-description`}
              tabIndex={-1}
            >
              <div className={styles.scrollContent}>
                <div className={styles.cardGlow} aria-hidden="true" />
                <div className={styles.cardHeader}>
                  <span className={styles.eyebrow}>{t(`${translationPrefix}.eyebrow`)}</span>
                  <button
                    className={styles.closeButton}
                    type="button"
                    onClick={finishTour}
                    aria-label={t(`${translationPrefix}.close`)}
                  >
                    <X aria-hidden="true" />
                  </button>
                </div>

                <div className={styles.stepIcon} aria-hidden="true">
                  {isLastStep ? <Check /> : <Compass />}
                </div>
                <h2 id={`${tourId}-tour-title`}>
                  {t(`${translationPrefix}.steps.${currentStep.id}.title`)}
                </h2>
                <p id={`${tourId}-tour-description`}>
                  {t(`${translationPrefix}.steps.${currentStep.id}.description`)}
                </p>

                <div className={styles.progressHeader}>
                  <span>
                    {t(`${translationPrefix}.progress`, {
                      current: stepIndex + 1,
                      total: steps.length,
                    })}
                  </span>
                  {!isLastStep ? (
                    <button
                      type="button"
                      onClick={() => setStepIndex(value => Math.min(value + 1, steps.length - 1))}
                    >
                      {t(`${translationPrefix}.skipStep`)}
                    </button>
                  ) : null}
                </div>
                <div className={styles.progressTrack} aria-hidden="true">
                  <span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => setStepIndex(value => Math.max(value - 1, 0))}
                  disabled={stepIndex === 0}
                >
                  <ArrowLeft aria-hidden="true" />
                  {t(`${translationPrefix}.back`)}
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={isLastStep ? finishTour : () => setStepIndex(value => value + 1)}
                >
                  {t(`${translationPrefix}.${isLastStep ? 'finish' : 'next'}`)}
                  {isLastStep ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
};

const DashboardTour = (): JSX.Element => {
  const { t } = useDashboardTranslation();

  return <GuidedTour tourId="dashboard" steps={DASHBOARD_TOUR_STEPS} t={t} />;
};

export default DashboardTour;
