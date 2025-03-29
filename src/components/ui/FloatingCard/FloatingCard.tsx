import React, { useState, useRef, ReactNode } from 'react';
import { useSpring, animated } from '@react-spring/web';

/**
 * Props for the FloatingCard component
 */
export interface FloatingCardProps {
  /**
   * Content to display inside the card
   */
  children: ReactNode;

  /**
   * Whether to enable the 3D effect
   * @default true
   */
  enable3D?: boolean;

  /**
   * Maximum rotation in degrees
   * @default 10
   */
  maxRotation?: number;

  /**
   * Maximum distance the card moves on the z-axis in pixels
   * @default 15
   */
  maxLift?: number;

  /**
   * Speed of the animation (higher = faster animation)
   * @default 150
   */
  speed?: number;

  /**
   * Scale factor when card is hovered (1 = no scale)
   * @default 1.02
   */
  scale?: number;

  /**
   * Whether to show a subtle glow effect
   * @default true
   */
  showGlow?: boolean;

  /**
   * Border radius of the card
   * @default 'lg'
   */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

  /**
   * Background style of the card
   * @default 'solid'
   */
  backgroundStyle?: 'solid' | 'glass' | 'gradient' | 'neu';

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * A card component that reacts to mouse movement with 3D floating effects
 * 
 * @example
 * ```tsx
 * <FloatingCard backgroundStyle="glass">
 *   <h3>Floating Card</h3>
 *   <p>This card reacts to mouse movement with a 3D effect</p>
 * </FloatingCard>
 * ```
 */
const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  enable3D = true,
  maxRotation = 10,
  maxLift = 15,
  speed = 150,
  scale = 1.02,
  showGlow = true,
  borderRadius = 'lg',
  backgroundStyle = 'solid',
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate spring properties based on mouse position
  const [springProps, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    translateZ: 0,
    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
    config: {
      mass: 1,
      tension: 350,
      friction: 40,
    },
  }));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !enable3D) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate the position of the mouse relative to the center of the card
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation angles based on mouse position
    // Normalize by dividing by half the width/height and multiplying by max rotation
    const rotateY = (mouseX / (rect.width / 2)) * maxRotation;
    const rotateX = -(mouseY / (rect.height / 2)) * maxRotation;
    
    // Calculate the intensity for shadow and z translation (0 to 1)
    const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
    const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
    const intensity = Math.min(distance / maxDistance, 1);
    
    // Update spring animation
    api.start({
      rotateX,
      rotateY,
      scale: isHovered ? scale : 1,
      translateZ: isHovered ? maxLift * intensity : 0,
      boxShadow: isHovered 
        ? showGlow 
          ? `
              0 ${5 + intensity * 10}px ${10 + intensity * 20}px -5px rgba(0, 0, 0, 0.1),
              0 0 ${intensity * 30}px rgba(59, 130, 246, ${intensity * 0.3})
            `
          : `0 ${5 + intensity * 15}px ${10 + intensity * 20}px -5px rgba(0, 0, 0, 0.2)`
        : '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
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
      scale: 1,
      translateZ: 0,
      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
    });
  };

  // Background style class
  const backgroundStyleClass = {
    solid: 'bg-white dark:bg-ch-x-800 border border-gray-100 dark:border-ch-x-700',
    glass: 'glass',
    gradient: 'bg-gradient-to-br from-white to-gray-100 dark:from-ch-x-800 dark:to-ch-x-900',
    neu: 'neu',
  }[backgroundStyle];

  // Border radius class
  const borderRadiusClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  }[borderRadius];

  return (
    <animated.div
      ref={cardRef}
      className={`p-6 transform-gpu overflow-hidden ${backgroundStyleClass} ${borderRadiusClass} ${className}`}
      style={{
        ...springProps,
        transform: enable3D
          ? springProps.rotateX.to((rx, ry, s, tz) => 
              `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s}) translateZ(${tz}px)`
            )
          : springProps.scale.to(s => `scale(${s})`),
        transformStyle: 'preserve-3d',
        willChange: 'transform, box-shadow',
        transition: `transform ${speed}ms ease-out, box-shadow ${speed}ms ease-out`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </animated.div>
  );
};

export default FloatingCard; 