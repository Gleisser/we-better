import { TopLevelImage } from "./common/image";
import { MenuLink } from "./common/menulink";

export interface AppStore {
    id: number;
    title: string;
    images: TopLevelImage[];
}

export interface SocialLink {
    id: number;
    title: string;
    logos: TopLevelImage[];
}

export interface MenuList {
    id: number;
    Title: string;
    Type: string;
    menu_links: MenuLink[];
}

export interface Footer {
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

export interface FooterResponse {
    data: Footer;
    meta: Record<string, unknown>;
}