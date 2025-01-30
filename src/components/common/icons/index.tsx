interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}

// Add new interface for sidebar icons
interface SidebarIconProps extends IconProps {
  // Extend existing IconProps if needed
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

export const HomeIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: SidebarIconProps) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke={color} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export const VideoIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: SidebarIconProps) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke={color} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export const ArticleIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: SidebarIconProps) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke={color} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
  </svg>
);

export const CourseIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: SidebarIconProps) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke={color} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export const PodcastIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: SidebarIconProps) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke={color} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

export const SettingsIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: SidebarIconProps) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke={color} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke={color} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const LogoutIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: SidebarIconProps) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke={color} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export const CollapseIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2.5} 
      d="M11 17l-5-5 5-5m7 10l-5-5 5-5"
      stroke="url(#collapse-gradient)" 
    />
    <defs>
      <linearGradient
        id="collapse-gradient"
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

export const TrashIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
    />
  </svg>
);

export const XIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M6 18L18 6M6 6l12 12" 
    />
  </svg>
);

export const SearchIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
    />
  </svg>
);

export const ChevronDownIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M19 9l-7 7-7-7" 
    />
  </svg>
);

export const StarIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 2L9.09 8.37L2 9.27L7 14.14L5.82 21L12 17.77L18.18 21L17 14.14L22 9.27L14.91 8.37L12 2Z" />
  </svg>
);

export const SparkleIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M9.813 15.904L9 18.75l-.813-2.846L5.25 15l2.937-.813L9 11.25l.813 2.937L12.75 15l-2.937.904zM18.259 8.715L18 9.75l-.259-1.035-1.035-.259 1.035-.259.259-1.035.259 1.035 1.035.259-1.035.259z" />
  </svg>
);

export const PlayIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const BookmarkIcon = ({ className, filled }: IconProps & { filled?: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
    />
  </svg>
);

export const MoreVerticalIcon = ({ className }: IconProps) => (
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
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

export const ChevronLeftIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 19l-7-7 7-7" 
    />
  </svg>
);

export const ChevronRightIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 5l7 7-7 7" 
    />
  </svg>
);

export const MicrophoneIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

export const StopIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 6h12v12H6z" />
  </svg>
);

export const BellIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
    />
  </svg>
);

export const PlusIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 4v16m8-8H4" 
    />
  </svg>
);

export const PencilIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
    />
  </svg>
);

export const ChartIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
    />
  </svg>
);

export const CheckmarkIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M5 13l4 4L19 7" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const DotsHorizontalIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
    />
  </svg>
);

export { ProgressUpIcon } from './ProgressUpIcon';
export { ProgressDownIcon } from './ProgressDownIcon';

export const PauseIcon = ({ className = '' }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M8 5V19M16 5V19" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const VolumeIcon = ({ 
  muted, 
  level = 1, 
  className = '' 
}: { 
  muted: boolean; 
  level?: number;
  className?: string;
}) => {
  if (muted || level === 0) {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="currentColor">
        <path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"/>
        <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z"/>
      </svg>
    );
  }

  if (level < 0.3) {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="currentColor">
        <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649V1.5zM11.469 6.097a.75.75 0 0 0-.72 1.31A1.23 1.23 0 0 1 11 8.5a1.23 1.23 0 0 1-.251 1.093.75.75 0 0 0 1.202.897A2.73 2.73 0 0 0 12.5 8.5a2.73 2.73 0 0 0-.549-1.403z"/>
      </svg>
    );
  }

  if (level < 0.7) {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="currentColor">
        <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649V1.5zM11.469 6.097a.75.75 0 0 0-.72 1.31A1.23 1.23 0 0 1 11 8.5a1.23 1.23 0 0 1-.251 1.093.75.75 0 0 0 1.202.897A2.73 2.73 0 0 0 12.5 8.5a2.73 2.73 0 0 0-.549-1.403zm2.03-1.564a.75.75 0 0 0-.671 1.342 4.23 4.23 0 0 1 0 5.25.75.75 0 1 0 1.342.671 5.73 5.73 0 0 0 0-7.121.75.75 0 0 0-.671-.142z"/>
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649V1.5z"/>
      <path d="M11.469 6.097a.75.75 0 0 0-.72 1.31A1.23 1.23 0 0 1 11 8.5a1.23 1.23 0 0 1-.251 1.093.75.75 0 0 0 1.202.897A2.73 2.73 0 0 0 12.5 8.5a2.73 2.73 0 0 0-.549-1.403zm2.03-1.564a.75.75 0 0 0-.671 1.342 4.23 4.23 0 0 1 0 5.25.75.75 0 1 0 1.342.671 5.73 5.73 0 0 0 0-7.121.75.75 0 0 0-.671-.142z"/>
    </svg>
  );
};

export const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

export const SkipBackward15Icon = ({ className = '' }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 4V2L7 7L12 12V9.5C15.3 9.5 18 12.2 18 15.5C18 18.8 15.3 21.5 12 21.5C8.7 21.5 6 18.8 6 15.5H4C4 19.9 7.6 23.5 12 23.5C16.4 23.5 20 19.9 20 15.5C20 11.1 16.4 7.5 12 7.5V4Z" 
      fill="currentColor"
    />
    <text 
      x="12" 
      y="17.5" 
      fill="currentColor" 
      fontSize="8"
      fontWeight="bold"
      fontFamily="system-ui"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      15
    </text>
  </svg>
);

export const SkipForward15Icon = ({ className = '' }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 4V2L17 7L12 12V9.5C8.7 9.5 6 12.2 6 15.5C6 18.8 8.7 21.5 12 21.5C15.3 21.5 18 18.8 18 15.5H20C20 19.9 16.4 23.5 12 23.5C7.6 23.5 4 19.9 4 15.5C4 11.1 7.6 7.5 12 7.5V4Z" 
      fill="currentColor"
    />
    <text 
      x="12" 
      y="17.5" 
      fill="currentColor" 
      fontSize="8"
      fontWeight="bold"
      fontFamily="system-ui"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      15
    </text>
  </svg>
);

export const ArticlesIcon = ({ className }: IconProps) => (
  <svg 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M19 5v14H5V5h14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
      stroke="url(#articles-gradient)" 
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path 
      d="M8 7h8M8 11h8M8 15h5" 
      stroke="url(#articles-gradient)" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <defs>
      <linearGradient 
        id="articles-gradient" 
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

export const CoursesIcon = ({ className }: IconProps) => (
  <svg 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M12 3L3 8l9 5 9-5-9-5z"
      stroke="url(#courses-gradient)" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M3 16l9 5 9-5M3 12l9 5 9-5" 
      stroke="url(#courses-gradient)" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient 
        id="courses-gradient" 
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

export const VideosIcon = ({ className }: IconProps) => (
  <svg 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <rect 
      x="3" 
      y="6" 
      width="18" 
      height="12" 
      rx="2"
      stroke="url(#videos-gradient)" 
      strokeWidth="2"
    />
    <path 
      d="M10 9l5 3-5 3V9z"
      stroke="url(#videos-gradient)" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient 
        id="videos-gradient" 
        x1="3" 
        y1="6" 
        x2="21" 
        y2="18" 
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B5CF6"/>
        <stop offset="1" stopColor="#D946EF"/>
      </linearGradient>
    </defs>
  </svg>
);

export const NewsletterIcon = ({ className }: IconProps) => (
  <svg 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      stroke="url(#newsletter-gradient)" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient 
        id="newsletter-gradient" 
        x1="3" 
        y1="5" 
        x2="21" 
        y2="19" 
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B5CF6"/>
        <stop offset="1" stopColor="#D946EF"/>
      </linearGradient>
    </defs>
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

export const StarFilledIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export const StarEmptyIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export const InfoIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);

export const SkillsIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
    />
  </svg>
);

export const ShareIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    />
  </svg>
);

export const ChevronUpIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 15l7-7 7 7" 
    />
  </svg>
);

export const ThumbUpIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
    />
  </svg>
);

export const ThumbDownIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714-.211-1.412-.608-2.006L17 13V4m-7 10h2m5 0v2a2 2 0 01-2 2h-2.5" 
    />
  </svg>
);

export const TagIcon = ({ className }: IconProps) => (
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
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);

export const UsersIcon = ({ className }: IconProps) => (
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
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export const SparklesIcon = ({ className }: IconProps) => (
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
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

export const BlockIcon = ({ className }: IconProps) => (
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
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
    />
  </svg>
);

export const EyeOffIcon = ({ className }: IconProps) => (
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
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

export const HashtagIcon = ({ className }: IconProps) => (
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
      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
    />
  </svg>
);

export const FlagIcon = ({ className }: IconProps) => (
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
      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
    />
  </svg>
);

export const WhatsAppIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: IconProps) => (
  <svg 
    className={className}
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" 
      fill={color}
    />
  </svg>
);

export const FacebookIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: IconProps) => (
  <svg 
    className={className}
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill={color}
    />
  </svg>
);

export const TwitterIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: IconProps) => (
  <svg 
    className={className}
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
      fill={color}
    />
  </svg>
);

export const LinkedInIcon = ({ className, width = 24, height = 24, color = 'currentColor' }: IconProps) => (
  <svg 
    className={className}
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      fill={color}
    />
  </svg>
);

export const VolumeOffIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
    />
  </svg>
);

// Add these new icons
export const MinimizeIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M20 12H4M4 12l6-6M4 12l6 6"
    />
  </svg>
);

export const MaximizeIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 12h16m0 0l-6-6m6 6l-6 6"
    />
  </svg>
);
