import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { X } from 'lucide-react';
import { TimePeriodMetrics, MetricasCalculadas } from '../../hooks/useOperadorTimeBreakdown';

interface MetricExpandedChartProps {
  metricName: string;
  periodMetrics: TimePeriodMetrics[];
  onClose: () => void;
  formatValue: (value: number) => string;
}

export const MetricExpandedChart: React.FC<MetricExpandedChartProps> = ({
  metricName,
  periodMetrics,
  onClose,
  formatValue,
}) => {
  // Obter valor da métrica por fase
  const getValueByPhase = (metrics: MetricasCalculadas, phase: string): number => {
    switch (phase) {
      case 'Ligações':
        return metrics.ligacoes;
      case 'Tempo total':
        return metrics.tempoTotal;
      case 'Tempo falada':
        return metrics.tempoFalada;
      case 'Tabulações Positivas':
        return metrics.tabulacoesPositivas;
      case 'Cards criados':
        return metrics.cardsCriados;
      default:
        return 0;
    }
  };

  // Preparar dados para o gráfico
  const chartData = periodMetrics.map((pm) => ({
    period: pm.periodLabel.split('\n')[0], // Usar apenas a primeira linha do label
    value: getValueByPhase(pm.metrics, metricName),
    fullLabel: pm.periodLabel,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg border border-border shadow-card">
          <p className="text-sm font-semibold text-text-primary mb-2">
            {data.fullLabel.replace('\n', ' - ')}
          </p>
          <p className="text-sm text-text-primary font-medium">
            {metricName}: {formatValue(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary bg-opacity-5 border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                Evolução: {metricName}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Gráfico de evolução ao longo do período selecionado
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white transition-all duration-200 border border-border"
            >
              <X size={16} />
              Fechar
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F26600" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F26600" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="period"
                stroke="#718096"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#718096"
                style={{ fontSize: '12px' }}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#F26600"
                fill="url(#colorValue)"
                strokeWidth={2}
                dot={{ fill: '#F26600', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats summary */}
        <div className="border-t border-border bg-bg-secondary p-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-1">Mínimo</p>
              <p className="text-lg font-bold text-text-primary">
                {formatValue(Math.min(...chartData.map(d => d.value)))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-1">Máximo</p>
              <p className="text-lg font-bold text-text-primary">
                {formatValue(Math.max(...chartData.map(d => d.value)))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-1">Média</p>
              <p className="text-lg font-bold text-text-primary">
                {formatValue(
                  chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-1">Total</p>
              <p className="text-lg font-bold text-text-primary">
                {formatValue(chartData.reduce((sum, d) => sum + d.value, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
