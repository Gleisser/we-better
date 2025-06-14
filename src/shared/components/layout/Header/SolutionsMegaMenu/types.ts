import { MegaMenu } from '@/utils/types/menu';

export interface SolutionsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuData?: MegaMenu;
}
