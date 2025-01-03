export const HERO_CONSTANTS = {
    DEFAULT_TITLE: "Become Your Best Self",
    DEFAULT_SUBTITLE: "We Better helps you track your goals, overcome challenges, and unlock your full potential—all in one place.",
    DEFAULT_CTA_TEXT: "Join the Movement",
    DEFAULT_SECONDARY_CTA_TEXT: "Know More →",
    FLOATING_IMAGES: [
      {
        src: "/assets/images/hero/men_hiking.gif",
        alt: "Men Hiking",
        className: "-top-20 -left-10 -rotate-12"
      },
      {
        src: "/assets/images/hero/Woman_Planning.gif",
        alt: "Woman Planning",
        className: "-top-20 -right-10 rotate-12"
      },
      {
        src: "/assets/images/hero/couple_relationship.webp",
        alt: "Couple Relationship",
        className: "bottom-0 -left-32 -rotate-6"
      },
      {
        src: "/assets/images/hero/man_meditating.webp",
        alt: "Men Meditating",
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
      src: "/assets/images/hero/hero_main.webp",
      alt: "We Better"
    }
  };

  export default HERO_FALLBACK;