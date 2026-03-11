import { motion, AnimatePresence } from 'framer-motion';
import { ResourcesMegaMenuProps } from './types';
import { API_CONFIG } from '@/core/config/api-config';
import { RESOURCES_MEGA_MENU_FALLBACK } from '@/utils/constants/fallback/megamenu';

const ResourcesMegaMenu = ({ isOpen, onClose, menuData }: ResourcesMegaMenuProps): JSX.Element => {
  const menuItems = menuData?.menu_links || RESOURCES_MEGA_MENU_FALLBACK;

  const spotlight = menuData?.menu_blog_post;

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
          aria-label="Resources menu navigation"
        >
          <div className="p-6">
            <div className="grid grid-cols-[1fr,1.2fr] gap-8">
              {/* Latest Post Section */}
              <div className="space-y-3">
                <div className="text-white/60 text-xs font-medium font-plus-jakarta uppercase tracking-wider mb-4">
                  Spotlight
                </div>
                <div className="space-y-3">
                  <div className="aspect-[16/10] rounded-lg overflow-hidden">
                    <img
                      src={
                        (spotlight && API_CONFIG.imageBaseURL + spotlight.cover?.url) ||
                        '/assets/images/hero/Newslatter.png'
                      }
                      alt={
                        spotlight?.title
                          ? `Featured We Better spotlight: ${spotlight.title}`
                          : 'Featured We Better spotlight preview'
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-white text-base font-semibold font-plus-jakarta">
                      {spotlight?.title || 'Build routines that actually stick'}
                    </div>
                    <p className="text-[#6366F1] text-xs font-plus-jakarta">
                      {spotlight?.post_date
                        ? new Date(spotlight.post_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Getting started'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resources Links */}
              <div className="space-y-4">
                {menuItems.map((item, index: number) => (
                  <a
                    key={index}
                    href="#"
                    className="group flex items-start space-x-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="mt-1">
                      {item.image && (
                        <img
                          src={
                            (menuData && API_CONFIG.imageBaseURL + item.image?.url) ||
                            item.image?.url
                          }
                          alt={`${item.title} section icon - ${item.description}`}
                          className="w-5 h-5"
                        />
                      )}
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold font-plus-jakarta">
                        {item.title}
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed font-plus-jakarta mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResourcesMegaMenu;
