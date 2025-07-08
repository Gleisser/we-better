import React, { useState, useRef, useEffect } from 'react';
import { TwoFactorModal } from './TwoFactorSetup/TwoFactorModal';
import styles from './TwoFactorSetup/TwoFactorSetup.module.css';

interface DisableTwoFactorProps {
  isOpen: boolean;
  onClose: () => void;
  onDisable: (token: string) => Promise<void>;
}

export const DisableTwoFactor = ({
  isOpen,
  onClose,
  onDisable,
}: DisableTwoFactorProps): JSX.Element => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCode(Array(6).fill(''));
      setError(null);
      setIsLoading(false);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }
  }, [isOpen]);

  const handleInput = (index: number, value: string): void => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent): void => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setError('Please enter all 6 digits');
      setIsLoading(false);
      return;
    }
    try {
      await onDisable(codeStr);
      onClose();
    } catch (err) {
      let errorMessage = 'Failed to disable 2FA';

      if (err instanceof Error) {
        // Handle specific error messages
        if (err.message.includes('verification')) {
          errorMessage = 'Invalid verification code. Please try again.';
        } else if (err.message.includes('No 2FA factors found')) {
          errorMessage = 'No active 2FA found on your account.';
          // Close the modal since there's nothing to disable
          setTimeout(() => onClose(), 2000);
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TwoFactorModal isOpen={isOpen} onClose={onClose}>
      <div
        className={styles.stage}
        style={{ fontFamily: 'Plus Jakarta Sans, jakarta-plus, sans-serif' }}
      >
        <h2 className={styles.title} style={{ marginBottom: 8 }}>
          Disable Two-Factor Authentication
        </h2>
        <p className={styles.description} style={{ marginBottom: 24 }}>
          Enter the 6-digit code from your authenticator app to disable two-factor authentication.
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.codeInput} style={{ marginBottom: 8 }}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={styles.codeDigit}
                disabled={isLoading}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
          <button
            type="submit"
            className={styles.finishButton}
            style={{ marginTop: 24, marginBottom: 12 }}
            disabled={isLoading || code.some(d => !d)}
          >
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            style={{ width: '100%', background: '#f3f0ff', color: '#6f42c1', marginBottom: 0 }}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </form>
      </div>
    </TwoFactorModal>
  );
};
