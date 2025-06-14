import { MegaMenu } from '@/utils/types/menu';

export interface ResourcesMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuData?: MegaMenu;
}
