import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './ParticleEffect.module.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}

interface ParticleEffectProps {
  isTriggered: boolean;
  onComplete: () => void;
}

const PARTICLE_COUNT = 12;
const PARTICLE_SYMBOLS = ['✨', '💫', '⭐️', '✴️'];

const ParticleEffect = ({ isTriggered, onComplete }: ParticleEffectProps): JSX.Element => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isTriggered) {
      const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100, // Random spread
        y: -(Math.random() * 100 + 50), // Upward direction
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        opacity: 1,
      }));

      setParticles(newParticles);

      // Reset after animation
      setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 1000);
    }
  }, [isTriggered, onComplete]);

  if (!isTriggered) return <></>;

  return (
    <div className={styles.particleContainer}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className={styles.particle}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: particle.scale,
            rotate: particle.rotation,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
        >
          {PARTICLE_SYMBOLS[particle.id % PARTICLE_SYMBOLS.length]}
        </motion.div>
      ))}
    </div>
  );
};

export default ParticleEffect;
