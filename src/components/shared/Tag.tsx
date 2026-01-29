import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'new' | 'ai';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-primary text-white',
    new: 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse',
    ai: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
  };

  return (
    <span
      className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full lowercase ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
