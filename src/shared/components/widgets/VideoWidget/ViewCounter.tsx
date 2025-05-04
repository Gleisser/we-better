import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ViewCounterProps {
  value: number;
  className?: string;
}

const ViewCounter = ({ value, className }: ViewCounterProps): JSX.Element => {
  const spring = useSpring(0, { mass: 1, stiffness: 100, damping: 30 });
  const displayed = useTransform(spring, current => {
    if (current >= 1000000) {
      return `${(current / 1000000).toFixed(1)}M views`;
    }
    if (current >= 1000) {
      return `${(current / 1000).toFixed(1)}K views`;
    }
    return `${Math.round(current)} views`;
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{displayed}</motion.span>;
};

export default ViewCounter;
