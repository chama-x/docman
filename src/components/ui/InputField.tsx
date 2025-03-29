import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>((
  {
    id,
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    fullWidth = true,
    variant = 'outlined',
    className = '',
    disabled,
    ...props
  }, 
  ref
) => {
  // Base input classes
  const baseInputClasses = 'block transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 placeholder-muted text-primary';
  
  // Variant classes
  const variantClasses = {
    outlined: 'bg-secondary border border-color rounded-md px-4 py-2 focus:border-primary',
    filled: 'bg-input border-b border-color rounded-t-md px-4 py-2 focus:border-primary'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon padding classes
  const leftPaddingClass = leftIcon ? 'pl-10' : '';
  const rightPaddingClass = rightIcon ? 'pr-10' : '';
  
  // Error class handling
  const errorClasses = error ? 'border-error focus:border-error focus:ring-error focus:ring-opacity-20' : '';
  
  // Disabled class handling
  const disabledClasses = disabled ? 'bg-input opacity-50 cursor-not-allowed' : '';
  
  // Combine all input classes
  const inputClasses = `
    ${baseInputClasses}
    ${variantClasses[variant]}
    ${widthClasses}
    ${leftPaddingClass}
    ${rightPaddingClass}
    ${errorClasses}
    ${disabledClasses}
    ${className}
  `;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-primary text-sm font-medium mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            {leftIcon}
          </div>
        )}
        
        <input
          id={id}
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={`${id}-helper-text ${id}-error`}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted">
            {rightIcon}
          </div>
        )}
      </div>
      
      {helperText && !error && (
        <p id={`${id}-helper-text`} className="mt-1 text-xs text-muted">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField; 