export const HEADER_CONSTANTS = {
    Resources: {
        id: 'resources',
        title: 'Resources',
    },
    Solutions: {
        id: 'SVG',
        title: 'Solutions',
    },
    Business: {
        id: 'business',
        title: 'For Business',
    },
    Mentors: {
        id: 'mentors',
        title: 'For Mentors',
    },
    Coaches: {
        id: 'coaches',
        title: 'For Coaches',
    },
    Cta: {
        id: 'cta',
        title: 'Launch App',
    },
}

export enum MenuType {
    Highlight = "Highlight",
    SVG = "SVG",
    Blog = "Blog"
}

export const MEGA_MENU_CONFIG = [
    {
        id: 1,
        href: '#resources',
        title: HEADER_CONSTANTS.Resources.title,
        type: MenuType.Blog
    },
    {
        id: 2,
        href: '#solutions',
        title: HEADER_CONSTANTS.Solutions.title,
        type: MenuType.Highlight
    },
] as const;

export default HEADER_CONSTANTS;


