import GradientBackground from './GradientBackground';
import FloatingParticles from './FloatingParticles';
import FloatingIcons from './FloatingIcons';
import { DEFAULT_LIFE_CATEGORIES } from '../../../constants/categories';

interface BackgroundEffectsProps {
  intensity?: 'low' | 'medium' | 'high';
}

const BackgroundEffects = ({ intensity = 'low' }: BackgroundEffectsProps) => {
  // Reduced particle count to match Login style
  const particleCount = intensity === 'low' ? 10 : intensity === 'medium' ? 20 : 30;
  
  return (
    <>
      <GradientBackground />
      <FloatingParticles count={particleCount} opacity={0.4} />
      <FloatingIcons categories={DEFAULT_LIFE_CATEGORIES} />
    </>
  );
};

export default BackgroundEffects; 