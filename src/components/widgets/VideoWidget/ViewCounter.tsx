import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ViewCounterProps {
  value: string;
  className?: string;
}

const ViewCounter = ({ value, className }: ViewCounterProps) => {
  // Convert view count string to number (e.g., "124K" -> 124000)
  const parseViewCount = (viewStr: string): number => {
    const num = parseFloat(viewStr);
    const multiplier = viewStr.toLowerCase().includes('k') ? 1000 : 1;
    return num * multiplier;
  };

  const numericValue = parseViewCount(value.replace(' views', ''));
  const spring = useSpring(0, { mass: 1, stiffness: 100, damping: 30 });
  const displayed = useTransform(spring, (current) => {
    if (current >= 1000) {
      return `${(current / 1000).toFixed(1)}K views`;
    }
    return `${Math.round(current)} views`;
  });

  useEffect(() => {
    spring.set(numericValue);
  }, [spring, numericValue]);

  return (
    <motion.span className={className}>
      {displayed}
    </motion.span>
  );
};

export default ViewCounter; 