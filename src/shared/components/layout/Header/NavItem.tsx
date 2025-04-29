import { ReactNode } from 'react';
import { ArrowDown } from '@/shared/components/common';
import styles from './Header.module.css';

interface NavItemProps {
  href: string;
  title: string;
  isOpen?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  MegaMenuComponent?: ReactNode;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'true' | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
}

const NavItem = ({
  href,
  title,
  onMouseEnter,
  onMouseLeave,
  MegaMenuComponent,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup
}: NavItemProps) => {
  return (
    <div
      className="relative group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <a 
        href={href} 
        className={`${styles.headerNavItem} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md`}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHaspopup}
        role={MegaMenuComponent ? 'button' : undefined}
      >
        {title}
        {MegaMenuComponent && <ArrowDown aria-hidden="true" />}
      </a>
      {MegaMenuComponent}
    </div>
  );
};

export default NavItem; 