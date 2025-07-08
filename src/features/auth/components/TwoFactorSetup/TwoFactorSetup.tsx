import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { setup2FA, verify2FA, get2FAStatus, logSecurityEvent } from '@/core/services';
import { TwoFactorModal } from './TwoFactorModal';
import { QRCodeDisplay } from './QRCodeDisplay';
import { CodeVerification } from './CodeVerification';
import { BackupCodes } from './BackupCodes';
import styles from './TwoFactorSetup.module.css';

type SetupStage = 'welcome' | 'qr-code' | 'verify' | 'backup';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialSetupData?: {
    qrCode?: string;
    manualCode?: string;
  };
}

export const TwoFactorSetup: React.FC<Props> = ({
  isOpen,
  onClose,
  onComplete,
  initialSetupData,
}) => {
  const [stage, setStage] = useState<SetupStage>('welcome');
  const [setupData, setSetupData] = useState<{
    qrCode?: string;
    manualCode?: string;
    backupCodes?: string[];
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_verificationAttempts, setVerificationAttempts] = useState(0);
  // Store backup codes in a separate state to prevent them from being lost
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Initialize setup data when initialSetupData changes
  useEffect(() => {
    if (initialSetupData) {
      // Directly set the data without using prev state
      setSetupData({
        qrCode: initialSetupData.qrCode,
        manualCode: initialSetupData.manualCode,
      });

      // Move to QR code stage immediately if we have data
      if (stage === 'welcome') {
        setStage('qr-code');
      }
    }
  }, [initialSetupData, stage]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStage('welcome');
      setSetupData({});
      setError(null);
      setVerificationAttempts(0);
      // Don't reset backup codes when modal closes to prevent them from being lost
    }
  }, [isOpen]);

  // Handle session expiry
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        // Check session validity when tab becomes visible
        get2FAStatus().catch((error: Error) => {
          if (error.message.includes('Session expired')) {
            toast.error('Your session has expired. Please refresh the page and try again.');
            onClose();
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onClose]);

  const handleStart = async (): Promise<void> => {
    if (initialSetupData?.qrCode) {
      setStage('qr-code');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await setup2FA();

      if (!response || !response.setup) {
        console.error('Setup2FA failed - no response or setup data:', response);
        throw new Error('Failed to start 2FA setup - missing setup data');
      }

      setSetupData({
        qrCode: response.setup.qr_code_url,
        manualCode: response.setup.manual_entry_key,
      });
      setStage('qr-code');

      // Log security event
      await logSecurityEvent('2fa_setup_started', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in handleStart:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast.error('Failed to start 2FA setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await verify2FA({ token: code });

      if (!response || !response.verification) {
        console.error('Verification failed:', response);
        throw new Error(response?.message || 'Verification failed');
      }

      if (response.verification.success) {
        // Store backup codes in the separate state
        const codes = response.verification.backup_codes || [];
        setBackupCodes(codes);

        // Also update setupData
        setSetupData(prev => ({
          ...prev,
          backupCodes: codes,
        }));

        setStage('backup');

        // Log security event
        await logSecurityEvent('2fa_setup_verified', {
          timestamp: new Date().toISOString(),
        });
        return true;
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Error in handleVerification:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);

      // Handle rate limiting errors
      if (
        errorMessage.includes('Rate limit exceeded') ||
        errorMessage.includes('Too many attempts')
      ) {
        console.warn('Rate limit or too many attempts:', errorMessage);
        toast.error(errorMessage, {
          duration: 10000, // Show for longer
        });
        // If locked out, close the modal
        if (errorMessage.includes('Too many attempts')) {
          onClose();
        }
      } else {
        setVerificationAttempts(prev => prev + 1);
        toast.error('Invalid verification code. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupConfirm = async (): Promise<void> => {
    try {
      await logSecurityEvent('2fa_setup_completed', {
        timestamp: new Date().toISOString(),
      });
      onComplete();
      toast.success('Two-factor authentication has been enabled successfully.');
    } catch (error) {
      console.error('Error completing 2FA setup:', error);
    }
  };

  const handleCancel = async (): Promise<void> => {
    try {
      await logSecurityEvent('2fa_setup_cancelled', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging cancellation:', error);
    }
    onClose();
  };

  const renderStage = (): JSX.Element | null => {
    switch (stage) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.welcomeStage}
          >
            <h2>Enable Two-Factor Authentication</h2>
            <p>
              Enhance your account security by adding an extra layer of protection. You'll need an
              authenticator app like Google Authenticator or Authy.
            </p>
            <button onClick={handleStart} disabled={isLoading} className={styles.primaryButton}>
              {isLoading ? 'Setting up...' : 'Get Started'}
            </button>
          </motion.div>
        );

      case 'qr-code':
        return (
          <QRCodeDisplay
            qrCodeUrl={setupData.qrCode || ''}
            manualCode={setupData.manualCode || ''}
            isLoading={isLoading}
            error={error || undefined}
            onNext={() => setStage('verify')}
          />
        );

      case 'verify':
        return (
          <CodeVerification
            onVerify={handleVerification}
            isLoading={isLoading}
            error={error || undefined}
          />
        );

      case 'backup':
        // Use the separate backupCodes state here to ensure we always have the codes
        return (
          <BackupCodes
            codes={backupCodes.length > 0 ? backupCodes : setupData.backupCodes || []}
            onFinish={handleBackupConfirm}
            isLoading={false}
            error={error || undefined}
          />
        );

      default:
        return null;
    }
  };

  return (
    <TwoFactorModal
      isOpen={isOpen}
      onClose={handleCancel}
      className={styles.modal}
      closeOnEscape={stage === 'welcome'}
      showCloseButton={stage === 'welcome'}
    >
      <div className={styles.progressIndicator}>
        {['welcome', 'qr-code', 'verify', 'backup'].map((s, index) => (
          <div
            key={s}
            className={`${styles.progressStep} ${stage === s ? styles.active : ''} ${
              ['qr-code', 'verify', 'backup'].indexOf(stage) >= index ? styles.completed : ''
            }`}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">{renderStage()}</AnimatePresence>
    </TwoFactorModal>
  );
};
