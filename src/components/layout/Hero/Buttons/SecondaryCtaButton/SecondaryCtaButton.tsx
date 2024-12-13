import { motion } from 'framer-motion'

interface CtaButtonProps {
  text?: string;
}

function SecondaryCtaButton({ text = "Know More ->" }: CtaButtonProps) {
  return (
    <motion.button 
            className="bg-white/10 text-white px-8 py-3 rounded-full font-medium hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {text}
          </motion.button>
  )
}

export default SecondaryCtaButton