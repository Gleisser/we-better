import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './TwoFactorSetup.module.css';

interface CodeVerificationProps {
  onVerify: (code: string) => Promise<boolean>;
  isLoading?: boolean;
  error?: string;
}

export const CodeVerification = ({
  onVerify,
  isLoading,
  error,
}: CodeVerificationProps): JSX.Element => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInput = (index: number, value: string): void => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setValidationError(null);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string): Promise<void> => {
    if (fullCode.length !== 6) {
      setValidationError('Please enter all 6 digits');
      return;
    }

    try {
      const success = await onVerify(fullCode);
      if (!success) {
        setValidationError('Invalid verification code');
        // Clear inputs on error
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setValidationError('An error occurred during verification');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={styles.stage}
    >
      <h2 className={styles.title}>Enter Verification Code</h2>
      <p className={styles.description}>Enter the 6-digit code from your authenticator app.</p>

      <div className={styles.codeInput}>
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
            className={styles.codeDigit}
            disabled={isLoading}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {(error || validationError) && <p className={styles.errorText}>{error || validationError}</p>}

      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Verifying code...</p>
        </div>
      )}
    </motion.div>
  );
};
