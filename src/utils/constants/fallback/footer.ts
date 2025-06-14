import { Footer } from "@/types/footer";

const FOOTER_LINKS = {
    Solutions: [
      'Courses',
      'Articles',
      'Newsletter',
      'Videos'
    ],
    About: [
      'FAQ',
      'Blog',
      'Support',
      'Contact us'
    ]
  };
  
  const FOOTER_FALLBACK : Footer = {
    id: 0,
    documentId: '',
    title: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    logo: {
      id: 0,
      documentId: '',
      url: '',
      alternativeText: '',
      name: '',
      width: 0,
      height: 0,
      caption: '',
      src: '/assets/images/footer/logo.svg',
      alt: 'We Better',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      formats: {
        thumbnail: {
          url: '/assets/images/footer/logo.svg',
          width: 100,
          height: 100
        }
      }
    },
    logoDescription: 'We Better Ltd',
    copyright: '© 2024 All Rights Reserved. We Better Ltd®',
    footer_links: [
      {
        id: 0,
        title: 'DMCA',
        href: '#',
        description: 'DMCA',
        image: {
          url: '/assets/images/footer/appstore.svg',
          formats: {
            medium: {
              url: '/assets/images/footer/appstore.svg'
            }
          }
        }
      },
      {
        id: 1,
        title: 'Legal Notice',
        href: '#',
        description: 'Legal Notice',
        image: {
          url: '/assets/images/footer/appstore.svg',
          formats: {
            medium: {
              url: '/assets/images/footer/appstore.svg'
            }
          }
        }
      },
      {
        id: 2,
        title: 'Terms of Service',
        href: '#',
        description: 'Terms of Service',
        image: {
          url: '/assets/images/footer/appstore.svg',
          formats: {
            medium: {
              url: '/assets/images/footer/appstore.svg'
            }
          }
        }
      },
      {
        id: 3,
        title: 'Cookie Policy',
        href: '#',
        description: 'Cookie Policy',
        image: {
          url: '/assets/images/footer/appstore.svg',
          formats: {
            medium: {
              url: '/assets/images/footer/appstore.svg'
            }
          }
        }
      }
    ],
    app_stores: [
      {
        id: 0,
        title: 'App Store',
        documentId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            formats: {
              thumbnail: {
                url: '/assets/images/footer/appstore.svg',
                width: 100,
                height: 100
              }
            }
          },
        ]
      },
      {
        id: 1,
        title: 'Google Play',
        documentId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            formats: {
              thumbnail: {
                url: '/assets/images/footer/play.svg',
                width: 100,
                height: 100
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
        documentId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            formats: {
              thumbnail: {
                url: '/assets/images/footer/facebook-icon.svg',
                width: 100,
                height: 100
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            formats: {
              thumbnail: {
                url: '/assets/images/footer/instagram-icon.svg',
                width: 100,
                height: 100
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            formats: {
              thumbnail: {
                url: '/assets/images/footer/discord-icon.svg',
                width: 100,
                height: 100
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            formats: {
              thumbnail: {
                url: '/assets/images/footer/x-icon.svg',
                width: 100,
                height: 100
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            formats: {
              thumbnail: {
                url: '/assets/images/footer/youtube-icon.svg',
                width: 100,
                height: 100
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            formats: {
              thumbnail: {
                url: '/assets/images/footer/fanbook-icon.svg',
                width: 100,
                height: 100
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
        documentId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        menu_links: FOOTER_LINKS.Solutions.map((link) => ({
          id: 0,
          title: link,
          href: '#',
          description: link,
          image: {
            url: '/assets/images/footer/appstore.svg',
            formats: {
              medium: {
                url: '/assets/images/footer/appstore.svg'
              }
            }
          }
        }))
      },
      {
        id: 1,
        Title: 'About',
        Type: 'Links',
        documentId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        menu_links: FOOTER_LINKS.About.map((link) => ({
          id: 0,
          title: link,
          href: '#',
          description: link,
          image: {
            url: '/assets/images/footer/appstore.svg',
            formats: {
              medium: {
                url: '/assets/images/footer/appstore.svg'
              }
            }
          }
        }))
      }
    ]
  }

  export default FOOTER_FALLBACK;