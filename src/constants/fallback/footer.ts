import { Footer } from "@/types/footer";

const FOOTER_LINKS = {
    Solutions: [
      'AI Art Generator',
      'AI Video Generator',
      'Transparent PNG Generator',
      'AI Marketing Tools',
      'AI Graphic Design',
      'AI Print on Demand',
      'AI Photography',
      'AI Interior Design',
      'AI Architecture'
    ],
    About: [
      'API',
      'FAQ',
      'Blog',
      'Support',
      'Contact us',
      'Careers',
      'Affiliate Program',
      'Leonardo Creator Program'
    ]
  };
  
  const FOOTER_FALLBACK : Footer = {
    id: 0,
    documentId: '',
    title: '',
    logo: {
      id: 0,
      documentId: '',
      url: '',
      alternativeText: '',
      name: '',
      width: 0,
      height: 0,
      caption: '',
      src: '/assets/images/footer/logo-leonardo-ai.svg',
      alt: 'Leonardo AI',
      formats: {
        thumbnail: {
          url: '/assets/images/footer/logo-leonardo-ai.svg'
        }
      }
    },
    logoDescription: 'Leonardo Interactive Pty Ltd',
    copyright: '© 2024 All Rights Reserved. Leonardo Interactive Pty Ltd®',
    footer_links: [
      {
        id: 0,
        title: 'DMCA',
        href: '#',
        description: 'DMCA'
      },
      {
        id: 1,
        title: 'Legal Notice',
        href: '#',
        description: 'Legal Notice'
      },
      {
        id: 2,
        title: 'Terms of Service',
        href: '#',
        description: 'Terms of Service'
      },
      {
        id: 3,
        title: 'Cookie Policy',
        href: '#',
        description: 'Cookie Policy'
      }
    ],
    app_stores: [
      {
        id: 0,
        title: 'App Store',
        images: [
          {
            id: 0,
            documentId: '',
            url: '/assets/images/footer/appstore.svg',
            alternativeText: 'App Store',
            name: 'App Store',
            width: 0,
            height: 0,
            caption: '',
            src: '/assets/images/footer/appstore.svg',
            alt: 'App Store',
            formats: {
              thumbnail: {
                url: '/assets/images/footer/appstore.svg'
              }
            }
          },
        ]
      },
      {
        id: 1,
        title: 'Google Play',
        images: [
          {
            id: 0,
            documentId: '',
            url: '/assets/images/footer/play.svg',
            alternativeText: 'Google Play',
            name: 'Google Play',
            width: 0,
            height: 0,
            caption: '',
            src: '/assets/images/footer/play.svg',
            alt: 'Google Play',
            formats: {
              thumbnail: {
                url: '/assets/images/footer/play.svg'
              }
            }
          }
        ]
      }
    ],
    social_medias: [
      {
        id: 0,
        title: 'Facebook',
        logos: [
          {
            id: 0,
            documentId: '',
            url: '/assets/images/footer/facebook-icon.svg',
            alternativeText: 'Facebook',
            name: 'Facebook',
            width: 0,
            height: 0,
            caption: '',
            src: '/assets/images/footer/facebook-icon.svg',
            alt: 'Facebook',
            formats: {
              thumbnail: {
                url: '/assets/images/footer/facebook-icon.svg'
              }
            }
          },
          {
            id: 1,
            documentId: '',
            url: '/assets/images/footer/instagram-icon.svg',
            alternativeText: 'Instagram',
            name: 'Instagram',
            width: 0,
            height: 0,
            caption: '',
            src: '/assets/images/footer/instagram-icon.svg',
            alt: 'Instagram',
            formats: {
              thumbnail: {
                url: '/assets/images/footer/instagram-icon.svg'
              }
            }
          },
          {
            id: 2,
            documentId: '',
            url: '/assets/images/footer/discord-icon.svg',
            alternativeText: 'Discord',
            name: 'Discord',
            width: 0,
            height: 0,
            caption: '',
            src: '/assets/images/footer/discord-icon.svg',
            alt: 'Discord',
            formats: {
              thumbnail: {
                url: '/assets/images/footer/discord-icon.svg'
              }
            }
          },
          {
            id: 3,
            documentId: '',
            url: '/assets/images/footer/x-icon.svg',
            alternativeText: 'X',
            name: 'X',
            width: 0,
            height: 0,
            caption: '',
            src: '/assets/images/footer/x-icon.svg',
            alt: 'X',
            formats: {
              thumbnail: {
                url: '/assets/images/footer/x-icon.svg'
              }
            }
          },
          {
            id: 4,
            documentId: '',
            url: '/assets/images/footer/youtube-icon.svg',
            alternativeText: 'YouTube',
            name: 'YouTube',
            width: 0,
            height: 0,
            caption: '',
            src: '/assets/images/footer/youtube-icon.svg',
            alt: 'YouTube',
            formats: {
              thumbnail: {
                url: '/assets/images/footer/youtube-icon.svg'
              }
            }
          },
          {
            id: 5,
            documentId: '',
            url: '/assets/images/footer/fanbook-icon.svg',
            alternativeText: 'Fanbook',
            name: 'Fanbook',
            width: 0,
            height: 0,
            caption: '',
            src: '/assets/images/footer/fanbook-icon.svg',
            alt: 'Fanbook',
            formats: {
              thumbnail: {
                url: '/assets/images/footer/fanbook-icon.svg'
              }
            }
          }
        ]
      }
    ],
    menu_lists: [
      {
        id: 0,
        Title: 'Solutions',
        Type: 'Links',
        menu_links: FOOTER_LINKS.Solutions.map((link) => ({
          id: 0,
          title: link,
          href: '#',
          description: link
        }))
      },
      {
        id: 1,
        Title: 'About',
        Type: 'Links',
        menu_links: FOOTER_LINKS.About.map((link) => ({
          id: 0,
          title: link,
          href: '#',
          description: link
        }))
      }
    ]
  }

  export default FOOTER_FALLBACK;