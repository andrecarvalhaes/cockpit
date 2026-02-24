import React from 'react';

interface MonthRangePickerProps {
  startMonth: string;
  endMonth: string;
  onStartMonthChange: (month: string) => void;
  onEndMonthChange: (month: string) => void;
  label?: string;
}

export const MonthRangePicker: React.FC<MonthRangePickerProps> = ({
  startMonth,
  endMonth,
  onStartMonthChange,
  onEndMonthChange,
  label,
}) => {
  return (
    <div className="flex items-center gap-3">
      {label && (
        <label className="text-sm font-medium text-text-primary whitespace-nowrap">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="month"
          value={startMonth}
          onChange={(e) => onStartMonthChange(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        <span className="text-text-secondary">até</span>
        <input
          type="month"
          value={endMonth}
          onChange={(e) => onEndMonthChange(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
};
