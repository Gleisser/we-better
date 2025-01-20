import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // Add some padding
        left: rect.left + (rect.width / 2),
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className={className}
    >
      {children}
      {isVisible && createPortal(
        <div 
          className={styles.tooltipPositioner}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className={styles.tooltip}>
            {content}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}; 