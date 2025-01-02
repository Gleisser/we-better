import { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import MegaMenu from './MegaMenu';
import SolutionsMegaMenu from './SolutionsMegaMenu';
import ResourcesMegaMenu from './ResourcesMegaMenu';
import styles from './Header.module.css';
import { HEADER_CONSTANTS, MEGA_MENU_CONFIG, MenuType } from '@/constants/fallback/header';
import NavItem from './NavItem';
import HamburgerButton from './HamburgerButton';
import MobileMenu from './MobileMenu';
import { Link } from 'react-router-dom';
import { useMenu } from '@/hooks/useMenu';

const Header = () => {
  const { data } = useMenu();
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isResourcesOpen, setResourcesOpen] = useState(false);
  const { scrollY } = useScroll();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const megamenus = data?.data.megamenus || MEGA_MENU_CONFIG;

  console.log(data);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  scrollY.on("change",(latest) => {
    setHasScrolled(latest > 10);
  });



  const getMegaMenuState = (menuType: MenuType) => {
    switch (menuType) {
      case MenuType.Highlight:
        return {
          isOpen: isFeaturesOpen,
          setIsOpen: setIsFeaturesOpen,
          Component: MegaMenu,
          menuData: data?.data.megamenus.find(menu => menu.type === MenuType.Highlight)
        };
      case MenuType.SVG:
        return {
          isOpen: isSolutionsOpen,
          setIsOpen: setIsSolutionsOpen,
          Component: SolutionsMegaMenu,
          menuData: data?.data.megamenus.find(menu => menu.type === MenuType.SVG)
        };
      case MenuType.Blog:
        return {
          isOpen: isResourcesOpen,
          setIsOpen: setResourcesOpen,
          Component: ResourcesMegaMenu,
          menuData: data?.data.megamenus.find(menu => menu.type === MenuType.Blog)
        };
      default:
        return null;
    }
  };

  return (
    <>
      <motion.header
        className={styles.headerContainer}
        animate={{
          backgroundColor: hasScrolled ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          backdropFilter: hasScrolled ? 'blur(8px)' : 'none',
          borderBottom: hasScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        }}
        transition={{ duration: 0.2 }}
      >
        <div className={styles.headerContent}>
          <div className={styles.headerItems}>
            <Link 
              to="/" 
              className={styles.logoWrapper}
              aria-label="We Better Home"
            >
              <img 
                src="/assets/images/logo/logo.svg" 
                alt="We Better" 
                className={`${styles.logo} ${styles.desktopLogo}`}
                width="120"
                height="32"
              />
              <img 
                src="/assets/images/logo/we-better-logo-v3-mobile.svg" 
                alt="We Better" 
                className={`${styles.logo} ${styles.mobileLogo}`}
                width="32"
                height="32"
              />
            </Link>
            
            <nav 
              className={styles.headerNav}
              aria-label="Main menu"
            >
              <ul className={styles.navList}>
                {megamenus.map((item) => {
                  const menuState = getMegaMenuState(item.type);
                  return (
                    <li key={item.id}>
                      <NavItem
                        href='#'
                        title={item.title}
                        isOpen={menuState?.isOpen}
                        onMouseEnter={() => menuState?.setIsOpen(true)}
                        onMouseLeave={() => menuState?.setIsOpen(false)}
                        aria-expanded={menuState?.isOpen}
                        aria-haspopup="true"
                        MegaMenuComponent={
                          menuState && (
                            <menuState.Component
                              isOpen={menuState.isOpen}
                              onClose={() => menuState.setIsOpen(false)}
                              menuData={menuState.menuData}
                            />
                          )
                        }
                      />
                    </li>
                  );
                })}
                {data?.data.links.map((link) => (
                  <li key={link.id}>
                    <NavItem 
                      href={link.href} 
                      title={link.title}
                    />
                  </li>
                ))}
                {!data && (
                  <>
                    <li>
                      <NavItem 
                        href="#teams" 
                        title={HEADER_CONSTANTS.Teams.title}
                      />
                    </li>
                    <li>
                      <NavItem 
                        href="#developers" 
                        title={HEADER_CONSTANTS.Developers.title}
                      />
                    </li>
                    <li>
                      <NavItem 
                        href="#creators" 
                        title={HEADER_CONSTANTS.Creators.title}
                      />
                    </li>
                  </>
                )}
              </ul>
            </nav>

            <div 
              className={styles.mobileControls}
              aria-label="Mobile navigation controls"
            >
              <Link 
                to="/app" 
                className={styles.headerCta}
              >
                {HEADER_CONSTANTS.Cta.title}
              </Link>
              <HamburgerButton 
                isOpen={isMobileMenuOpen} 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              />
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        aria-hidden={!isMobileMenuOpen}
      />

      {isResourcesOpen && (
        <ResourcesMegaMenu 
          isOpen={isResourcesOpen} 
          onClose={() => setResourcesOpen(false)}
          aria-hidden={!isResourcesOpen}
        />
      )}
    </>
  );
};

export default Header;