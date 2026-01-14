import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`h-[42px] px-4 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200 ${
            error ? 'border-error' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-sm text-error">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
