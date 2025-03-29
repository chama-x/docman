import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Button variants using class-variance-authority
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary:
          'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700',
        outline:
          'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-950',
        ghost:
          'bg-transparent text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950',
        link: 'bg-transparent text-primary-600 hover:underline dark:text-primary-400',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant,
      size,
      fullWidth,
      isLoading = false,
      className = '',
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, fullWidth, className })}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
); 