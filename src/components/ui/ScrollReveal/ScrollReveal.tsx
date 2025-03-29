import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

/**
 * Animation effects for the ScrollReveal component
 */
export type RevealEffect = 
  | 'fade' 
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right' 
  | 'zoom' 
  | 'flip-x'
  | 'flip-y'
  | 'none';

/**
 * Animation timing functions
 */
export type RevealEasing = 
  | 'default' 
  | 'gentle' 
  | 'wobbly' 
  | 'stiff' 
  | 'slow' 
  | 'molasses';

/**
 * Props for the ScrollReveal component
 */
export interface ScrollRevealProps {
  /**
   * Content to be revealed on scroll
   */
  children: ReactNode;
  
  /**
   * The animation effect to apply
   * @default 'fade'
   */
  effect?: RevealEffect;
  
  /**
   * Delay before animation starts (in ms)
   * @default 0
   */
  delay?: number;
  
  /**
   * Duration of the animation (in ms)
   * @default 800
   */
  duration?: number;
  
  /**
   * Animation easing function
   * @default 'default'
   */
  easing?: RevealEasing;
  
  /**
   * Distance to travel for slide animations (in px)
   * @default 50
   */
  distance?: number;
  
  /**
   * Percentage of element visible before animation triggers
   * @default 0.1 (10%)
   */
  threshold?: number;
  
  /**
   * Whether to animate only once or every time the element enters viewport
   * @default true
   */
  once?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * A component that animates its children when they scroll into view
 * 
 * @example
 * ```tsx
 * <ScrollReveal effect="slide-up">
 *   <h2>This heading will slide up when it scrolls into view</h2>
 * </ScrollReveal>
 * ```
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  effect = 'fade',
  delay = 0,
  duration = 800,
  easing = 'default',
  distance = 50,
  threshold = 0.1,
  once = true,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Get spring configuration based on easing
  const springConfig = {
    default: config.default,
    gentle: config.gentle,
    wobbly: config.wobbly,
    stiff: config.stiff,
    slow: config.slow,
    molasses: { ...config.molasses, friction: 120, tension: 100 },
  }[easing];

  // Get animation properties based on effect
  const getAnimationProps = () => {
    const baseProps = {
      opacity: isVisible ? 1 : 0,
      config: { ...springConfig, duration },
      delay,
    };

    switch (effect) {
      case 'fade':
        return baseProps;
      case 'slide-up':
        return {
          ...baseProps,
          transform: isVisible 
            ? 'translate3d(0, 0, 0)' 
            : `translate3d(0, ${distance}px, 0)`,
        };
      case 'slide-down':
        return {
          ...baseProps,
          transform: isVisible 
            ? 'translate3d(0, 0, 0)' 
            : `translate3d(0, -${distance}px, 0)`,
        };
      case 'slide-left':
        return {
          ...baseProps,
          transform: isVisible 
            ? 'translate3d(0, 0, 0)' 
            : `translate3d(${distance}px, 0, 0)`,
        };
      case 'slide-right':
        return {
          ...baseProps,
          transform: isVisible 
            ? 'translate3d(0, 0, 0)' 
            : `translate3d(-${distance}px, 0, 0)`,
        };
      case 'zoom':
        return {
          ...baseProps,
          transform: isVisible 
            ? 'scale(1)' 
            : 'scale(0.8)',
        };
      case 'flip-x':
        return {
          ...baseProps,
          transform: isVisible 
            ? 'perspective(1200px) rotateX(0deg)' 
            : 'perspective(1200px) rotateX(90deg)',
          transformOrigin: 'center',
        };
      case 'flip-y':
        return {
          ...baseProps,
          transform: isVisible 
            ? 'perspective(1200px) rotateY(0deg)' 
            : 'perspective(1200px) rotateY(90deg)',
          transformOrigin: 'center',
        };
      case 'none':
        return {}; // No animation
      default:
        return baseProps;
    }
  };

  // Create spring animation with dynamic properties
  const springProps = useSpring(getAnimationProps());

  useEffect(() => {
    // Skip if no ref or effect is "none"
    if (!ref.current || effect === 'none') return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        
        if (entry.isIntersecting) {
          setIsVisible(true);
          // If we only want to animate once, disconnect the observer
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          // Reset visibility if animating multiple times
          setIsVisible(false);
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '0px',
        threshold, // Trigger when threshold % of the element is visible
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [effect, once, threshold]);

  return (
    <animated.div 
      ref={ref}
      className={`${className}`}
      style={effect === 'none' ? {} : springProps}
    >
      {children}
    </animated.div>
  );
};

export default ScrollReveal; 