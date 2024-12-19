import { MenuType } from "@/constants/header";
import { MenuLink } from "./common/menulink";

export interface MenuBlogPost {
    id: number;
    title: string;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    post_date: string;
    url: string;
    description: string;
}

export interface MegaMenu {
    id: number;
    title: string;
    type: MenuType;
    menu_blog_post: MenuBlogPost;
    menu_links: MenuLink[];
}
  
  export interface Menu {
    id: number;
    documentId: string;
    Title: string;
    links: MenuLink[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    megamenus: MegaMenu[];
  }
  
  export interface MenuResponse {
    data: Menu;
    meta: Record<string, unknown>;
  } 