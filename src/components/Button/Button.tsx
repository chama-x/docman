import React from 'react';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Button size types 
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button component props with explicit TypeScript typing
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * Whether the button is in loading state
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Icon element to display before the button text
   */
  startIcon?: React.ReactNode;
  
  /**
   * Icon element to display after the button text
   */
  endIcon?: React.ReactNode;
  
  /**
   * Button content
   */
  children: React.ReactNode;
}

/**
 * Button component with multiple variants and sizes
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  startIcon,
  endIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base button styles
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors";
  
  // Size-specific styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  // Variant-specific styles
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
  };
  
  // Disabled styles
  const disabledStyles = "opacity-50 cursor-not-allowed";
  
  // Combine all styles
  const buttonStyles = `
    ${baseStyles} 
    ${sizeStyles[size]} 
    ${variantStyles[variant]} 
    ${disabled || isLoading ? disabledStyles : ''} 
    ${className}
  `;

  return (
    <button 
      className={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {startIcon && !isLoading && (
        <span className="mr-2">{startIcon}</span>
      )}
      
      {children}
      
      {endIcon && (
        <span className="ml-2">{endIcon}</span>
      )}
    </button>
  );
};

export default Button; 