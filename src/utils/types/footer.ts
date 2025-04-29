import { TopLevelImage } from "./common/image";
import { MenuLink } from "./common/menulink";
import { APIResponse, Meta } from "./common/meta";

// Base interface for timestamps
interface TimeStamps {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// App store interface
export interface AppStore extends TimeStamps {
  id: number;
  documentId: string;
  title: string;
  images: TopLevelImage[];
}

// Social media link interface
export interface SocialLink extends TimeStamps {
  id: number;
  documentId: string;
  title: string;
  logos: TopLevelImage[];
}

// Menu list interface
export interface MenuList extends TimeStamps {
  id: number;
  documentId: string;
  Title: string;
  Type: string;
  menu_links: MenuLink[];
}

// Main footer interface
export interface Footer extends TimeStamps {
  id: number;
  documentId: string;
  title: string;
  logo: TopLevelImage;
  logoDescription: string;
  copyright: string;
  footer_links: MenuLink[];
  app_stores: AppStore[];
  social_medias: SocialLink[];
  menu_lists: MenuList[];
}

// API response wrapper
export type FooterResponse = APIResponse<Footer>;
