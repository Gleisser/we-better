import { MenuType } from "@/constants/fallback/header";
import { MenuLink } from "./common/menulink";
import { APIResponse } from "./common/meta";

// Base interface for timestamps
interface TimeStamps {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Blog post image format interface
interface ImageFormats {
  large?: {
    url: string;
  };
  medium?: {
    url: string;
  };
  small?: {
    url: string;
  };
  thumbnail: {
    url: string;
  };
}

// Blog post cover image interface
export interface BlogPostImage {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string;
  name: string;
  width: number;
  height: number;
  caption: string;
  formats: ImageFormats;
}

// Blog post interface
export interface MenuBlogPost extends TimeStamps {
  id: number;
  title: string;
  documentId: string;
  post_date: string;
  url: string;
  description: string;
  cover: BlogPostImage;
}

// Mega menu interface
export interface MegaMenu extends TimeStamps {
  id: number;
  title: string;
  type: MenuType;
  menu_blog_post: MenuBlogPost;
  menu_links: MenuLink[];
}

// Main menu interface
export interface Menu extends TimeStamps {
  id: number;
  documentId: string;
  Title: string;
  links: MenuLink[];
  megamenus: MegaMenu[];
}

// API response wrapper
export type MenuResponse = APIResponse<Menu>; 