import React from 'react';

/**
 * Logo size options
 */
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * CHXLogo component props with explicit typing
 */
export interface CHXLogoProps {
  /**
   * Size of the logo
   */
  size?: LogoSize;
  /**
   * Optional CSS class to apply to the logo
   */
  className?: string;
}

/**
 * CH-X Logo component
 * 
 * @example
 * ```tsx
 * <CHXLogo size="md" />
 * ```
 */
const CHXLogo: React.FC<CHXLogoProps> = ({ size = 'md', className = '' }) => {
  // Map size to dimension
  const sizeMap: Record<LogoSize, string> = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="url(#ch-x-logo-gradient)" />
        <path
          d="M10 20L18 12L22 16L14 24L10 20Z"
          fill="white"
          fillOpacity="0.9"
        />
        <path
          d="M30 20L22 28L18 24L26 16L30 20Z"
          fill="white"
          fillOpacity="0.9"
        />
        <defs>
          <linearGradient
            id="ch-x-logo-gradient"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0070F3" />
            <stop offset="1" stopColor="#00254D" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default CHXLogo; 