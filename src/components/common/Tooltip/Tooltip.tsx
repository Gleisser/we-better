import { useState } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip = ({ text, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={styles.tooltipWrapper}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={styles.tooltip}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip; 