interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}

export const PaintIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: IconProps) => (
  <svg 
    className={className}
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const ToolIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: IconProps) => (
  <svg 
    className={className}
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DiscordIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: IconProps) => (
    <svg 
      className={className}
      width={width} 
      height={height} 
    viewBox="0 0 24 24"
  >
    <path 
      fill={color} 
                d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
    />
  </svg>
);

export const ArrowTopRight = ({ className }: IconProps) => (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
      d="M7 17L17 7M17 7H7M17 7V17" 
    />
  </svg>
);

export const ArrowRight = ({ className }: IconProps) => (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 12h14m-5-5l5 5-5 5" 
      />
    </svg>
);

export const GalleryIcon = ({ className }: IconProps) => (
    <svg 
      className={className}
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
            >
              <path 
                d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2"
                stroke="url(#paint-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path 
                d="M12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12"
                stroke="url(#paint-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="paint-gradient"
                  x1="2"
                  y1="2"
                  x2="22"
                  y2="22"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="#D946EF" />
                </linearGradient>
              </defs>
    </svg>
);

export const MobileNavIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M15 19l-7-7 7-7" />
    </svg>
);

export const MobileNavNextIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M9 5l7 7-7 7" />
    </svg>
);

export const AIMarketingIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
    >
          <path 
            d="M3 3v18h18" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M7 14l4-4 4 4 5-5" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle 
            cx="7" 
            cy="14" 
            r="2" 
            fill="none" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2"
          />
          <circle 
            cx="11" 
            cy="10" 
            r="2" 
            fill="none" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2"
          />
          <circle 
            cx="15" 
            cy="14" 
            r="2" 
            fill="none" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2"
          />
          <circle 
            cx="20" 
            cy="9" 
            r="2" 
            fill="none" 
            stroke="url(#paint0_linear)" 
            strokeWidth="2"
          />
          <defs>
            <linearGradient 
              id="paint0_linear" 
              x1="3" 
              y1="3" 
              x2="21" 
              y2="21" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
    </svg>
);

export const AIGraphicDesignIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
    >
          <path d="M12 4L4 8l8 4 8-4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round"/>
          <defs>
            <linearGradient id="paint1_linear" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
    </svg>
);

export const AIPrintOnDemandIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
    >
          {/* Printer body */}
          <path 
            d="M6 18H4a2 2 0 01-2-2v-6a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2h-2" 
            stroke="url(#paint2_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Paper tray */}
          <path 
            d="M6 14h12v8H6v-8z" 
            stroke="url(#paint2_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Top paper */}
          <path 
            d="M6 2h12v4H6V2z" 
            stroke="url(#paint2_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Printer details */}
          <circle 
            cx="18" 
            cy="11" 
            r="1" 
            fill="url(#paint2_linear)"
          />
          <defs>
            <linearGradient 
              id="paint2_linear" 
              x1="2" 
              y1="2" 
              x2="22" 
              y2="22" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
    </svg>
);

export const AIMarketingToolsIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
    >
          {/* Camera body */}
          <rect 
            x="2" 
            y="6" 
            width="20" 
            height="14" 
            rx="2" 
            stroke="url(#paint3_linear)" 
            strokeWidth="2"
          />
          {/* Camera lens */}
          <circle 
            cx="12" 
            cy="13" 
            r="4" 
            stroke="url(#paint3_linear)" 
            strokeWidth="2"
          />
          {/* Flash/top detail */}
          <path 
            d="M7 4h10" 
            stroke="url(#paint3_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Small light/button */}
          <circle 
            cx="17" 
            cy="9" 
            r="1" 
            fill="url(#paint3_linear)"
          />
          <defs>
            <linearGradient 
              id="paint3_linear" 
              x1="2" 
              y1="2" 
              x2="22" 
              y2="22" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
    </svg>
);

export const AIInteriorDesignIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
    >
          {/* Sofa base */}
          <path 
            d="M4 18v-3a2 2 0 012-2h12a2 2 0 012 2v3" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Sofa seat */}
          <path 
            d="M4 18h16" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Sofa back */}
          <path 
            d="M6 13V9a2 2 0 012-2h8a2 2 0 012 2v4" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Left armrest */}
          <path 
            d="M4 13V9a2 2 0 012-2" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Right armrest */}
          <path 
            d="M20 13V9a2 2 0 00-2-2" 
            stroke="url(#paint4_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint4_linear" 
              x1="4" 
              y1="7" 
              x2="20" 
              y2="18" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
    </svg>
);

export const AIArchitectureIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
    >
          {/* Building base */}
          <path 
            d="M3 21h18" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Main building structure */}
          <path 
            d="M5 21V7l7-4 7 4v14" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Windows left side */}
          <path 
            d="M7 9h2m-2 4h2m-2 4h2" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Windows right side */}
          <path 
            d="M15 9h2m-2 4h2m-2 4h2" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Door */}
          <path 
            d="M10 21v-3h4v3" 
            stroke="url(#paint5_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint5_linear" 
              x1="3" 
              y1="3" 
              x2="21" 
              y2="21" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
    </svg>
);

export const AINewsIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
    >
          <path 
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" 
            stroke="url(#paint6_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M16 2v4M8 2v4M3 10h18" 
            stroke="url(#paint6_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint6_linear" 
              x1="3" 
              y1="2" 
              x2="21" 
              y2="20" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
    </svg>
);

export const WikiIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
    >
          <path 
            d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" 
            stroke="url(#paint7_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M9 7h6M9 11h6M9 15h4" 
            stroke="url(#paint7_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint7_linear" 
              x1="5" 
              y1="3" 
              x2="19" 
              y2="21" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
    </svg>
);

export const FAQIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
    >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="url(#paint8_linear)" 
            strokeWidth="2" 
          />
          <path 
            d="M12 16v-4M12 8h.01" 
            stroke="url(#paint8_linear)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient 
              id="paint8_linear" 
              x1="2" 
              y1="2" 
              x2="22" 
              y2="22" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#D946EF"/>
            </linearGradient>
          </defs>
    </svg>
);

export const MobileMenuArrowIcon = ({ className }: IconProps) => (
    <svg 
        className={className}
        width="12" 
        height="8" 
        viewBox="0 0 12 8"
    >
        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2"/>
    </svg>
);

export const ButtonArrowIcon = ({ className }: IconProps) => (
    <svg   
        className={className}
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

export const ShowcaseArrowIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

export const ShowcaseArrowRightIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const ShowcaseMobileArrowIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

export const ShowcaseMobileArrowRightIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
);
