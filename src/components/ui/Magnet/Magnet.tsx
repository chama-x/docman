import React, { useRef, ReactNode, HTMLAttributes } from "react";
import { useSpring, animated } from "@react-spring/web";

/**
 * Props for the Magnet component
 */
export interface MagnetProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content to be displayed inside the magnet
   */
  children: ReactNode;
  
  /**
   * Padding around the element in pixels that activates the magnetic effect
   * @default 100
   */
  padding?: number;
  
  /**
   * Whether the magnetic effect is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Strength of the magnetic effect (lower values = stronger pull)
   * @default 2
   */
  magnetStrength?: number;
  
  /**
   * Custom class for the wrapper div
   */
  wrapperClassName?: string;
  
  /**
   * Custom class for the inner animated div
   */
  innerClassName?: string;
}

/**
 * Magnet component that creates a magnetic effect, pulling elements toward the cursor
 * 
 * @example
 * ```tsx
 * <Magnet padding={50} magnetStrength={50}>
 *   <Button>Magnetic Button</Button>
 * </Magnet>
 * ```
 */
const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  wrapperClassName = "",
  innerClassName = "",
  ...props
}) => {
  const magnetRef = useRef<HTMLDivElement>(null);

  // Using react-spring for smoother animations
  const [springProps, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: {
      mass: 1,
      tension: 400,
      friction: 40,
    },
  }));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !magnetRef.current) return;

    const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distX = Math.abs(centerX - e.clientX);
    const distY = Math.abs(centerY - e.clientY);

    if (distX < width / 2 + padding && distY < height / 2 + padding) {
      const offsetX = (e.clientX - centerX) / magnetStrength;
      const offsetY = (e.clientY - centerY) / magnetStrength;
      
      api.start({
        x: offsetX,
        y: offsetY,
      });
    }
  };

  const handleMouseLeave = () => {
    api.start({
      x: 0,
      y: 0,
    });
  };

  return (
    <div
      ref={magnetRef}
      className={wrapperClassName}
      style={{ position: "relative", display: "inline-block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <animated.div
        className={innerClassName}
        style={{
          ...springProps,
          willChange: "transform",
        }}
      >
        {children}
      </animated.div>
    </div>
  );
};

export default Magnet; 