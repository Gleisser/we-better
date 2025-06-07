import { useEffect, useRef, useState } from 'react';
import {
  createLogger,
  injectRepaintVisualization,
  LayoutThrashingMonitor,
} from '@/shared/utils/debugUtils';

// Define a proper type for the stats object
interface MonitorStats {
  reads: string[];
  writes: string[];
  sequence: Array<{ type: 'read' | 'write'; property: string; timestamp: number }>;
}

interface RepaintDetectorProps {
  onDetect?: (stats: MonitorStats) => void;
  children?: React.ReactNode;
}

/**
 * A component that detects and monitors repaints and layout thrashing in the application
 * This is for debugging purposes only and should be removed in production
 */
const RepaintDetector: React.FC<RepaintDetectorProps> = ({ onDetect, children }) => {
  const logger = createLogger('RepaintDetector');
  const [isActive, setIsActive] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const monitorRef = useRef(LayoutThrashingMonitor.getInstance());

  // Toggle monitoring on/off
  const toggleMonitoring = (): void => {
    setIsActive(prevState => !prevState);
  };

  // Reset monitoring stats
  const resetMonitoring = (): void => {
    monitorRef.current.reset();
    logger.log('Monitoring stats reset');
  };

  // Show current stats
  const showStats = (): void => {
    const stats = monitorRef.current.getStats();
    logger.log('Current stats:', stats);
    if (onDetect) {
      onDetect(stats);
    }
  };

  // Start/stop monitoring based on active state
  useEffect(() => {
    if (isActive) {
      logger.log('Repaint monitoring activated');

      // Inject the visualization styles
      const cleanup = injectRepaintVisualization();
      // Ensure we handle the case where cleanup might be undefined
      cleanupRef.current = typeof cleanup === 'function' ? cleanup : null;

      // Create MutationObserver to detect DOM changes
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          // Track writes
          if (mutation.type === 'attributes') {
            monitorRef.current.trackWrite(mutation.target as Element, `${mutation.attributeName}`);
          }

          // Track node additions/removals
          if (mutation.type === 'childList') {
            if (mutation.addedNodes.length > 0) {
              monitorRef.current.trackWrite(mutation.target as Element, 'childNodes');
            }
            if (mutation.removedNodes.length > 0) {
              monitorRef.current.trackWrite(mutation.target as Element, 'childNodes');
            }
          }
        });
      });

      // Start observing
      observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['style', 'class'],
      });

      // Track read operations by monkey patching getBoundingClientRect
      const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function () {
        monitorRef.current.trackRead(this, 'getBoundingClientRect');
        return originalGetBoundingClientRect.apply(this);
      };

      return () => {
        // Clean up
        if (cleanupRef.current) {
          cleanupRef.current();
        }

        observer.disconnect();

        // Restore original methods
        Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;

        logger.log('Repaint monitoring deactivated');
      };
    }

    return undefined;
  }, [isActive, logger]);

  // Add keyboard shortcut to toggle (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        toggleMonitoring();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {children}

      {/* Debug control panel */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}
      >
        <div>Layout Thrashing Debug</div>
        <button
          onClick={toggleMonitoring}
          style={{
            background: isActive ? '#ff5555' : '#55aa55',
            border: 'none',
            padding: '5px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {isActive ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
        <button
          onClick={resetMonitoring}
          style={{
            background: '#5555aa',
            border: 'none',
            padding: '5px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Reset Stats
        </button>
        <button
          onClick={showStats}
          style={{
            background: '#aa5555',
            border: 'none',
            padding: '5px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Show Stats
        </button>
      </div>
    </>
  );
};

export default RepaintDetector;
