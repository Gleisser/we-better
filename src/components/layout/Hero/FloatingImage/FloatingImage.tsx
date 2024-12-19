import { motion, useScroll, useTransform } from 'framer-motion';

interface FloatingImageProps {
  src: string;
  alt: string;
  className?: string;
}

const FloatingImage = ({ src, alt, className = '' }: FloatingImageProps) => {
  const { scrollY } = useScroll();
  
  // Extract position information from className
  const isTop = className.includes('-top-');
  const isLeft = className.includes('-left-');
  const isRight = className.includes('-right-');
  const isBottom = className.includes('bottom-0');

  // Calculate movement direction based on position
  // Adjusted initial positions to be further from the center
  const getMovementValues = () => {
    if (isTop && isLeft) return { x: [0, -100], y: [0, -100] };
    if (isTop && isRight) return { x: [0, 100], y: [-100, -100] };
    if (isBottom && isLeft) return { x: [0, -100], y: [200, 100] };
    if (isBottom && isRight) return { x: [0, 100], y: [200, 100] };
    return { x: [0, 0], y: [0, 0] };
  };

  const { x, y } = getMovementValues();

  // Extract rotation value from className
  const rotationMatch = className.match(/-?rotate-(\d+)/);
  const baseRotation = rotationMatch ? parseInt(rotationMatch[1]) : 0;
  const isNegative = className.includes('-rotate');
  const rotation = isNegative ? -baseRotation : baseRotation;

  // Create dynamic transforms based on scroll - Increased range for smoother movement
  const translateX = useTransform(scrollY, [0, 800], x);
  const translateY = useTransform(scrollY, [0, 800], y);
  const rotate = useTransform(scrollY, [0, 800], [rotation, rotation * 1.5]);

  return (
    <motion.div 
      className={`absolute ${className} z-10`} // Reduced z-index from 50 to 10
      style={{ 
        x: translateX,
        y: translateY,
        rotate,
      }}
      initial={{ 
        opacity: 0, 
        x: x[0], 
        y: y[0],
        scale: 0.8 // Start slightly smaller
      }}
      animate={{ 
        opacity: 1, 
        x: x[0], // Keep initial offset position
        y: y[0],
        scale: 1
      }}
      transition={{ 
        duration: 1.2, 
        ease: "easeOut",
        delay: 0.2 // Add slight delay for better entrance
      }}
    >
      {/* Outer glass effect container */}
      <div className="relative w-[250px] h-[250px] group"> {/* Reduced size from 300px to 250px */}
        {/* Glass effect background */}
        <motion.div 
          className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/10 rounded-[2rem] backdrop-blur-[2px] border border-white/20"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Inner container for the image */}
        <div className="relative h-full">
          {/* Image gradient overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary-blue/20 to-primary-purple/20 rounded-3xl backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* The image itself */}
          <motion.img
            src={src}
            alt={alt}
            className="relative w-full h-full object-cover rounded-3xl shadow-2xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingImage;