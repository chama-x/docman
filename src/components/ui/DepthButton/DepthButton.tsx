import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated, to as interpolate } from '@react-spring/web';

/**
 * Supported button variants
 */
export type DepthButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'subtle' 
  | 'glass' 
  | 'outline' 
  | 'ghost';

/**
 * Available button sizes
 */
export type DepthButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button shape options
 */
export type DepthButtonShape = 
  | 'rounded' 
  | 'pill' 
  | 'square' 
  | 'circle';

/**
 * Props for the DepthButton component
 */
export interface DepthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: DepthButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: DepthButtonSize;

  /**
   * Button shape
   * @default 'rounded'
   */
  shape?: DepthButtonShape;

  /**
   * Icon to display before button text
   */
  startIcon?: React.ReactNode;

  /**
   * Icon to display after button text
   */
  endIcon?: React.ReactNode;

  /**
   * Whether the button is in loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Whether to enable the 3D effect on hover
   * @default true
   */
  enable3D?: boolean;

  /**
   * Whether to enable the magnetic effect
   * @default true
   */
  enableMagnetic?: boolean;

  /**
   * Whether to enable the scale effect
   * @default true
   */
  enableScale?: boolean;

  /**
   * The magnetic strength (lower = stronger)
   * @default 3
   */
  magneticStrength?: number;

  /**
   * The scale factor when hovering
   * @default 1.03
   */
  hoverScale?: number;

  /**
   * The scale factor when pressed
   * @default 0.97
   */
  pressScale?: number;

  /**
   * The depth factor for 3D effect (higher = more depth)
   * @default 20
   */
  depthFactor?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Animation duration in milliseconds
   * @default 200
   */
  animationDuration?: number;

  /**
   * Whether to show subtle particles on click
   * @default true
   */
  enableParticles?: boolean;
}

/**
 * A highly interactive button with depth, magnetic effects, and micro-animations
 * 
 * @example
 * ```tsx
 * <DepthButton variant="accent" size="lg" enableMagnetic>
 *   Click Me
 * </DepthButton>
 * ```
 */
export const DepthButton: React.FC<DepthButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  startIcon,
  endIcon,
  isLoading = false,
  enable3D = true,
  enableMagnetic = true,
  enableScale = true,
  magneticStrength = 3,
  hoverScale = 1.03,
  pressScale = 0.97,
  depthFactor = 20,
  className = '',
  animationDuration = 200,
  enableParticles = true,
  disabled,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string }>>([]);
  
  // Base styles for each variant
  const variantStyles: Record<DepthButtonVariant, string> = {
    primary: 'bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30 active:shadow-blue-600/20',
    secondary: 'bg-gray-100 text-gray-800 shadow-md hover:shadow-gray-400/20 dark:bg-gray-700 dark:text-white dark:hover:shadow-gray-600/20',
    accent: 'bg-ch-accent-600 text-white shadow-lg hover:shadow-ch-accent-500/30 active:shadow-ch-accent-600/20 dark:bg-ch-accent-500',
    subtle: 'bg-gray-50 text-gray-700 shadow-sm hover:shadow-gray-300/30 dark:bg-gray-800 dark:text-gray-200',
    glass: 'bg-white/20 backdrop-blur-md text-gray-800 shadow-md hover:shadow-gray-400/20 dark:text-white dark:bg-gray-900/40 border border-white/30 dark:border-gray-700/30',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:bg-gray-800/80',
  };

  // Size styles
  const sizeStyles: Record<DepthButtonSize, string> = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl',
  };

  // Shape styles
  const shapeStyles: Record<DepthButtonShape, string> = {
    rounded: 'rounded-lg',
    pill: 'rounded-full',
    square: 'rounded-none',
    circle: 'rounded-full aspect-square p-0 flex items-center justify-center',
  };

  // Icon sizing based on button size
  const iconSizeStyles: Record<DepthButtonSize, string> = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  // Circle sizing based on button size
  const circleSizeStyles: Record<DepthButtonSize, string> = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
  };

  // Spring animation for hover/press effects
  const [springProps, api] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 1, tension: 350, friction: 40, duration: animationDuration },
  }));

  // Particle cleanup
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  // Handle click with particle generation
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    
    if (enableParticles) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Generate 8-12 particles
        const particleCount = Math.floor(Math.random() * 5) + 8;
        const newParticles = Array.from({ length: particleCount }).map((_, i) => {
          // Random properties for each particle
          const angle = Math.random() * Math.PI * 2;
          const velocity = 2 + Math.random() * 4;
          const size = 4 + Math.random() * 8;
          
          // Get button background color for particles
          let baseColor = '#4338ca'; // Default fallback
          if (variant === 'primary') baseColor = '#2563eb';
          if (variant === 'accent') baseColor = '#ec4899';
          if (variant === 'secondary') baseColor = '#6b7280';
          
          // Create slightly different colors for variety
          const colorVariation = Math.floor(Math.random() * 30) - 15;
          const r = parseInt(baseColor.slice(1, 3), 16) + colorVariation;
          const g = parseInt(baseColor.slice(3, 5), 16) + colorVariation;
          const b = parseInt(baseColor.slice(5, 7), 16) + colorVariation;
          
          const clamp = (num: number) => Math.min(255, Math.max(0, num));
          const color = `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
          
          return {
            id: Date.now() + i,
            x,
            y,
            velocity,
            angle,
            size,
            color,
          };
        });
        
        setParticles(newParticles);
      }
    }
    
    // Call the provided onClick handler
    onClick?.(e);
  };

  // Magnetic effect
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading || !enableMagnetic) return;
    
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      // Calculate x and y offset for 3D effect
      const rotateX = enable3D ? distanceY / depthFactor : 0;
      const rotateY = enable3D ? -distanceX / depthFactor : 0;
      
      // Calculate x and y position for magnetic effect
      const moveX = enableMagnetic ? distanceX / magneticStrength : 0;
      const moveY = enableMagnetic ? distanceY / magneticStrength : 0;
      
      // Update spring with new values
      api.start({
        xys: [moveX, moveY, enableScale ? hoverScale : 1],
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!enableMagnetic && enableScale) {
      api.start({ xys: [0, 0, hoverScale] });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    api.start({ xys: [0, 0, 1] });
  };

  const handleMouseDown = () => {
    setIsPressed(true);
    api.start({ xys: [0, 0, pressScale] });
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (isHovered) {
      api.start({ xys: [0, 0, enableScale ? hoverScale : 1] });
    } else {
      api.start({ xys: [0, 0, 1] });
    }
  };

  // Combine all styles
  const buttonSizeClass = shape === 'circle' ? circleSizeStyles[size] : sizeStyles[size];
  const combinedClassName = `
    relative font-medium transition-colors inline-flex items-center justify-center
    ${variantStyles[variant]}
    ${buttonSizeClass}
    ${shapeStyles[shape]}
    ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  // Create React Spring transform style
  const trans = (x: number, y: number, s: number) => 
    `perspective(800px) translateX(${x}px) translateY(${y}px) scale(${s})`;

  // Loading spinner
  const renderSpinner = () => (
    <svg 
      className={`animate-spin mr-2 ${iconSizeStyles[size]} text-current`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <animated.button
      ref={buttonRef}
      className={combinedClassName}
      disabled={disabled || isLoading}
      style={{
        transform: interpolate(springProps.xys, trans),
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      {...props}
    >
      {/* Particles */}
      {enableParticles && particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full pointer-events-none z-10"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `translate(-50%, -50%)`,
            animation: `particleAnimation 0.6s ease-out forwards`,
          }}
        />
      ))}
      
      {/* Button Content */}
      {isLoading && renderSpinner()}
      {!isLoading && startIcon && (
        <span className={`mr-2 ${iconSizeStyles[size]}`}>{startIcon}</span>
      )}
      <span className="relative z-0">{children}</span>
      {!isLoading && endIcon && (
        <span className={`ml-2 ${iconSizeStyles[size]}`}>{endIcon}</span>
      )}
    </animated.button>
  );
};

export default DepthButton; 