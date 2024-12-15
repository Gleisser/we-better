import { MenuBlogPost } from "../MegaMenu/types";
import { MenuLink } from "../MegaMenu/types";

export interface SolutionsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuData?: {
    menu_links?: MenuLink[];
    menu_blog_post?: MenuBlogPost;
  };
} 