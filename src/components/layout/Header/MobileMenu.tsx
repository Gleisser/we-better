import { motion } from 'framer-motion';
import { useState } from 'react';
import styles from './MobileMenu.module.css';
import { 
  ArticlesIcon, 
  CoursesIcon, 
  VideosIcon, 
  NewsletterIcon,
  AINewsIcon,
  WikiIcon,
  FAQIcon,
  MobileMenuArrowIcon 
} from '@/components/common/icons';

interface MobileMenuProps {
  isOpen: boolean;
  'aria-hidden'?: boolean;
}

const MobileMenu = ({ isOpen, 'aria-hidden': ariaHidden }: MobileMenuProps) => {
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const solutionsItems = [
    {
      icon: <ArticlesIcon className={styles.menuIcon} />,
      title: "Articles",
      description: "Articles from our community",
      iconAlt: "Articles icon showing a document with text lines"
    },
    {
      icon: <CoursesIcon className={styles.menuIcon} />,
      title: "Courses",
      description: "Courses from our community",
      iconAlt: "Courses icon showing stacked books"
    },
    {
      icon: <VideosIcon className={styles.menuIcon} />,
      title: "Videos",
      description: "Videos from our community",
      iconAlt: "Video player icon with play button"
    },
    {
      icon: <NewsletterIcon className={styles.menuIcon} />,
      title: "Newsletter",
      description: "Newsletter from our community",
      iconAlt: "Newsletter icon showing an envelope"
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
      title: "Webinar",
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
      role="dialog"
      aria-modal="true"
      aria-hidden={ariaHidden}
      aria-label="Mobile navigation menu"
    >
      <div className={styles.menuContent}>
        <div className={styles.menuLinks}>
          {/* Solutions with submenu */}
          <div className={styles.menuItemWrapper}>
            <button 
              className={`${styles.menuItem} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md`}
              onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
              aria-expanded={isSolutionsOpen}
              aria-controls="solutions-submenu"
            >
              <span>Solutions</span>
              <MobileMenuArrowIcon 
                className={`${styles.arrow} ${isSolutionsOpen ? styles.open : ''}`}
                aria-hidden="true"
              />
            </button>
            {isSolutionsOpen && (
              <motion.div 
                id="solutions-submenu"
                className={styles.submenu}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                role="region"
                aria-label="Solutions submenu"
              >
                {solutionsItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={styles.submenuItemContainer}
                  >
                    <div className={styles.submenuItemContent}>
                      {item.icon}
                      <div className={styles.submenuItemText}>
                        <div className={styles.submenuItemTitle}>{item.title}</div>
                        <p className={styles.submenuItemDescription}>{item.description}</p>
                      </div>
                    </div>
                    {index < solutionsItems.length - 1 && <div className={styles.submenuDivider} aria-hidden="true" />}
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Resources with submenu */}
          <div className={styles.menuItemWrapper}>
            <button 
              className={`${styles.menuItem} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md`}
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              aria-expanded={isResourcesOpen}
              aria-controls="resources-submenu"
            >
              <span>Resources</span>
              <MobileMenuArrowIcon 
                className={`${styles.arrow} ${isResourcesOpen ? styles.open : ''}`}
                aria-hidden="true" 
              />
            </button>
            {isResourcesOpen && (
              <motion.div 
                id="resources-submenu"
                className={styles.submenu}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                role="region"
                aria-label="Resources submenu"
              >
                {/* Latest post section */}
                <div className={styles.latestPost}>
                  <div className={styles.latestPostLabel}>Latest post</div>
                  <div className={styles.postImage}>
                    <img 
                      src="/assets/images/hero/blog_post.webp"
                      alt="Latest Post"
                      className={styles.postImg}
                    />
                  </div>
                  <div className={styles.postTitle}>15 Principles to be sucessful in Business</div>
                  <span className={styles.postDate}>Published Today</span>
                </div>

                <div className={styles.submenuDivider} aria-hidden="true" />

                {/* Resources menu items */}
                {resourcesItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={styles.submenuItemContainer}
                  >
                    <div className={styles.submenuItemContent}>
                      {item.icon}
                      <div className={styles.submenuItemText}>
                        <div className={styles.submenuItemTitle}>{item.title}</div>
                        <p className={styles.submenuItemDescription}>{item.description}</p>
                      </div>
                    </div>
                    {index < resourcesItems.length - 1 && <div className={styles.submenuDivider} aria-hidden="true" />}
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Regular menu items */}
          <a href="#teams" className={styles.menuItem}>For Business</a>
          <a href="#developers" className={styles.menuItem}>For Mentors</a>
          <a href="#contact" className={styles.menuItem}>For Coaches</a>
        </div>

        <div 
          className={styles.storeLinks}
          role="group"
          aria-label="App store links"
        >
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
          <div className={styles.communityTitle}>Join the community!</div>
          <div 
            className={styles.socialLinks}
            role="group"
            aria-label="Social media links"
          >
            <a 
              href="#"
              className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md"
            >
              <img 
                src="/assets/images/header/mobile/discord-icon.svg" 
                alt="Join our Discord community for AI discussions and support" 
              />
            </a>
            <a href="#"
              className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md"
            >
              <img 
                src="/assets/images/header/mobile/facebook-icon.svg" 
                alt="Follow us on Facebook for latest AI technology updates" 
              />
            </a>
            <a href="#"
            className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md"
            >
              <img 
                src="/assets/images/header/mobile/instagram-icon.svg" 
                alt="Follow our Instagram for AI-generated art and inspiration" 
              />
            </a>
            <a href="#"
              className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md"
            >
              <img 
                src="/assets/images/header/mobile/fanbook-icon.svg" 
                alt="Join our Fanbook community for exclusive AI content" 
              />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMenu; 