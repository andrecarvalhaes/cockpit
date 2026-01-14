import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  const baseClasses = 'bg-white rounded-lg border border-border shadow-card p-6 transition-all duration-200';
  const hoverClasses = hoverable ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
