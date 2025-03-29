import React, { useState, useRef, ButtonHTMLAttributes } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

/**
 * Button variant types
 */
export type MorphButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'glass' 
  | 'outline' 
  | 'ghost';

/**
 * Button size types
 */
export type MorphButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button shape types
 */
export type MorphButtonShape = 
  | 'rounded' 
  | 'pill' 
  | 'square' 
  | 'circle';

/**
 * Props for the MorphButton component
 */
export interface MorphButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Button variant
   * @default 'primary'
   */
  variant?: MorphButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: MorphButtonSize;

  /**
   * Button shape
   * @default 'rounded'
   */
  shape?: MorphButtonShape;

  /**
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Whether to enable the morphing effect
   * @default true
   */
  enableMorph?: boolean;

  /**
   * Whether to enable the hover scale effect
   * @default true
   */
  enableScale?: boolean;

  /**
   * Icon to show before the text
   */
  startIcon?: React.ReactNode;

  /**
   * Icon to show after the text
   */
  endIcon?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Amount of scale when hovered (1 = no scale)
   * @default 1.05
   */
  hoverScale?: number;

  /**
   * Amount of scale when pressed (1 = no scale)
   * @default 0.98
   */
  pressScale?: number;

  /**
   * Duration of the animation in ms
   * @default 150
   */
  animationDuration?: number;
}

/**
 * A button component with fluid morphing effects on interaction
 * 
 * @example
 * ```tsx
 * <MorphButton variant="primary" size="lg">
 *   Click Me
 * </MorphButton>
 * ```
 */
export const MorphButton: React.FC<MorphButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  isLoading = false,
  enableMorph = true,
  enableScale = true,
  startIcon,
  endIcon,
  className = '',
  hoverScale = 1.05,
  pressScale = 0.98,
  animationDuration = 150,
  disabled,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Use react-spring for fluid animations
  const spring = useSpring({
    transform: isPressed && enableScale
      ? `scale(${pressScale})`
      : isHovered && enableScale
        ? `scale(${hoverScale})`
        : 'scale(1)',
    config: {
      ...config.default,
      duration: animationDuration,
    },
  });

  // Apply different shadow and morph effects based on interaction state
  const hoverEffectSpring = useSpring({
    boxShadow: isHovered && enableMorph && !disabled
      ? variant === 'glass'
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 15px rgba(59, 130, 246, 0.5)'
        : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    borderRadius: isPressed && enableMorph && !disabled && shape !== 'circle'
      ? shape === 'pill'
        ? '9999px'
        : shape === 'square'
          ? '0.25rem'
          : '0.5rem'
      : isHovered && enableMorph && !disabled && shape !== 'circle'
        ? shape === 'pill'
          ? '9999px'
          : shape === 'square'
            ? '0.25rem'
            : '0.75rem'
        : shape === 'pill'
          ? '9999px'
          : shape === 'square'
            ? '0.125rem'
            : shape === 'circle'
              ? '9999px'
              : '0.5rem',
    config: {
      ...config.default,
      duration: animationDuration,
    },
  });

  // Determine button size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  }[size];

  // Size class for circle shape
  const circleSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  // Determine variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:focus:ring-gray-500',
    accent: 'bg-ch-accent-600 hover:bg-ch-accent-700 focus:ring-ch-accent-500 text-white',
    glass: 'backdrop-blur-md bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 border border-white/30 dark:border-white/10 text-gray-800 dark:text-white focus:ring-white/30 dark:focus:ring-white/10',
    outline: 'bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-400 dark:focus:ring-gray-600',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-400 dark:focus:ring-gray-600',
  }[variant];

  // Handle interaction states
  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  // Common button classes
  const commonClasses = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 transition-colors';
  
  // Apply shape-specific classes
  const shapeClass = shape === 'circle' ? circleSizeClasses : sizeClasses;
  
  // Disabled state
  const disabledClass = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <animated.button
      ref={buttonRef}
      className={`${commonClasses} ${variantClasses} ${shapeClass} ${disabledClass} ${className}`}
      style={{
        ...spring,
        ...hoverEffectSpring,
        willChange: 'transform, box-shadow, border-radius',
      }}
      disabled={disabled || isLoading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : startIcon ? (
        <span className="mr-2">{startIcon}</span>
      ) : null}
      
      {children}
      
      {!isLoading && endIcon && (
        <span className="ml-2">{endIcon}</span>
      )}
    </animated.button>
  );
};

export default MorphButton; 