import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`h-[42px] px-4 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200 ${
            error ? 'border-error' : ''
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-sm text-error">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
