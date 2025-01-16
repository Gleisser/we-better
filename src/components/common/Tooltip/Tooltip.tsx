import { ReactNode } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  return (
    <div className={styles.tooltipContainer}>
      {children}
      <span className={styles.tooltipText}>{content}</span>
    </div>
  );
}; 