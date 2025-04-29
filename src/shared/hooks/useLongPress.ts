import { useCallback, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface LongPressOptions {
  delay?: number;
}

export const useLongPress = (onLongPress: (position: Position) => void, { delay = 400 }: LongPressOptions = {}) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (event.target === target.current) return;

      const getClientPosition = () => {
        if ('touches' in event) {
          const touch = event.touches[0];
          return { x: touch.clientX, y: touch.clientY };
        }
        return { x: (event as React.MouseEvent).clientX, y: (event as React.MouseEvent).clientY };
      };

      target.current = event.target;
      timeout.current = setTimeout(() => {
        const position = getClientPosition();
        onLongPress(position);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(() => {
    timeout.current && clearTimeout(timeout.current);
    setLongPressTriggered(false);
    target.current = undefined;
  }, []);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
    longPressTriggered
  };
}; 