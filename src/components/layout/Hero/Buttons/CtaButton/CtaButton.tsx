import { motion } from 'framer-motion'

interface CtaButtonProps {
  text?: string;
}

const CtaButton = ({ text = "Get Started" }: CtaButtonProps) => {
  return (
    <motion.button 
      className="bg-white text-[#6f42c1] px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {text}
    </motion.button>
  );
};

export default CtaButton