import { motion } from 'framer-motion';
import { useState } from 'react';
import styles from './MobileMenu.module.css';

interface MobileMenuProps {
  isOpen: boolean;
}

const MobileMenu = ({ isOpen }: MobileMenuProps) => {
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const solutionsItems = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
          <path 
            d="M3 3v18h18" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M7 14l4-4 4 4 5-5" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle 
            cx="7" 
            cy="14" 
            r="2" 
            fill="none" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2"
          />
          <circle 
            cx="11" 
            cy="10" 
            r="2" 
            fill="none" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2"
          />
          <circle 
            cx="15" 
            cy="14" 
            r="2" 
            fill="none" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2"
          />
          <circle 
            cx="20" 
            cy="9" 
            r="2" 
            fill="none" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2"
          />
          <defs>
            <linearGradient 
              id="paint0_linear" 
              x1="3" 
              y1="3" 
              x2="21" 
              y2="21" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "AI Marketing Tools",
      description: "Instantly upgrade your marketing campaigns."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
          <path d="M12 4L4 8l8 4 8-4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round"/>
          <defs>
            <linearGradient id="paint1_linear" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "AI Graphic Design",
      description: "Instantly upgrade your design workflow."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
          {/* Printer body */}
          <path 
            d="M6 18H4a2 2 0 01-2-2v-6a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2h-2" 
            stroke="url(#paint2_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Paper tray */}
          <path 
            d="M6 14h12v8H6v-8z" 
            stroke="url(#paint2_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Top paper */}
          <path 
            d="M6 2h12v4H6V2z" 
            stroke="url(#paint2_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Printer details */}
          <circle 
            cx="18" 
            cy="11" 
            r="1" 
            fill="url(#paint2_linear)"
          />
          <defs>
            <linearGradient 
              id="paint2_linear" 
              x1="2" 
              y1="2" 
              x2="22" 
              y2="22" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "AI Print on Demand",
      description: "Transform your digital art into print-ready masterpieces."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
          {/* Camera body */}
          <rect 
            x="2" 
            y="6" 
            width="20" 
            height="14" 
            rx="2" 
            stroke="url(#paint3_linear)" 
            strokeWidth="2"
          />
          {/* Camera lens */}
          <circle 
            cx="12" 
            cy="13" 
            r="4" 
            stroke="url(#paint3_linear)" 
            strokeWidth="2"
          />
          {/* Flash/top detail */}
          <path 
            d="M7 4h10" 
            stroke="url(#paint3_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Small light/button */}
          <circle 
            cx="17" 
            cy="9" 
            r="1" 
            fill="url(#paint3_linear)"
          />
          <defs>
            <linearGradient 
              id="paint3_linear" 
              x1="2" 
              y1="2" 
              x2="22" 
              y2="22" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "AI Marketing Tools",
      description: "Uplift your portfolio with our flexible suite of creative AI tools."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
          {/* Sofa base */}
          <path 
            d="M4 18v-3a2 2 0 012-2h12a2 2 0 012 2v3" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Sofa seat */}
          <path 
            d="M4 18h16" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Sofa back */}
          <path 
            d="M6 13V9a2 2 0 012-2h8a2 2 0 012 2v4" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Left armrest */}
          <path 
            d="M4 13V9a2 2 0 012-2" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Right armrest */}
          <path 
            d="M20 13V9a2 2 0 00-2-2" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint4_linear" 
              x1="4" 
              y1="7" 
              x2="20" 
              y2="18" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "AI Interior Design",
      description: "Your digital studio for interior design."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
          {/* Building base */}
          <path 
            d="M3 21h18" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Main building structure */}
          <path 
            d="M5 21V7l7-4 7 4v14" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Windows left side */}
          <path 
            d="M7 9h2m-2 4h2m-2 4h2" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Windows right side */}
          <path 
            d="M15 9h2m-2 4h2m-2 4h2" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Door */}
          <path 
            d="M10 21v-3h4v3" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint5_linear" 
              x1="3" 
              y1="3" 
              x2="21" 
              y2="21" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "AI Architecture",
      description: "Architecture generator tools to enhance your workflow."
    }
  ];

  const resourcesItems = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
          <path 
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" 
            stroke="url(#paint6_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M16 2v4M8 2v4M3 10h18" 
            stroke="url(#paint6_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint6_linear" 
              x1="3" 
              y1="2" 
              x2="21" 
              y2="20" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "News",
      description: "Your Source for Creativity and Industry Insights."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
          <path 
            d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" 
            stroke="url(#paint7_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M9 7h6M9 11h6M9 15h4" 
            stroke="url(#paint7_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint7_linear" 
              x1="5" 
              y1="3" 
              x2="19" 
              y2="21" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "Wiki",
      description: "Community Mentores."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.menuIcon}>
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="url(#paint8_linear)" 
            strokeWidth="2" 
          />
          <path 
            d="M12 16v-4M12 8h.01" 
            stroke="url(#paint8_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint8_linear" 
              x1="2" 
              y1="2" 
              x2="22" 
              y2="22" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "FAQ",
      description: "Get answers to frequently asked questions."
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div 
      className={styles.mobileMenu}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.menuContent}>
        <div className={styles.menuLinks}>
          {/* Solutions with submenu */}
          <div className={styles.menuItemWrapper}>
            <button 
              className={styles.menuItem}
              onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
            >
              <span>Solutions</span>
              <svg 
                className={`${styles.arrow} ${isSolutionsOpen ? styles.open : ''}`} 
                width="12" 
                height="8" 
                viewBox="0 0 12 8"
              >
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            {isSolutionsOpen && (
              <motion.div 
                className={styles.submenu}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {solutionsItems.map((item, index) => (
                  <div key={index} className={styles.submenuItemContainer}>
                    <div className={styles.submenuItemContent}>
                      {item.icon}
                      <div className={styles.submenuItemText}>
                        <h4 className={styles.submenuItemTitle}>{item.title}</h4>
                        <p className={styles.submenuItemDescription}>{item.description}</p>
                      </div>
                    </div>
                    {index < solutionsItems.length - 1 && <div className={styles.submenuDivider} />}
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Resources with submenu */}
          <div className={styles.menuItemWrapper}>
            <button 
              className={styles.menuItem}
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
            >
              <span>Resources</span>
              <svg 
                className={`${styles.arrow} ${isResourcesOpen ? styles.open : ''}`} 
                width="12" 
                height="8" 
                viewBox="0 0 12 8"
              >
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            {isResourcesOpen && (
              <motion.div 
                className={styles.submenu}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {/* Latest post section */}
                <div className={styles.latestPost}>
                  <span className={styles.latestPostLabel}>Latest post</span>
                  <div className={styles.postImage}>
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400"
                      alt="Latest Post"
                      className={styles.postImg}
                    />
                  </div>
                  <h3 className={styles.postTitle}>28 AI Statistics for Marketers</h3>
                  <span className={styles.postDate}>Published on November 19, 2024</span>
                </div>

                <div className={styles.submenuDivider} />

                {/* Resources menu items */}
                {resourcesItems.map((item, index) => (
                  <div key={index} className={styles.submenuItemContainer}>
                    <div className={styles.submenuItemContent}>
                      {item.icon}
                      <div className={styles.submenuItemText}>
                        <h4 className={styles.submenuItemTitle}>{item.title}</h4>
                        <p className={styles.submenuItemDescription}>{item.description}</p>
                      </div>
                    </div>
                    {index < resourcesItems.length - 1 && <div className={styles.submenuDivider} />}
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Regular menu items without expansion */}
          <a href="#teams" className={styles.menuItem}>For Teams</a>
          <a href="#developers" className={styles.menuItem}>For Developers</a>
          <a href="#contact" className={styles.menuItem}>Contact</a>
        </div>

        <div className={styles.storeLinks}>
          <img 
            src="/assets/images/header/mobile/app_store_header_mobile.svg" 
            alt="Download on App Store"
            className={styles.storeButton}
          />
          <img 
            src="/assets/images/header/mobile/play_store_header_mobile.svg" 
            alt="Get it on Google Play"
            className={styles.storeButton}
          />
        </div>

        <div className={styles.community}>
          <h3 className={styles.communityTitle}>Join the community!</h3>
          <div className={styles.socialLinks}>
            <a href="#">
              <img src="/assets/images/header/mobile/discord-icon.svg" alt="Discord" />
            </a>
            <a href="#">
              <img src="/assets/images/header/mobile/facebook-icon.svg" alt="X" />
            </a>
            <a href="#">
              <img src="/assets/images/header/mobile/instagram-icon.svg" alt="Instagram" />
            </a>
            <a href="#">
              <img src="/assets/images/header/mobile/fanbook-icon.svg" alt="Fanbook" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMenu; 