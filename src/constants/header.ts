export const HEADER_CONSTANTS = {
    Features: {
        id: 'features',
        title: 'Features',
    },
    Solutions: {
        id: 'solutions',
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
        href: '#features',
        title: HEADER_CONSTANTS.Features.title,
        menuType: HEADER_CONSTANTS.Features.id
    },
    {
        href: '#solutions',
        title: HEADER_CONSTANTS.Solutions.title,
        menuType: HEADER_CONSTANTS.Solutions.id
    },
    {
        href: '#resources',
        title: HEADER_CONSTANTS.Resources.title,
        menuType: HEADER_CONSTANTS.Resources.id
    }
] as const;