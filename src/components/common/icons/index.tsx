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

export const BookmarkIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="none"
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </svg>
);

export const MoreVerticalIcon = ({ className }: IconProps) => (
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
        <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649V1.5z"/>
      </svg>
    );
  }

  if (level < 0.7) {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="currentColor">
        <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649V1.5zM11.469 6.097a.75.75 0 0 0-.72 1.31A1.23 1.23 0 0 1 11 8.5a1.23 1.23 0 0 1-.251 1.093.75.75 0 0 0 1.202.897A2.73 2.73 0 0 0 12.5 8.5a2.73 2.73 0 0 0-.549-1.403z"/>
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
