export interface MenuImage {
  id: number;
  width: number;
  height: number;
  name: string;
  alternativeText: string;
  caption: string;
  formats: {
    medium: {
      url: string;
    };
    small: {
      url: string;
    };
    thumbnail: {
      url: string;
    };
    large: {
      url: string;
    };
  };
  url: string;
}

export interface MenuLink {
  id: number;
  title: string;
  href: string;
  description: string;
  image: MenuImage;
}

export interface MenuBlogPost {
  id: number;
  title: string;
  description: string;
  url: string;
  cover: MenuImage;
  post_date: Date;
}

export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuData?: {
    menu_links?: MenuLink[];
    menu_blog_post?: MenuBlogPost;
  };
} 