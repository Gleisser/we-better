import { MenuLink } from "../MegaMenu/types";

import { MenuBlogPost } from "../MegaMenu/types";

export interface ResourcesMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuData: {
    menu_links?: MenuLink[];
    menu_blog_post?: MenuBlogPost;
  };
} 