import { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import MegaMenu from './MegaMenu';
import SolutionsMegaMenu from './SolutionsMegaMenu';
import ResourcesMegaMenu from './ResourcesMegaMenu';
import styles from './Header.module.css';
import { HEADER_CONSTANTS, MEGA_MENU_CONFIG } from '@/constants/header';
import NavItem from './NavItem';
import HamburgerButton from './HamburgerButton';
import MobileMenu from './MobileMenu';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isResourcesOpen, setResourcesOpen] = useState(false);
  const { scrollY } = useScroll();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const getMegaMenuState = (menuType: string) => {
    switch (menuType) {
      case HEADER_CONSTANTS.Features.id:
        return {
          isOpen: isFeaturesOpen,
          setIsOpen: setIsFeaturesOpen,
          Component: MegaMenu
        };
      case HEADER_CONSTANTS.Solutions.id:
        return {
          isOpen: isSolutionsOpen,
          setIsOpen: setIsSolutionsOpen,
          Component: SolutionsMegaMenu
        };
      case HEADER_CONSTANTS.Resources.id:
        return {
          isOpen: isResourcesOpen,
          setIsOpen: setResourcesOpen,
          Component: ResourcesMegaMenu
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
            <Link to="/" className={styles.logoWrapper}>
              <img 
                src="/assets/images/logo/we-better-logo-v3.svg" 
                alt="We Better" 
                className={`${styles.logo} ${styles.desktopLogo}`}
              />
              <img 
                src="/assets/images/logo/we-better-logo-v3-mobile.svg" 
                alt="We Better" 
                className={`${styles.logo} ${styles.mobileLogo}`}
              />
            </Link>
            
            <nav className={styles.headerNav}>
              {MEGA_MENU_CONFIG.map((item) => {
                const menuState = getMegaMenuState(item.menuType);
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    isOpen={menuState?.isOpen}
                    onMouseEnter={() => menuState?.setIsOpen(true)}
                    onMouseLeave={() => menuState?.setIsOpen(false)}
                    MegaMenuComponent={
                      menuState && (
                        <menuState.Component
                          isOpen={menuState.isOpen}
                          onClose={() => menuState.setIsOpen(false)}
                        />
                      )
                    }
                  />
                );
              })}

              <NavItem href="#teams" title={HEADER_CONSTANTS.Teams.title} />
              <NavItem href="#developers" title={HEADER_CONSTANTS.Developers.title} />
              <NavItem href="#creators" title={HEADER_CONSTANTS.Creators.title} />
            </nav>

            <div className={styles.mobileControls}>
              <Link to="/app" className={styles.headerCta}>
                {HEADER_CONSTANTS.Cta.title}
              </Link>
              <HamburgerButton 
                isOpen={isMobileMenuOpen} 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              />
            </div>
          </div>
        </div>
      </motion.header>
      <MobileMenu isOpen={isMobileMenuOpen} />
      {createPortal(
        <>
          {isSolutionsOpen && <SolutionsMegaMenu />}
          {isResourcesOpen && <ResourcesMegaMenu />}
        </>,
        document.body
      )}
    </>
  );
};

export default Header;