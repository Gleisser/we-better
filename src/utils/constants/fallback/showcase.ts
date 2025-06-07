import { ThumbnailImage } from "@/types/common/image";

export type ShowcaseItem = {
  id: number;
  title: string;
  description: string;
  images: ThumbnailImage[];
};

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 1,
    title: "Courses",
    description: "",
    images: [
      {
        id: 1,
        documentId: "1",
        name: "Courses",
        alternativeText: "Courses",
        caption: "Courses",
        width: 100,
        height: 100,
        url: "/assets/images/showcase/belt/courses.png",
        src: "/assets/images/showcase/belt/courses.png",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        alt: "Courses",

        img: {
          formats: {
            thumbnail: {
              url: "/assets/images/showcase/belt/courses.png",
              width: 100,
              height: 100,
            },
          },
        },
      }
    ]
  },
  {
    id: 2,
    title: "E-Books",
    description: "",
    images: [
      {
        id: 1,
        documentId: "1",
        name: "E-Books",
        alternativeText: "E-Books",
        caption: "E-Books",
        width: 100,
        height: 100,
        url: "/assets/images/showcase/belt/ebooks.png",
        src: "/assets/images/showcase/belt/ebooks.png",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        alt: "E-Books",
        img: {
          formats: {
            thumbnail: {
              url: "/assets/images/showcase/belt/ebooks.png",
              width: 100,
              height: 100,
            },
          },
        },
      }
    ]
  },
  {
    id: 3,
    title: "Insights",
    description: "",
    images: [
      {
        id: 1,
        documentId: "1",
        name: "Insights",
        alternativeText: "Insights",
        caption: "Insights",
        width: 100,
        height: 100,
        url: "/assets/images/showcase/belt/insights.png",
        src: "/assets/images/showcase/belt/insights.png",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        alt: "Insights",
        img: {
          formats: {
            thumbnail: {
              url: "/assets/images/showcase/belt/insights.png",
              width: 100,
              height: 100,
            },
          },
        },
      },
    ]
  },
  {
    id: 4,
    title: "Networking",
    description: "",
    images: [
      {
        id: 1,
        documentId: "1",
        name: "Networking",
        alternativeText: "Networking",
        caption: "Networking",
        width: 100,
        height: 100,
        url: "/assets/images/showcase/belt/networking.png",
        src: "/assets/images/showcase/belt/networking.png",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        alt: "Networking",
        img: {
          formats: {
            thumbnail: {
              url: "/assets/images/showcase/belt/networking.png",
              width: 100,
              height: 100,
            },
          },
        },
      },
    ]
  },
  {
    id: 5,
    title: "Newsletter",
    description: "",
    images: [
      {
        id: 1,
        documentId: "1",
        name: "Newsletter",
        alternativeText: "Newsletter",
        caption: "Newsletter",
        width: 100,
        height: 100,
        url: "/assets/images/showcase/belt/newsletter.png",
        src: "/assets/images/showcase/belt/newsletter.png",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        alt: "Newsletter",
        img: {
          formats: {
            thumbnail: {
              url: "/assets/images/showcase/belt/newsletter.png",
              width: 100,
              height: 100,
            },
          },
        },
      },
    ]
  },
  {
    id: 6,
    title: "Spreadsheets",
    description: "",
    images: [
      {
        id: 1,
        documentId: "1",
        name: "Spreadsheets",
        alternativeText: "Spreadsheets",
        caption: "Spreadsheets",
        width: 100,
        height: 100,
        url: "/assets/images/showcase/belt/spreadsheets.png",
        src: "/assets/images/showcase/belt/spreadsheets.png",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        alt: "Spreadsheets",
        img: {
          formats: {
            thumbnail: {
              url: "/assets/images/showcase/belt/spreadsheets.png",
              width: 100,
              height: 100,
            },
          },
        },
      },
    ]
  },
  {
    id: 7,
    title: "Playlists",
    description: "",
    images: [
      {
        id: 1,
        documentId: "1",
        name: "Playlists",
        alternativeText: "Playlists",
        caption: "Playlists",
        width: 100,
        height: 100,
        url: "/assets/images/showcase/belt/playlists.webp",
        src: "/assets/images/showcase/belt/playlists.webp",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        alt: "Playlists",
        img: {
          formats: {
            thumbnail: {
              url: "/assets/images/showcase/belt/playlists.webp",
              width: 100,
              height: 100,
            },
          },
        },
      },
    ]
  },
  {
    id: 8,
    title: "Progress Tracking",
    description: "",
    images: [
      {
        id: 1,
        documentId: "1",
        name: "Progress Tracking",
        alternativeText: "Progress Tracking",
        caption: "Progress Tracking",
        width: 100,
        height: 100,
        url: "/assets/images/showcase/belt/tracking.png",
        src: "/assets/images/showcase/belt/tracking.png",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        alt: "Progress Tracking",
        img: {
          formats: {
            thumbnail: {
              url: "/assets/images/showcase/belt/tracking.png",
              width: 100,
              height: 100,
            },
          },
        },
      },
    ]
  }
];

export const SHOWCASE_FALLBACK = {
  title: "Unlock Your Growth Journey with",
  subtitle: "Tailored Resources",
  belts: SHOWCASE_ITEMS,
}

export default SHOWCASE_FALLBACK;