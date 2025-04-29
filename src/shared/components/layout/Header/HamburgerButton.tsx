import styles from './HamburgerButton.module.css';

interface HamburgerButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const HamburgerButton = ({ onClick, isOpen }: HamburgerButtonProps) => {
  return (
    <button 
      className={`${styles.hamburger} ${isOpen ? styles.open : ''}`} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Toggle menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
};

export default HamburgerButton; 