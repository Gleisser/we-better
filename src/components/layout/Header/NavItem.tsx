import { ReactNode } from 'react';
import { ArrowDown } from '@/components/common';
import styles from './Header.module.css';

interface NavItemProps {
  href: string;
  title: string;
  isOpen?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  MegaMenuComponent?: ReactNode;
}

const NavItem = ({
  href,
  title,
  onMouseEnter,
  onMouseLeave,
  MegaMenuComponent
}: NavItemProps) => {
  return (
    <div
      className="relative group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <a href={href} className={styles.headerNavItem}>
        {title}
        {MegaMenuComponent && <ArrowDown />}
      </a>
      {MegaMenuComponent}
    </div>
  );
};

export default NavItem; 