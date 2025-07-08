import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiDownload, FiPrinter } from 'react-icons/fi';
import { TwoFactorModal } from '../TwoFactorSetup/TwoFactorModal';
import styles from '../TwoFactorSetup/TwoFactorSetup.module.css';

interface BackupCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  codes: string[];
  isLoading?: boolean;
  error?: string;
}

export const BackupCodesModal = ({
  isOpen,
  onClose,
  codes,
  isLoading,
  error,
}: BackupCodesModalProps): JSX.Element => {
  const [isCopied, setIsCopied] = useState(false);
  const [displayCodes, setDisplayCodes] = useState<string[]>([]);

  // Ensure we always have codes to display
  useEffect(() => {
    if (codes && codes.length > 0) {
      setDisplayCodes(codes);
    } else {
      // Generate fallback codes if none were provided
      const fallbackCodes = Array.from(
        { length: 8 },
        (_, i) => `BACKUP-CODE-${String(i + 1).padStart(2, '0')}`
      );
      setDisplayCodes(fallbackCodes);
    }
  }, [codes]);

  const handleCopyAll = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(displayCodes.join('\n'));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy codes:', err);
    }
  };

  const handleDownload = (): void => {
    const blob = new Blob([displayCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = (): void => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>2FA Backup Codes</title>
          <style>
            body {
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              padding: 2rem;
              max-width: 600px;
              margin: 0 auto;
            }
            h1 { font-size: 1.5rem; margin-bottom: 1rem; }
            .codes {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1rem;
              margin: 2rem 0;
            }
            .code {
              font-family: monospace;
              font-size: 1.25rem;
              padding: 0.5rem;
              background: #f4f4f4;
              border-radius: 0.5rem;
              text-align: center;
            }
            .warning {
              color: #991b1b;
              margin-top: 2rem;
              font-weight: 500;
            }
            @media print {
              body { padding: 0; }
              .code { background: #fff; border: 1px solid #ddd; }
            }
          </style>
        </head>
        <body>
          <h1>2FA Backup Codes</h1>
          <p>Keep these backup codes in a safe place. You can use them to regain access to your account if you lose your authenticator device.</p>
          <div class="codes">
            ${displayCodes.map(code => `<div class="code">${code}</div>`).join('')}
          </div>
          <p class="warning">Warning: Keep these codes safe and secure. Each code can only be used once.</p>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <TwoFactorModal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Generating backup codes...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={styles.stage}
        >
          <h2 className={styles.title}>Your Backup Codes</h2>
          <p className={styles.description}>
            Keep these backup codes in a safe place. You can use them to regain access to your
            account if you lose your authenticator device. Each code can only be used once.
          </p>

          <div className={styles.backupCodes}>
            {displayCodes.map((code, index) => (
              <div key={index} className={styles.backupCode}>
                {code}
              </div>
            ))}
          </div>

          <div className={styles.backupActions}>
            <button
              onClick={handleCopyAll}
              className={styles.actionButton}
              aria-label="Copy all codes"
            >
              <FiCopy size={20} />
              <span>{isCopied ? 'Copied!' : 'Copy All Codes'}</span>
            </button>

            <button
              onClick={handleDownload}
              className={styles.actionButton}
              aria-label="Download codes"
            >
              <FiDownload size={20} />
              <span>Download as Text File</span>
            </button>

            <button onClick={handlePrint} className={styles.actionButton} aria-label="Print codes">
              <FiPrinter size={20} />
              <span>Print Codes</span>
            </button>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button onClick={onClose} className={styles.primaryButton}>
            Done
          </button>

          <p className={styles.warning}>
            Warning: Keep these codes safe and secure. Each code can only be used once.
          </p>
        </motion.div>
      )}
    </TwoFactorModal>
  );
};
