import { motion } from 'framer-motion';
import { useState } from 'react';
import styles from './MobileMenu.module.css';
import { AIGraphicDesignIcon, AIMarketingIcon, AIPrintOnDemandIcon, AIMarketingToolsIcon, AIInteriorDesignIcon, AIArchitectureIcon, AINewsIcon, WikiIcon, FAQIcon, MobileMenuArrowIcon } from '@/components/common/icons';

interface MobileMenuProps {
  isOpen: boolean;
}

const MobileMenu = ({ isOpen }: MobileMenuProps) => {
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const solutionsItems = [
    {
      icon: (
        <AIMarketingIcon className={styles.menuIcon} />
      ),
      title: "AI Marketing Tools",
      description: "Instantly upgrade your marketing campaigns."
    },
    {
      icon: (
        <AIGraphicDesignIcon className={styles.menuIcon} />
      ),
      title: "AI Graphic Design",
      description: "Instantly upgrade your design workflow."
    },
    {
      icon: (
        <AIPrintOnDemandIcon className={styles.menuIcon} />
      ),
      title: "AI Print on Demand",
      description: "Transform your digital art into print-ready masterpieces."
    },
    {
      icon: (
        <AIMarketingToolsIcon className={styles.menuIcon} />
      ),
      title: "AI Marketing Tools",
      description: "Uplift your portfolio with our flexible suite of creative AI tools."
    },
    {
      icon: (
        <AIInteriorDesignIcon className={styles.menuIcon} />
      ),
      title: "AI Interior Design",
      description: "Your digital studio for interior design."
    },
    {
      icon: (
        <AIArchitectureIcon className={styles.menuIcon} />
      ),
      title: "AI Architecture",
      description: "Architecture generator tools to enhance your workflow."
    }
  ];

  const resourcesItems = [
    {
      icon: (
        <AINewsIcon className={styles.menuIcon} />
      ),
      title: "News",
      description: "Your Source for Creativity and Industry Insights."
    },
    {
      icon: (
        <WikiIcon className={styles.menuIcon} />
      ),
      title: "Wiki",
      description: "Community Mentores."
    },
    {
      icon: (
        <FAQIcon className={styles.menuIcon} />
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
              <MobileMenuArrowIcon className={`${styles.arrow} ${isSolutionsOpen ? styles.open : ''}`} />
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
              <MobileMenuArrowIcon className={`${styles.arrow} ${isResourcesOpen ? styles.open : ''}`} />
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