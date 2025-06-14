import { Partner } from "@/types/partner";

export const PARTNERS_FALLBACK : Partner = {
    id: 1,
    documentId: '1',
    title: 'Our [highlight]Partners[/highlight]',
    brands: [
      {
        id: 1,
        documentId: '1',
        name: 'Lambda',
        logo: {
          img: {
              url: '/assets/images/partners/partner_1.svg',
          },
        },
      },
    {
      id: 2,
      documentId: '2',
      name: 'AWS',
      logo: {
        img: {
          url: '/assets/images/partners/partner_2.svg',
        },
      },
    },
    {
      id: 3,
      documentId: '3',
      name: 'Dedium',
      logo: {
        img: {
          url: '/assets/images/partners/partner_3.svg',
        },
      },
    },
    {
      id: 4,
      documentId: '4',
      name: 'IQ',
      logo: {
        img: {
          url: '/assets/images/partners/partner_4.svg',
        },
      },
    }
  ]} as const;

  export default PARTNERS_FALLBACK;