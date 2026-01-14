import React from 'react';

interface DatePickerProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-[42px] px-4 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200 ${
          error ? 'border-error' : ''
        } ${className}`}
      />
      {error && (
        <span className="text-sm text-error">{error}</span>
      )}
    </div>
  );
};
