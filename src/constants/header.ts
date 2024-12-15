export const HEADER_CONSTANTS = {
    Features: {
        id: 'Highlight',
        title: 'Features',
    },
    Solutions: {
        id: 'SVG',
        title: 'Solutions',
    },
    Resources: {
        id: 'resources',
        title: 'Resources',
    },
    Teams: {
        id: 'teams',
        title: 'For Teams',
    },
    Developers: {
        id: 'developers',
        title: 'For Developers',
    },
    Creators: {
        id: 'creators',
        title: 'For Creators',
    },
    Cta: {
        id: 'cta',
        title: 'Launch App',
    },
}

export const MEGA_MENU_CONFIG = [
    {
        id: 1,
        href: '#features',
        title: HEADER_CONSTANTS.Features.title,
        type: "Highlight"
    },
    {
        id: 2,
        href: '#solutions',
        title: HEADER_CONSTANTS.Solutions.title,
        type: "SVG"
    },
    {
        id: 3,
        href: '#resources',
        title: HEADER_CONSTANTS.Resources.title,
        type: "BLOG"
    }
] as const;