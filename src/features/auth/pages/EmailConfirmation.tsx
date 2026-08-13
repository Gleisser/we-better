import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/core/services/authService';
import { useAuthTranslation } from '@/shared/hooks/useTranslation';
import styles from './Login.module.css';

const EmailConfirmation = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useAuthTranslation();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const confirmEmail = async (): Promise<void> => {
      try {
        const authCode = searchParams.get('code');
        if (!authCode) {
          throw new Error('Missing confirmation code');
        }

        const { user, error: confirmationError } = await authService.confirmEmail(authCode);
        if (confirmationError || !user) {
          throw confirmationError ?? new Error('The confirmation link is invalid');
        }

        setIsConfirmed(true);
        redirectTimer = setTimeout(() => navigate('/app/onboarding', { replace: true }), 1200);
      } catch {
        setError(t('confirmation.invalidLink'));
      } finally {
        setIsProcessing(false);
      }
    };

    void confirmEmail();

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [navigate, searchParams, t]);

  const continueToOnboarding = (): void => {
    navigate('/app/onboarding', { replace: true });
  };

  return (
    <div className={styles.confirmationContainer}>
      {isProcessing ? (
        <h2>{t('confirmation.processing')}</h2>
      ) : error ? (
        <>
          <h2>{t('confirmation.errorTitle')}</h2>
          <p className={styles.error}>{error}</p>
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className={styles.backToLogin}
          >
            {t('confirmation.backToLogin')}
          </button>
        </>
      ) : isConfirmed ? (
        <>
          <h2>{t('confirmation.successTitle')}</h2>
          <p>{t('confirmation.successDescription')}</p>
          <button type="button" onClick={continueToOnboarding} className={styles.submitButton}>
            {t('confirmation.continue')}
          </button>
        </>
      ) : null}
    </div>
  );
};

export default EmailConfirmation;
