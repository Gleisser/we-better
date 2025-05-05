import { useState, useCallback, useRef } from 'react';

interface TiltValues {
  rotateX: number;
  rotateY: number;
  scale: number;
}

export const useTiltEffect = (
  intensity: number = 10
): {
  elementRef: React.RefObject<HTMLDivElement>;
  tilt: TiltValues;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave: () => void;
} => {
  const [tilt, setTilt] = useState<TiltValues>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!elementRef.current) return;

      const element = elementRef.current;
      const rect = element.getBoundingClientRect();

      // Calculate relative position
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to -1 to 1 range
      const xPercent = (x / rect.width) * 2 - 1;
      const yPercent = (y / rect.height) * 2 - 1;

      // Calculate rotation values
      const rotateX = -yPercent * intensity;
      const rotateY = xPercent * intensity;

      setTilt({
        rotateX,
        rotateY,
        scale: 1.02,
      });
    },
    [intensity]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  return {
    elementRef,
    tilt,
    handleMouseMove,
    handleMouseLeave,
  };
};
