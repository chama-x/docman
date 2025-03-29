import React from 'react';
import CHXLogo, { LogoSize } from './Logo';

/**
 * CHXFullLogo component props
 */
export interface CHXFullLogoProps {
  /**
   * Size of the logo
   */
  size?: LogoSize;
  /**
   * Optional CSS class to apply to the component
   */
  className?: string;
}

/**
 * Full CH-X Logo with text
 * 
 * @example
 * ```tsx
 * <CHXFullLogo size="md" />
 * ```
 */
const CHXFullLogo: React.FC<CHXFullLogoProps> = ({ size = 'md', className = '' }) => {
  // Map size to text size
  const textSizeMap: Record<LogoSize, string> = {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <CHXLogo size={size} />
      <div className={`ml-2 font-bold ${textSizeMap[size]} text-gray-900 dark:text-white`}>
        CH-<span className="text-blue-600">X</span>
      </div>
    </div>
  );
};

export default CHXFullLogo; 