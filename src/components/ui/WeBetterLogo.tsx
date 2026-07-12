import React from 'react';

export interface WeBetterLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  animate?: boolean;
  theme?: 'warm' | 'cool' | 'solid';
  solidColor?: string;
}

export const WeBetterLogo: React.FC<WeBetterLogoProps> = ({
  size = 120,
  animate = true,
  theme = 'warm',
  solidColor = 'currentColor',
  className = '',
  ...props
}) => {
  const strokeColor =
    theme === 'warm' ? 'url(#logo-warm)' : theme === 'cool' ? 'url(#logo-cool)' : solidColor;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke={strokeColor}
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {animate && (
        <style>
          {`
            .wb-logo-arm-left {
              stroke-dasharray: 100;
              stroke-dashoffset: 100;
              animation: wbDrawPath 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            .wb-logo-arm-right {
              stroke-dasharray: 100;
              stroke-dashoffset: 100;
              animation: wbDrawPath 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.4s;
            }
            .wb-logo-fingers {
              opacity: 0;
              stroke-dasharray: 20;
              stroke-dashoffset: 20;
              animation: wbFadeInDraw 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards 1.2s;
            }
            
            @keyframes wbDrawPath {
              to {
                stroke-dashoffset: 0;
              }
            }
            @keyframes wbFadeInDraw {
              0% {
                opacity: 0;
                stroke-dashoffset: 20;
              }
              1% {
                opacity: 1;
              }
              100% {
                opacity: 1;
                stroke-dashoffset: 0;
              }
            }
          `}
        </style>
      )}

      <defs>
        <linearGradient id="logo-warm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" /> {/* orange-500 */}
          <stop offset="50%" stopColor="#fb7185" /> {/* rose-400 */}
          <stop offset="100%" stopColor="#d946ef" /> {/* fuchsia-500 */}
        </linearGradient>
        <linearGradient id="logo-cool" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" /> {/* sky-500 */}
          <stop offset="100%" stopColor="#8b5cf6" /> {/* violet-500 */}
        </linearGradient>
      </defs>

      {/* Left arm: From top left, down to wrist, curving up to center */}
      <path
        className={animate ? 'wb-logo-arm-left' : ''}
        pathLength="100"
        d="M 16 30 L 32 80 C 34 86 42 86 44 80 L 50 50"
      />

      {/* Right arm: From top right, down to wrist, curving up to center */}
      <path
        className={animate ? 'wb-logo-arm-right' : ''}
        pathLength="100"
        d="M 84 30 L 68 80 C 66 86 58 86 56 80 L 50 50"
      />

      {/* Interlocking fingers representing the mutual supportive grip */}
      <path
        className={animate ? 'wb-logo-fingers' : ''}
        pathLength="20"
        strokeWidth="5"
        d="M 43 45 L 53 49 M 45 52 L 55 56 M 47 59 L 55 62"
      />
    </svg>
  );
};
