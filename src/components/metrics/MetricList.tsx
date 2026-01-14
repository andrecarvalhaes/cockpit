import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ExternalLink, AlertCircle, Plus } from 'lucide-react';
import { Metric } from '../../types/metric';
import { Modal } from '../shared/Modal';
import { MetricValueForm } from './MetricValueForm';
import { useMetrics } from '../../hooks/useMetrics';
import { getLatestValue, getPreviousValue, calculateVariation } from '../../utils/calculations';
import { formatMetricValue } from '../../utils/formatters';

interface MetricListProps {
  metrics: Metric[];
}

export const MetricList: React.FC<MetricListProps> = ({ metrics }) => {
  const navigate = useNavigate();
  const { addMetricValue } = useMetrics();
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);

  const handleOpenValueModal = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsValueModalOpen(true);
  };

  const handleAddValue = async (values: any[]) => {
    if (!selectedMetric) return;

    try {
      for (const monthValue of values) {
        const [year, month] = monthValue.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 15);

        await addMetricValue(selectedMetric.id, {
          value: monthValue.value,
          date: date,
          note: monthValue.note,
        });
      }
      setIsValueModalOpen(false);
      setSelectedMetric(null);
    } catch (error) {
      console.error('Error adding values:', error);
    }
  };

  const getTrendIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp size={16} className="text-success" />;
    if (variation < 0) return <TrendingDown size={16} className="text-error" />;
    return <Minus size={16} className="text-text-secondary" />;
  };

  const getTrendColor = (variation: number) => {
    if (variation > 0) return 'text-success';
    if (variation < 0) return 'text-error';
    return 'text-text-secondary';
  };

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-bg-secondary border-b border-border">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
              Métrica
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
              Área
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
              Valor Atual
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
              Meta
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-text-primary">
              Variação
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-text-primary w-24">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => {
            const latestValue = getLatestValue(metric.values);
            const previousValue = getPreviousValue(metric.values);
            const currentValue = latestValue?.value || 0;
            const variation = previousValue ? calculateVariation(currentValue, previousValue.value) : 0;
            const isBelowTarget = currentValue < metric.target;

            return (
              <tr
                key={metric.id}
                onClick={() => navigate(`/metrics/${metric.id}`)}
                className="border-b border-border hover:bg-bg-secondary cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-start gap-2">
                    {isBelowTarget && (
                      <AlertCircle size={16} className="text-warning flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {metric.name}
                      </p>
                      {metric.description && (
                        <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                          {metric.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                    {metric.area}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm font-bold text-text-primary">
                    {formatMetricValue(currentValue, metric.unit)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm text-text-secondary">
                    {formatMetricValue(metric.target, metric.unit)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(variation)}
                    <span className={`text-sm font-semibold ${getTrendColor(variation)}`}>
                      {Math.abs(variation).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenValueModal(metric);
                      }}
                      className="p-1.5 rounded-lg hover:bg-success hover:bg-opacity-10 transition-colors text-success"
                      title="Lançar valor"
                    >
                      <Plus size={16} />
                    </button>
                    {metric.dataSourceLink && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(metric.dataSourceLink, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-1.5 rounded-lg hover:bg-bg-primary transition-colors text-primary"
                        title="Abrir fonte de dados"
                      >
                        <ExternalLink size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal de Lançamento de Valor */}
      {selectedMetric && (
        <Modal
          isOpen={isValueModalOpen}
          onClose={() => {
            setIsValueModalOpen(false);
            setSelectedMetric(null);
          }}
          title={`Lançar Novo Valor - ${selectedMetric.name}`}
          size="md"
        >
          <MetricValueForm
            onSubmit={handleAddValue}
            onCancel={() => {
              setIsValueModalOpen(false);
              setSelectedMetric(null);
            }}
            unit={selectedMetric.unit}
            existingValues={selectedMetric.values}
          />
        </Modal>
      )}
    </div>
  );
};
