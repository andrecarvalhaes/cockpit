import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ai';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center h-[42px] px-6 rounded-lg font-semibold transition-all duration-200 focus-ring disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap';

  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    secondary: 'bg-white hover:bg-bg-secondary text-text-primary border border-border',
    success: 'bg-success hover:bg-success-hover text-white',
    danger: 'bg-error hover:bg-red-600 text-white',
    ai: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 text-white',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
