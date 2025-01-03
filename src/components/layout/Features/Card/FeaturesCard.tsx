import styles from '../Features.module.css'
import { Card } from '../../../../types/features-response'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowTopRight } from '@/components/common/icons';
import { FEATURES_CONSTANTS } from '@/constants/fallback';

type FallbackCard = typeof FEATURES_CONSTANTS[0];

interface FeaturesCardProps {
  card: Card | FallbackCard;
  index: number;
}

function FeaturesCard({ card }: FeaturesCardProps) {
  // Helper function to determine if card is from API or fallback
  const isApiCard = (card: Card | FallbackCard): card is Card => {
    return 'Description' in card;
  };

  // Get the appropriate values based on card type
  const title = isApiCard(card) ? card.title : card.title;
  const description = isApiCard(card) ? card.Description : card.description;
  const buttonText = isApiCard(card) ? card.link?.title : card.buttonText;

  return (
    <motion.div
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
          <h3 className={styles.featuresCardTitle}>{title}</h3>
          
          {/* Arrow icons remain unchanged */}
          <div className={styles.featuresCardArrowContainer}>
            {/* Default state: arrow pointing top-right */}
            <ArrowTopRight className={styles.featuresCardArrowDefault} />
           
            {/* Hover state: arrow pointing right */}
            <ArrowRight className={styles.featuresCardArrowHover} />
          </div>
        </div>
        
        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed">
          {description}
        </p>

        {/* Button text at bottom */}
        <div className="mt-8">
          <span className="text-sm font-medium text-white/90 group-hover:text-[#6f42c1] transition-colors duration-300">
            {buttonText}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default FeaturesCard;