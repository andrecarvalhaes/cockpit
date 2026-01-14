import React from 'react';
import { useMetrics } from '../../hooks/useMetrics';
import { Select } from '../shared/Select';

interface MetricFiltersProps {
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
}

export const MetricFilters: React.FC<MetricFiltersProps> = ({
  selectedPeriod,
  onPeriodChange,
  selectedArea,
  onAreaChange,
}) => {
  const { metrics } = useMetrics();

  // Busca todas as áreas únicas das métricas existentes
  const uniqueAreas = Array.from(new Set(metrics.map((m) => m.area))).sort();

  const periodOptions = [
    { value: 'all', label: 'Todos os períodos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Este mês' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este ano' },
  ];

  const areaOptions = [
    { value: 'all', label: 'Todas as áreas' },
    ...uniqueAreas.map((area) => ({ value: area, label: area })),
  ];

  return (
    <div className="flex gap-4 flex-wrap">
      {selectedPeriod !== undefined && onPeriodChange && (
        <div className="w-48">
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
          />
        </div>
      )}
      <div className="w-48">
        <Select
          options={areaOptions}
          value={selectedArea}
          onChange={(e) => onAreaChange(e.target.value)}
        />
      </div>
    </div>
  );
};
