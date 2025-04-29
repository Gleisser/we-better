import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

/**
 * Props interface for the Tooltip component.
 * @interface TooltipProps
 * @property {string} content - The text content to display in the tooltip
 * @property {React.ReactElement} children - The element that triggers the tooltip
 * @property {string} [className] - Optional CSS class name for styling the wrapper element
 */
interface TooltipProps {
  content: string;
  children: React.ReactElement;
  className?: string;
}

/**
 * A tooltip component that displays additional information when hovering over an element.
 * Features:
 * - Portal-based rendering for proper stacking context
 * - Automatic positioning relative to trigger element
 * - Dynamic updates on scroll and resize
 * - Smooth show/hide behavior
 * - Customizable styling through className prop
 * 
 * The tooltip is positioned above the trigger element and centered horizontally.
 * It automatically updates its position when the window is scrolled or resized.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.content - Text to display in the tooltip
 * @param {React.ReactElement} props.children - Element that triggers the tooltip
 * @param {string} [props.className] - Optional CSS class for the wrapper
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Tooltip content="Delete this item">
 *   <button>🗑️</button>
 * </Tooltip>
 * ```
 * 
 * @example
 * ```tsx
 * // With custom styling
 * <Tooltip 
 *   content="User profile settings"
 *   className="tooltip-wrapper"
 * >
 *   <div className="profile-icon">
 *     <UserIcon />
 *   </div>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  /**
   * Updates the tooltip's position based on the trigger element's position.
   * Calculates position to center the tooltip above the trigger element.
   */
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // Add some padding
        left: rect.left + (rect.width / 2),
      });
    }
  };

  /**
   * Effect to handle position updates and event listeners.
   * Adds scroll and resize listeners when tooltip is visible.
   * Cleans up listeners when tooltip is hidden or component unmounts.
   */
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