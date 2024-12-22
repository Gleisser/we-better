import { MegaMenu, MenuBlogPost as BaseMenuBlogPost, BlogPostImage } from "@/types/menu";
import { MenuLink as BaseMenuLink } from "@/types/common/menulink";

// Props interface for the MegaMenu component
export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuData?: MegaMenu;
}

// Re-export types from the base types for convenience
export type MenuImage = BlogPostImage;
export type MenuLink = BaseMenuLink;
export type MenuBlogPost = BaseMenuBlogPost; 