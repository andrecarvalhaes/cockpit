import React from 'react';

type BadgeVariant = 'orange' | 'green' | 'red' | 'yellow' | 'gradient';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'orange',
  size = 'md',
  className = ''
}) => {
  const variantClasses = {
    orange: 'bg-primary text-white',
    green: 'bg-success text-white',
    red: 'bg-error text-white',
    yellow: 'bg-warning text-white',
    gradient: 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse'
  };

  const sizeClasses = {
    sm: 'text-[0.6rem] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-full uppercase ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};
