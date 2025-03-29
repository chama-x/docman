import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

/**
 * Available card styles
 */
export type BreathingCardStyle = 
  | 'minimal'   // Clean, simple with subtle effects
  | 'depth'     // Prominent 3D effect
  | 'glass'     // Translucent glass effect
  | 'glow'      // Subtle glow on hover
  | 'gradient'  // Dynamic gradient background
  | 'pulse';    // Subtle pulsing animation

/**
 * Border radius options
 */
export type BorderRadiusSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

/**
 * Animation speed options
 */
export type AnimationSpeed = 'slow' | 'medium' | 'fast';

/**
 * Props for the BreathingCard component
 */
export interface BreathingCardProps {
  /**
   * Content to display inside the card
   */
  children: React.ReactNode;
  
  /**
   * Card style variant
   * @default 'minimal'
   */
  style?: BreathingCardStyle;
  
  /**
   * Border radius size
   * @default 'lg'
   */
  borderRadius?: BorderRadiusSize;
  
  /**
   * Maximum rotation angle in degrees
   * @default 5
   */
  maxRotation?: number;
  
  /**
   * Whether to enable the breathing effect
   * @default true
   */
  enableBreathing?: boolean;
  
  /**
   * Whether to enable the hover effect
   * @default true
   */
  enableHover?: boolean;
  
  /**
   * Whether to enable the parallax effect for child elements
   * @default false
   */
  enableParallax?: boolean;
  
  /**
   * Animation speed
   * @default 'medium'
   */
  animationSpeed?: AnimationSpeed;
  
  /**
   * Container element to constrain hover effect
   * Pass a ref to element to use as boundary for effect
   */
  boundaryRef?: React.RefObject<HTMLElement>;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * CSS classes for the inner content container
   */
  contentClassName?: string;
  
  /**
   * Depth factor for the 3D effect (higher = more pronounced)
   * @default 40
   */
  depthFactor?: number;
  
  /**
   * Sensitivity of hover tracking (lower = more sensitive)
   * @default 40
   */
  sensitivity?: number;
  
  /**
   * Whether to add a subtle shadow
   * @default true
   */
  enableShadow?: boolean;
}

/**
 * A card component with fluid animations, 3D effects, and responsive hover states
 * 
 * @example
 * ```tsx
 * <BreathingCard style="glass" enableParallax>
 *   <h3>Card Title</h3>
 *   <p>Card content with parallax effect</p>
 * </BreathingCard>
 * ```
 */
export const BreathingCard: React.FC<BreathingCardProps> = ({
  children,
  style = 'minimal',
  borderRadius = 'lg',
  maxRotation = 5,
  enableBreathing = true,
  enableHover = true,
  enableParallax = false,
  animationSpeed = 'medium',
  boundaryRef,
  className = '',
  contentClassName = '',
  depthFactor = 40,
  sensitivity = 40,
  enableShadow = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation speeds mapping
  const animationSpeedMap = {
    slow: { mass: 1, tension: 120, friction: 40 },
    medium: { mass: 1, tension: 280, friction: 40 },
    fast: { mass: 1, tension: 420, friction: 30 },
  };

  // Calculate breathing animation props
  const breathingProps = useSpring({
    scale: enableBreathing ? (isHovered ? 1.02 : 1.01) : 1,
    loop: enableBreathing && !isHovered ? { reverse: true } : false,
    from: { scale: 1 },
    to: { scale: enableBreathing && !isHovered ? 1.01 : 1 },
    config: {
      mass: 1,
      tension: 80,
      friction: 20,
      duration: 3000,
    },
  });

  // Calculate 3D rotation animation props
  const [{ rotateX, rotateY, shadow, translateZ }, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    shadow: 0,
    translateZ: 0,
    config: animationSpeedMap[animationSpeed],
  }));

  // Apply styles based on the style prop
  const getStyleClasses = (): string => {
    const baseClasses = 'transition-colors duration-200';
    const radiusClasses = {
      'none': 'rounded-none',
      'sm': 'rounded-sm',
      'md': 'rounded',
      'lg': 'rounded-lg',
      'xl': 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      'full': 'rounded-full',
    };
    
    // Style-specific classes
    const styleClasses = {
      minimal: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      depth: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      glass: 'glass-morphism',
      glow: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover-glow',
      gradient: 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10 dark:from-indigo-800/20 dark:to-purple-900/20 border border-white/20 dark:border-gray-700/40',
      pulse: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pulse-effect',
    };
    
    return `${baseClasses} ${styleClasses[style]} ${radiusClasses[borderRadius]}`;
  };

  // Track mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableHover || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate cursor position relative to card center
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation values (negative to make it follow the cursor)
    const rotX = (mouseY / height) * maxRotation;
    const rotY = (-mouseX / width) * maxRotation;
    
    // Apply rotations and effects
    api.start({
      rotateX: rotX,
      rotateY: rotY,
      shadow: 1,
      translateZ: style === 'depth' ? 8 : 0,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    api.start({
      rotateX: 0,
      rotateY: 0,
      shadow: 0,
      translateZ: 0,
    });
  };

  // Apply effect to children for parallax effect if enabled
  const childrenWithParallax = enableParallax
    ? React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        // Create a subtle parallax effect for direct children
        return React.cloneElement(child, {
          style: {
            ...(child.props.style || {}),
            transform: isHovered ? 'translateZ(20px)' : 'none',
            transition: 'transform 0.3s ease',
          },
        });
      })
    : children;

  // Get depth-dependent shadow size
  const shadowSize = shadow.to((s) => enableShadow ? `0px ${4 + s * 10}px ${10 + s * 20}px rgba(0, 0, 0, ${0.05 + s * 0.1})` : 'none');

  return (
    <animated.div
      ref={cardRef}
      className={`overflow-hidden ${getStyleClasses()} ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        transform: isHovered && enableHover 
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${breathingProps.scale})`
          : `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(${breathingProps.scale})`,
        boxShadow: shadowSize,
        willChange: 'transform, box-shadow',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`relative z-10 h-full ${contentClassName}`} style={{ transformStyle: 'preserve-3d' }}>
        {childrenWithParallax}
      </div>
      
      {/* Subtle gradient overlay for depth effect */}
      {style === 'depth' && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-30 z-0 mix-blend-overlay bg-gradient-to-br from-white via-transparent to-black dark:from-gray-700 dark:to-black"
          style={{
            transform: rotateX.to((rx) => `rotateX(${-rx * 0.3}deg)`),
          }}
        />
      )}
      
      {/* Subtle glow effect */}
      {style === 'glow' && isHovered && (
        <div className="absolute inset-0 pointer-events-none bg-blue-500/10 dark:bg-blue-400/10 z-0 blur-xl rounded-full transition-opacity duration-300" />
      )}
    </animated.div>
  );
};

export default BreathingCard; 