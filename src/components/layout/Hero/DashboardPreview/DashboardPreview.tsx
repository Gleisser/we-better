import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  src: string;
  alt: string;
  observerRef?: React.RefObject<IntersectionObserver>;
}

const DashboardPreview = forwardRef<HTMLImageElement, Props>(({ src, alt, observerRef }, ref) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      <motion.div 
        className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/10 rounded-[2rem] backdrop-blur-[2px] border border-white/20"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      />
      
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden backdrop-blur-sm bg-black/30">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary-blue/20 to-primary-purple/20 rounded-3xl backdrop-blur-sm border border-white/20"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
        
        <motion.img
          ref={ref}
          src={src}
          alt={alt}
          className="relative w-full h-full object-cover opacity-90 transition-opacity duration-500"
          style={{ opacity: isImageLoaded ? 0.9 : 0 }}
          loading="eager"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isImageLoaded ? 0.9 : 0 }}
          onLoad={() => {
            setIsImageLoaded(true);
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
    </div>
  );
});

DashboardPreview.displayName = 'DashboardPreview';

export default DashboardPreview;