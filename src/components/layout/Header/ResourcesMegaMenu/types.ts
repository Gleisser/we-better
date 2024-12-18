import { MegaMenu } from "@/types/menu";

export interface ResourcesMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuData?: MegaMenu | undefined;
} 