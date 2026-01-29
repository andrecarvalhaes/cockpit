import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  elevate?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  elevate = false,
  gradient = false,
  onClick,
}) => {
  const baseClasses = `
    bg-white rounded-lg border border-border shadow-card p-6
    transition-all duration-200 ease-in-out
  `;

  const hoverClasses = elevate
    ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer'
    : hoverable || onClick
    ? 'hover:shadow-card-hover cursor-pointer'
    : '';

  const gradientClasses = gradient
    ? 'bg-gradient-to-br from-primary to-orange-600 text-white border-none'
    : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
