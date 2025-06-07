/**
 * Debug utilities for monitoring performance and layout issues
 */

// Enable/disable all debug logging
const DEBUG_ENABLED = true;

/**
 * Log debug messages with component context
 */
export const createLogger = (
  componentName: string
): {
  log: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
  count: (label: string) => void;
} => {
  return {
    log: (message: string, data?: unknown) => {
      if (!DEBUG_ENABLED) return;
      console.info(`[${componentName}] ${message}`, data || '');
    },

    warn: (message: string, data?: unknown) => {
      if (!DEBUG_ENABLED) return;
      console.warn(`[${componentName}] ${message}`, data || '');
    },

    error: (message: string, data?: unknown) => {
      if (!DEBUG_ENABLED) return;
      console.error(`[${componentName}] ${message}`, data || '');
    },

    time: (label: string) => {
      if (!DEBUG_ENABLED) return;
      //eslint-disable-next-line no-console
      console.time(`[${componentName}] ${label}`);
    },

    timeEnd: (label: string) => {
      if (!DEBUG_ENABLED) return;
      //eslint-disable-next-line no-console
      console.timeEnd(`[${componentName}] ${label}`);
    },

    count: (label: string) => {
      if (!DEBUG_ENABLED) return;
      //eslint-disable-next-line no-console
      console.count(`[${componentName}] ${label}`);
    },
  };
};

/**
 * Monitor layout thrashing by detecting multiple reads/writes to the DOM in succession
 */
export class LayoutThrashingMonitor {
  private static instance: LayoutThrashingMonitor;
  private readOperations: Set<string> = new Set();
  private writeOperations: Set<string> = new Set();
  private sequence: Array<{ type: 'read' | 'write'; property: string; timestamp: number }> = [];
  private enabled = DEBUG_ENABLED;

  static getInstance(): LayoutThrashingMonitor {
    if (!this.instance) {
      this.instance = new LayoutThrashingMonitor();
    }
    return this.instance;
  }

  trackRead(element: Element | null, property: string): void {
    if (!this.enabled || !element) return;

    this.readOperations.add(property);
    this.sequence.push({
      type: 'read',
      property,
      timestamp: performance.now(),
    });

    // Check for potential thrashing pattern
    this.detectThrashing();
  }

  trackWrite(element: Element | null, property: string): void {
    if (!this.enabled || !element) return;

    this.writeOperations.add(property);
    this.sequence.push({
      type: 'write',
      property,
      timestamp: performance.now(),
    });

    // Check for potential thrashing pattern
    this.detectThrashing();
  }

  private detectThrashing(): void {
    if (this.sequence.length < 4) return;

    // Look for read-write-read pattern on same properties (potential thrashing)
    const last4 = this.sequence.slice(-4);

    // Check for read -> write -> read pattern on same property
    for (let i = 0; i < last4.length - 2; i++) {
      const op1 = last4[i];
      const op2 = last4[i + 1];
      const op3 = last4[i + 2];

      if (
        op1.type === 'read' &&
        op2.type === 'write' &&
        op3.type === 'read' &&
        op1.property === op3.property
      ) {
        console.warn(`[LayoutThrashing] Detected potential layout thrashing: ${op1.property}`);
        break;
      }
    }

    // Limit sequence size to prevent memory growth
    if (this.sequence.length > 100) {
      this.sequence = this.sequence.slice(-50);
    }
  }

  reset(): void {
    this.readOperations.clear();
    this.writeOperations.clear();
    this.sequence = [];
  }

  getStats(): {
    reads: string[];
    writes: string[];
    sequence: Array<{ type: 'read' | 'write'; property: string; timestamp: number }>;
  } {
    return {
      reads: Array.from(this.readOperations),
      writes: Array.from(this.writeOperations),
      sequence: [...this.sequence],
    };
  }
}

/**
 * Track render performance for components
 */
export const trackRender = (componentName: string) => {
  const logger = createLogger(componentName);
  const startTime = performance.now();

  logger.log('Render started');

  return () => {
    const duration = performance.now() - startTime;
    logger.log(`Render completed in ${duration.toFixed(2)}ms`);

    if (duration > 16.67) {
      // Slower than 60fps (1000ms / 60 ≈ 16.67ms)
      logger.warn(`Slow render detected: ${duration.toFixed(2)}ms`);
    }
  };
};

/**
 * Hook to inject debug styles to visualize repaints
 */
export const injectRepaintVisualization = (): (() => void) => {
  const styleId = 'debug-repaint-style';

  if (!DEBUG_ENABLED) return () => {};

  // Remove existing style if it exists
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject the style
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    * {
      outline: 1px solid transparent;
      animation: flash-on-change 0.3s ease-out;
    }
    
    @keyframes flash-on-change {
      0% { outline-color: rgba(255, 0, 0, 0.5); }
      100% { outline-color: transparent; }
    }
  `;

  document.head.appendChild(style);

  // Inform user
  console.info(
    '[Debug] Repaint visualization activated. Elements will flash red when they repaint.'
  );

  return () => {
    style.remove();
    console.info('[Debug] Repaint visualization deactivated.');
  };
};
