import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, AlertCircle, ExternalLink } from 'lucide-react';
import { Metric } from '../../types/metric';
import { getLatestValue, getPreviousValue, calculateVariation } from '../../utils/calculations';
import { formatMetricValue } from '../../utils/formatters';
import { Card } from '../shared/Card';

interface MetricCardProps {
  metric: Metric;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const navigate = useNavigate();
  const latestValue = getLatestValue(metric.values);
  const previousValue = getPreviousValue(metric.values);

  const currentValue = latestValue?.value || 0;
  const variation = previousValue ? calculateVariation(currentValue, previousValue.value) : 0;
  const isBelowTarget = currentValue < metric.target;

  const getTrendIcon = () => {
    if (variation > 0) return <TrendingUp size={16} className="text-success" />;
    if (variation < 0) return <TrendingDown size={16} className="text-error" />;
    return <Minus size={16} className="text-text-secondary" />;
  };

  const getTrendColor = () => {
    if (variation > 0) return 'text-success';
    if (variation < 0) return 'text-error';
    return 'text-text-secondary';
  };

  return (
    <Card hoverable onClick={() => navigate(`/metrics/${metric.id}`)} className="relative cursor-pointer">
      {isBelowTarget && (
        <div className="absolute top-4 right-4">
          <AlertCircle size={20} className="text-warning" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">
            {metric.area}
          </p>
          <h3 className="text-base font-heading font-bold text-text-primary mt-1">
            {metric.name}
          </h3>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-text-primary">
            {formatMetricValue(currentValue, metric.unit)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-semibold ${getTrendColor()}`}>
              {Math.abs(variation).toFixed(1)}%
            </span>
          </div>

          <div className="text-xs text-text-secondary">
            Meta: {formatMetricValue(metric.target, metric.unit)}
          </div>
        </div>

        {metric.description && (
          <p className="text-xs text-text-secondary line-clamp-2">
            {metric.description}
          </p>
        )}

        {metric.dataSourceLink && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(metric.dataSourceLink, '_blank', 'noopener,noreferrer');
            }}
            className="flex items-center gap-2 text-xs text-primary hover:text-primary-dark transition-colors mt-2 border-t border-border pt-2"
          >
            <ExternalLink size={14} />
            <span>Abrir fonte de dados</span>
          </button>
        )}
      </div>
    </Card>
  );
};
