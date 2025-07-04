import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCopy } from 'react-icons/fi';
import styles from './TwoFactorSetup.module.css';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  manualCode: string;
  isLoading?: boolean;
  error?: string;
  onNext: () => void;
}

export const QRCodeDisplay = ({
  qrCodeUrl,
  manualCode,
  isLoading,
  error,
  onNext,
}: QRCodeDisplayProps): JSX.Element => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(manualCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Setting up your 2FA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryButton}>Try Again</button>
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>QR code data is missing. Please try again.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={styles.stage}
    >
      <h2 className={styles.title}>Scan QR Code</h2>
      <p className={styles.description}>
        Open your authenticator app and scan this QR code to set up 2FA.
      </p>

      <div className={styles.qrContainer}>
        <img src={qrCodeUrl} alt="2FA QR Code" className={styles.qrCode} />
      </div>

      <div className={styles.manualCode}>
        <span className={styles.codeText}>{manualCode}</span>
        <button onClick={handleCopy} className={styles.copyButton} aria-label="Copy code">
          <FiCopy size={20} />
          <span className={styles.copyFeedback}>{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      <p className={styles.manualInstructions}>
        Can't scan the QR code? You can manually enter the code above in your authenticator app.
      </p>

      <button onClick={onNext} className={styles.nextButton}>
        Next
      </button>
    </motion.div>
  );
};
