import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  colorThresholds?: {
    low: number;
    medium: number;
  };
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  height = 'md',
  colorThresholds = { low: 80, medium: 100 }
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const getColor = () => {
    if (percentage < colorThresholds.low) return 'bg-error';
    if (percentage < colorThresholds.medium) return 'bg-warning';
    return 'bg-success';
  };

  const heightClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2'
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-border rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`h-full ${getColor()} rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-text-secondary mt-1 text-right">
          {value} / {max} ({percentage.toFixed(0)}%)
        </div>
      )}
    </div>
  );
};
