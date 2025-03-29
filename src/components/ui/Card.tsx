import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  fullWidth?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  header,
  footer,
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'bg-secondary text-primary rounded-lg transition-all';
  
  // Variant classes
  const variantClasses = {
    default: 'shadow',
    outlined: 'border border-color',
    flat: ''
  };
  
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${className}
  `;
  
  // Content padding
  const contentClasses = `${paddingClasses[padding]}`;
  
  return (
    <div className={`${cardClasses} ${widthClasses} overflow-hidden animate-fadeInFast`} {...props}>
      {header && (
        <div className={`border-b border-color ${paddingClasses[padding]}`}>
          {header}
        </div>
      )}
      
      <div className={contentClasses}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-color ${paddingClasses[padding]}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 