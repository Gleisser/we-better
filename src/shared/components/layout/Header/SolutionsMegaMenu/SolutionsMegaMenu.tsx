import { motion, AnimatePresence } from 'framer-motion';
import { SolutionsMegaMenuProps } from './types';
import { API_CONFIG } from '@/core/config/api-config';
import { SOLUTIONS_MEGA_MENU_FALLBACK } from '@/utils/constants/fallback/megamenu';
import { MenuLink } from '../MegaMenu/types';

const SolutionsMegaMenu = ({ isOpen, onClose, menuData }: SolutionsMegaMenuProps): JSX.Element => {
  const menuItems = menuData?.menu_links || SOLUTIONS_MEGA_MENU_FALLBACK;

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
          role="navigation"
          aria-label="Solutions menu navigation"
        >
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {menuItems.map((item: MenuLink, index: number) => (
                <a key={index} href="#" className="group text-white">
                  <div className="flex items-start space-x-3">
                    <div className="pt-1">
                      <img
                        src={
                          (menuData && API_CONFIG.imageBaseURL + item.image.url) || item.image.url
                        }
                        alt={`${item.title} solution - ${item.description}`}
                        className="w-6 h-6"
                      />
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold transition-colors font-plus-jakarta [&:not(:hover)]:text-white">
                        {item.title}
                      </div>
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
