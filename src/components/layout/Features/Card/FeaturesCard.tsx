import styles from '../Features.module.css'
import { Feature } from '../../../../types/Features'
import { motion } from 'framer-motion'
function FeaturesCard({ feature, index }: { feature: Feature, index: number }) {
  return (
    <motion.div
              key={index}
              className="relative group"
              whileHover="hover"
            >
              {/* Outer glow effect */}
              <motion.div
                className={styles.featuresCardOuterGlow}
                variants={{
                  hover: {
                    opacity: 1,
                    scale: 1.05,
                  }
                }}
                initial="initial"
                animate="animate"
              />

              {/* Add a second glow layer for intensity */}
              <motion.div
                className={styles.featuresCardInnerGlow}
                variants={{
                  hover: {
                    opacity: 1,
                    scale: 1.02,
                  }
                }}
                initial="initial"
                animate="animate"
              />
    <div className={styles.featuresCardContent}>
    {/* Header area with title and arrow */}
    <div className={styles.featuresCardTitleArrowSection}>
      <h3 className={styles.featuresCardTitle}>{feature.title}</h3>
      
      {/* Arrow icon with gradient background */}
      <div className={styles.featuresCardArrowContainer}>
        {/* Default state: arrow pointing top-right */}
        <svg 
          className={styles.featuresCardArrowDefault}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 17L17 7M17 7H7M17 7V17" 
          />
        </svg>

        {/* Hover state: arrow pointing right */}
        <svg 
          className={styles.featuresCardArrowHover}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 12h14m-5-5l5 5-5 5" 
          />
        </svg>
      </div>
    </div>
    
    {/* Description */}
    <p className="text-white/70 text-sm leading-relaxed">
      {feature.description}
    </p>

    {/* Button text at bottom */}
    <div className="mt-8">
      <span className="text-sm font-medium text-white/90 group-hover:text-[#6f42c1] transition-colors duration-300">
        {feature.buttonText}
      </span>
    </div>
  </div>
  </motion.div>
  )
}

export default FeaturesCard