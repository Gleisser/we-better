import { motion, AnimatePresence } from 'framer-motion';
import { SolutionsMegaMenuProps } from './types';

const SolutionsMegaMenu = ({ isOpen, onClose }: SolutionsMegaMenuProps) => {
  const menuItems = [
    {
      title: "AI Marketing Tools",
      description: "Instantly upgrade your marketing campaigns.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M2 12H5L7 20L12 4L17 20L19 12H22" stroke="url(#marketing-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="marketing-gradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6f42c1" />
              <stop offset="1" stopColor="#e83e8c" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: "AI Graphic Design",
      description: "Instantly upgrade your design workflow.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#design-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="url(#design-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="url(#design-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="design-gradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6f42c1" />
              <stop offset="1" stopColor="#e83e8c" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: "AI Print on Demand",
      description: "Transform your digital art into print-ready masterpieces.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M6 9V2H18V9" stroke="url(#print-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="url(#print-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 14H6V22H18V14Z" stroke="url(#print-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="print-gradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6f42c1" />
              <stop offset="1" stopColor="#e83e8c" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      title: "AI Photography",
      description: "Uplift your portfolio with our flexible suite of creative AI tools.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="url(#photo-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="url(#photo-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="photo-gradient" x1="1" y1="12" x2="23" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6f42c1" />
              <stop offset="1" stopColor="#e83e8c" />
            </linearGradient>
          </defs>
        </svg>
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
            <div className="grid grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <a 
                  key={index}
                  href="#"
                  className="group text-white"
                >
                  <div className="flex items-start space-x-3">
                    <div className="pt-1">{item.icon}</div>
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