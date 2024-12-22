export interface MenuLink {
    id: number;
    title: string;
    href: string;
    description: string;
    image: {
        url: string;
        formats: {
            medium: {
                url: string;
            }
        }
    }
}