import React from 'react';
import { motion } from 'framer-motion';
import styles from './Toggle.module.css';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  label?: string;
  'aria-label'?: string;
}

const Toggle = ({
  enabled,
  onChange,
  disabled = false,
  size = 'medium',
  className,
  label,
  'aria-label': ariaLabel,
}: ToggleProps): JSX.Element => {
  const handleToggle = (): void => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault();
      onChange(!enabled);
    }
  };

  // Get position values based on size
  const getPositionValue = (size: string): { off: string; on: string } => {
    switch (size) {
      case 'small':
        return { off: '2px', on: '22px' };
      case 'large':
        return { off: '2px', on: '38px' };
      default: // medium
        return { off: '2px', on: '30px' };
    }
  };

  const positions = getPositionValue(size);

  return (
    <div className={`${styles.toggleContainer} ${className || ''}`}>
      {label && (
        <label className={styles.label} htmlFor={`toggle-${label}`}>
          {label}
        </label>
      )}
      <button
        id={label ? `toggle-${label}` : undefined}
        className={`${styles.toggle} ${styles[size]} ${enabled ? styles.enabled : styles.disabled} ${
          disabled ? styles.disabledState : ''
        }`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-pressed={enabled}
        aria-label={ariaLabel || label || 'Toggle switch'}
        role="switch"
        type="button"
      >
        <div className={styles.toggleTrack}>
          <motion.div
            className={styles.toggleHandle}
            animate={{
              x: enabled ? positions.on : positions.off,
              scale: disabled ? 0.9 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
              duration: 0.3,
            }}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          />

          {/* ON/OFF Text */}
          <div className={styles.toggleText}>
            <motion.span
              className={`${styles.textOn} ${enabled ? styles.textVisible : styles.textHidden}`}
              animate={{
                opacity: enabled ? 1 : 0,
                x: enabled ? 0 : -10,
              }}
              transition={{ duration: 0.2, delay: enabled ? 0.1 : 0 }}
            >
              ON
            </motion.span>
            <motion.span
              className={`${styles.textOff} ${!enabled ? styles.textVisible : styles.textHidden}`}
              animate={{
                opacity: !enabled ? 1 : 0,
                x: !enabled ? 0 : 10,
              }}
              transition={{ duration: 0.2, delay: !enabled ? 0.1 : 0 }}
            >
              OFF
            </motion.span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default Toggle;
