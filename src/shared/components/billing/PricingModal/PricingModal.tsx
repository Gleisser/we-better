import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSettingsTranslation } from '@/shared/hooks/useTranslation';
import PricingExperience from '@/shared/components/billing/PricingExperience/PricingExperience';
import type {
  BillingCycle,
  BillingPlanCatalogItem,
  BillingSummary,
  PlanCode,
} from '@/core/services/billingService';
import styles from './PricingModal.module.css';

type PaidPlanCode = Exclude<PlanCode, 'free'>;

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: BillingPlanCatalogItem[];
  billingInfo: BillingSummary | null;
  selectedCycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  onCheckout: (plan: PaidPlanCode, cycle: BillingCycle) => void;
  onPortalManage: () => void;
  isLoading?: boolean;
  isBusy?: boolean;
  error?: string | null;
}

const OVERLAY_TRANSITION = { duration: 0.18, ease: 'easeOut' } as const;
const DIALOG_TRANSITION = { duration: 0.22, ease: 'easeOut' } as const;

export const PricingModal = ({
  isOpen,
  onClose,
  plans,
  billingInfo,
  selectedCycle,
  onCycleChange,
  onCheckout,
  onPortalManage,
  isLoading = false,
  isBusy = false,
  error = null,
}: PricingModalProps): JSX.Element | null => {
  const { t } = useSettingsTranslation();
  const prefersReducedMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={t('settings.billing.pricing.modalAriaLabel') as string}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : OVERLAY_TRANSITION}
          onClick={onClose}
        >
          <motion.div
            className={styles.dialog}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98, y: 8 }}
            transition={prefersReducedMotion ? { duration: 0 } : DIALOG_TRANSITION}
            onClick={event => event.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t('settings.billing.pricing.close') as string}
            >
              ✕
            </button>

            <PricingExperience
              plans={plans}
              billingInfo={billingInfo}
              selectedCycle={selectedCycle}
              onCycleChange={onCycleChange}
              onCheckout={onCheckout}
              onPortalManage={onPortalManage}
              surface="modal"
              isLoading={isLoading}
              isBusy={isBusy}
              error={error}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PricingModal;
