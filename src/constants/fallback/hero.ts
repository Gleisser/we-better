export const HERO_CONSTANTS = {
    DEFAULT_TITLE: "Creativity, Unleashed.",
    DEFAULT_SUBTITLE: "Transform your ideas into reality with AI-powered tools.",
    DEFAULT_CTA_TEXT: "Get Started",
    DEFAULT_SECONDARY_CTA_TEXT: "Learn More →",
    FLOATING_IMAGES: [
      {
        src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400",
        alt: "Creative Portrait",
        className: "-top-20 -left-10 -rotate-12"
      },
      {
        src: "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?auto=format&fit=crop&w=400",
        alt: "AI Art",
        className: "-top-20 -right-10 rotate-12"
      },
      {
        src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400",
        alt: "Digital Art",
        className: "bottom-0 -left-32 -rotate-6"
      },
      {
        src: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=400",
        alt: "Fashion Design",
        className: "bottom-0 -right-32 rotate-6"
      }
    ]
  } as const; 
export const HERO_FALLBACK = {
    title: HERO_CONSTANTS.DEFAULT_TITLE,
    subtitle: HERO_CONSTANTS.DEFAULT_SUBTITLE,
    cta_text: HERO_CONSTANTS.DEFAULT_CTA_TEXT,
    secondary_cta_text: HERO_CONSTANTS.DEFAULT_SECONDARY_CTA_TEXT,
    images: HERO_CONSTANTS.FLOATING_IMAGES,
    main_image_mobile: {
      src: "/assets/images/hero/mobile/app_hero_img-mobile.webp",
      alt: "We Better Mobile App",
    },
    main_image: {
      src: "/assets/images/hero/app_hero_img.webp",
      alt: "We Better Dashboard"
    }
  };

  export default HERO_FALLBACK;