import React, { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  rounded = 'md',
  children,
  icon,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1.5 text-sm'
  };
  
  // Rounded classes
  const roundedClasses = {
    full: 'rounded-full',
    md: 'rounded-md'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20',
    secondary: 'bg-accent bg-opacity-20 text-secondary border border-color',
    success: 'bg-success bg-opacity-10 text-success border border-success border-opacity-20',
    danger: 'bg-error bg-opacity-10 text-error border border-error border-opacity-20',
    warning: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20',
    info: 'bg-info bg-opacity-10 text-info border border-info border-opacity-20'
  };
  
  // Combine all classes
  const badgeClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${variantClasses[variant]}
    ${className}
  `;
  
  return (
    <span className={badgeClasses} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge; 