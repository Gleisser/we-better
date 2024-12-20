import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, MonitorPlay, HelpCircle, FileText } from 'lucide-react';
import { ResourcesMegaMenuProps } from './types';

const ResourcesMegaMenu = ({ isOpen, onClose }: ResourcesMegaMenuProps) => {
  const menuItems = [
    {
      title: "News",
      description: "Your Source for Creativity and Industry Insights.",
      icon: (
        <Newspaper className="w-5 h-5 text-[#E83E8C]" />
      ),
    },
    {
      title: "Webinars",
      description: "Live and recorded sessions with our team.",
      icon: (
        <MonitorPlay className="w-5 h-5 text-[#E83E8C]" />
      ),
    },
    {
      title: "FAQ",
      description: "Get answers to frequently asked questions.",
      icon: (
        <HelpCircle className="w-5 h-5 text-[#E83E8C]" />
      ),
    },
    {
      title: "Wiki",
      description: "Guides from our community.",
      icon: (
        <FileText className="w-5 h-5 text-[#E83E8C]" />
      ),
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
            <div className="grid grid-cols-[1fr,1.2fr] gap-8">
              {/* Latest Post Section */}
              <div className="space-y-3">
                <h3 className="text-white/60 text-xs font-medium font-plus-jakarta uppercase tracking-wider mb-4">
                  Latest post
                </h3>
                <div className="space-y-3">
                  <div className="aspect-[16/10] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400"
                      alt="Latest Post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white text-base font-semibold font-plus-jakarta">
                      28 AI Statistics for Marketers
                    </h3>
                    <p className="text-[#6366F1] text-xs font-plus-jakarta">
                      Published on November 19, 2024
                    </p>
                  </div>
                </div>
              </div>

              {/* Resources Links */}
              <div className="space-y-4">
                {menuItems.map((item, index) => (
                  <a 
                    key={index}
                    href="#"
                    className="group flex items-start space-x-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="mt-1">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-semibold font-plus-jakarta">
                        {item.title}
                      </h3>
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