import { MegaMenu } from "@/types/menu";

export interface SolutionsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuData?: MegaMenu;
} 