/**
 * Common type definitions used throughout the application
 */

import { ReactNode } from 'react';

/**
 * Interface for components that accept children
 */
export interface WithChildren {
  children: ReactNode;
}

/**
 * Interface for components that accept className for styling
 */
export interface PropsWithClassName {
  className?: string;
}

/**
 * Combined interface for components with both children and className
 */
export type WithChildrenAndClassName = WithChildren & PropsWithClassName;

/**
 * Type for size variants used across components
 */
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Type for color variants used across components
 */
export type ColorVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';

/**
 * Type for style variants used across components
 */
export type StyleVariant = 'solid' | 'outline' | 'ghost' | 'link' | 'glass';

/**
 * Type for alignment options
 */
export type AlignmentType = 'left' | 'center' | 'right';

/**
 * Type for HTML element references
 */
export type ElementRef<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T];

/**
 * Type for record with string keys and any values
 */
export type AnyRecord = Record<string, any>;

/**
 * Type guard function to check if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
} 