import React from 'react';
import { motion } from 'framer-motion';

const DashboardPreview = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      {/* Glass effect background with larger dimensions */}
      <motion.div 
        className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/10 rounded-[2rem] backdrop-blur-[2px] border border-white/20"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Main content container */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden backdrop-blur-sm bg-black/30">
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
          className="relative w-full h-full object-cover opacity-90"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
    </div>
  );
};

export default DashboardPreview;