import { ReactNode } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

const Tooltip = ({ content, children }: TooltipProps) => {
  return (
    <div className={styles.tooltipContainer}>
      {children}
      <span className={styles.tooltipText}>{content}</span>
    </div>
  );
};

export default Tooltip; 