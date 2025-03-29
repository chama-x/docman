import React from 'react';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button component props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Button component with different variants and sizes
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  // Variant styles mapping
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-ch-accent-600 hover:bg-ch-accent-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-ch-x-800 dark:hover:bg-ch-x-700 dark:text-white',
    outline: 'border border-ch-accent-600 text-ch-accent-600 hover:bg-ch-accent-50 dark:border-ch-accent-400 dark:text-ch-accent-400 dark:hover:bg-ch-x-800',
    ghost: 'text-ch-accent-600 hover:bg-ch-accent-50 dark:text-ch-accent-400 dark:hover:bg-ch-x-800',
  };

  // Size styles mapping
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg',
  };

  // Common styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ch-accent-500 dark:focus:ring-offset-ch-x-900';
  
  // Full width style
  const widthStyle = isFullWidth ? 'w-full' : '';
  
  // Disabled style
  const disabledStyle = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button; 