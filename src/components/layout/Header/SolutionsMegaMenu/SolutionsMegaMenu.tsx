import { motion, AnimatePresence } from 'framer-motion';
import { SolutionsMegaMenuProps } from './types';
import { API_CONFIG } from '@/lib/api-config';

const SolutionsMegaMenu = ({ isOpen, onClose, menuData }: SolutionsMegaMenuProps) => {
  const menuItems = menuData?.menu_links || [
    {
      title: "AI Marketing Tools",
      description: "Instantly upgrade your marketing campaigns.",
      image: {
        url: "/assets/images/header/svg/marketing.svg"
      }
    },
    {
      title: "AI Graphic Design",
      description: "Instantly upgrade your design workflow.",
      image: {
        url: "/assets/images/header/svg/design.svg"
      }
    },
    {
      title: "AI Print on Demand",
      description: "Transform your digital art into print-ready masterpieces.",
      image: {
        url: "/assets/images/header/svg/print.svg"
      }
    },
    {
      title: "AI Photography",
      description: "Uplift your portfolio with our flexible suite of creative AI tools.",
      image: {
        url: "/assets/images/header/svg/photo.svg"
      }
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          exit={{ y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 top-[calc(100%+8px)] bg-black border border-white/10 rounded-xl w-[561px] shadow-xl"
          onMouseLeave={onClose}
        >
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <a 
                  key={index}
                  href="#"
                  className="group text-white"
                >
                  <div className="flex items-start space-x-3">
                    <div className="pt-1">
                      <img src={menuData && API_CONFIG.imageBaseURL + item.image.url || item.image.url} alt={item.title} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-semibold transition-colors font-plus-jakarta [&:not(:hover)]:text-white">
                        {item.title}
                      </h3>
                      <p className="text-white/60 mt-0.5 text-xs leading-relaxed font-plus-jakarta">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SolutionsMegaMenu; 