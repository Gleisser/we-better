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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  scrollY.onChange((latest) => {
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
        role="banner"
        aria-label="Main navigation"
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
                src="/assets/images/logo/we-better-logo-v3.svg" 
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
              <ul className={styles.navList} role="menubar">
                {megamenus.map((item) => {
                  const menuState = getMegaMenuState(item.type);
                  return (
                    <li key={item.id} role="none">
                      <NavItem
                        href='#'
                        title={item.title}
                        isOpen={menuState?.isOpen}
                        onMouseEnter={() => menuState?.setIsOpen(true)}
                        onMouseLeave={() => menuState?.setIsOpen(false)}
                        aria-expanded={menuState?.isOpen}
                        aria-haspopup="true"
                        role="menuitem"
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
                  <li key={link.id} role="none">
                    <NavItem 
                      href={link.href} 
                      title={link.title}
                      role="menuitem"
                    />
                  </li>
                ))}
                {!data && (
                  <>
                    <li role="none">
                      <NavItem 
                        href="#teams" 
                        title={HEADER_CONSTANTS.Teams.title}
                        role="menuitem"
                      />
                    </li>
                    <li role="none">
                      <NavItem 
                        href="#developers" 
                        title={HEADER_CONSTANTS.Developers.title}
                        role="menuitem"
                      />
                    </li>
                    <li role="none">
                      <NavItem 
                        href="#creators" 
                        title={HEADER_CONSTANTS.Creators.title}
                        role="menuitem"
                      />
                    </li>
                  </>
                )}
              </ul>
            </nav>

            <div 
              className={styles.mobileControls}
              role="group"
              aria-label="Mobile navigation"
            >
              <Link 
                to="/app" 
                className={styles.headerCta}
                role="button"
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
        id="mobile-menu"
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