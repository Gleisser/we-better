import GradientBackground from './GradientBackground';
import FloatingParticles from './FloatingParticles';
import FloatingIcons from './FloatingIcons';
import { DEFAULT_LIFE_CATEGORIES } from '../../../constants/categories';

interface BackgroundEffectsProps {
  intensity?: 'low' | 'medium' | 'high';
}

const BackgroundEffects = ({ intensity = 'medium' }: BackgroundEffectsProps) => {
  // Set particle count based on intensity
  const particleCount = intensity === 'low' ? 15 : intensity === 'medium' ? 30 : 50;
  
  return (
    <>
      <GradientBackground />
      <FloatingParticles count={particleCount} />
      <FloatingIcons categories={DEFAULT_LIFE_CATEGORIES} />
    </>
  );
};

export default BackgroundEffects; 