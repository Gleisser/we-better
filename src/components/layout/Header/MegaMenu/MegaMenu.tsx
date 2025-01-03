import { motion, AnimatePresence } from 'framer-motion';
import { MegaMenuProps } from './types';
import { API_CONFIG } from '@/lib/api-config';
import { SOLUTIONS_MEGA_MENU_FALLBACK } from '@/constants/fallback/megamenu';



const MegaMenu = ({ isOpen, onClose, menuData }: MegaMenuProps) => {
  const menuItems = menuData?.menu_links || SOLUTIONS_MEGA_MENU_FALLBACK;
  const blogPost = menuData?.menu_blog_post;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          exit={{ y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 top-[calc(100%+8px)] bg-black border border-white/10 rounded-xl w-[561px] shadow-xl font-plus-jakarta"
          onMouseLeave={onClose}
          role="navigation"
          aria-label="Mega menu navigation"
        >
          <div className="p-6">
            <div className="grid grid-cols-[1.5fr,1fr] gap-6">
              {/* Menu items */}
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <a 
                    key={item.id || item.href}
                    href={item.href}
                    className="block group text-white hover:text-white visited:text-white active:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="text-white text-sm font-semibold font-plus-jakarta transition-colors [&:not(:hover)]:text-white">
                          {item.title}
                        </div>
                        <p className="text-white/60 mt-0.5 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-white/40 group-hover:text-primary-purple transition-colors pt-1">
                        →
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Preview Section */}
              <div className="space-y-3">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/20">
                  <img
                    src={blogPost && API_CONFIG.imageBaseURL + blogPost?.cover?.formats?.medium?.url || "/assets/images/hero/blog_post.webp"}
                    alt={blogPost?.title 
                      ? `Featured blog post: ${blogPost.title} - 15 Principles to be Successful in Business` 
                      : "Featured blog post: 15 Principles to be Successful in Business"}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/25">
                    <span className="text-[#6366F1] text-xs font-semibold">NEW</span>
                  </div>
                  <div className="text-white text-sm font-semibold font-plus-jakarta">
                    {blogPost?.title || "15 Principles to be Successful in Business"}
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    {blogPost?.description || "Everyone can do it, and achieve financial freedom"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu; 