import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Metric } from '../../types/metric';
import { formatMetricValue } from '../../utils/formatters';
import { getTargetForDate } from '../../utils/calculations';

type ChartType = 'line' | 'bar' | 'area';

interface MetricChartProps {
  metric: Metric;
  height?: number;
  chartType?: ChartType;
}

export const MetricChart: React.FC<MetricChartProps> = ({ metric, height = 300, chartType = 'line' }) => {
  const chartData = metric.values
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((value) => ({
      date: format(new Date(value.date), 'MM/yy', { locale: ptBR }),
      value: value.value,
      target: getTargetForDate(metric, new Date(value.date)),
      fullDate: format(new Date(value.date), 'MM/yyyy', { locale: ptBR }),
    }));

  // Calcular domínio do eixo Y baseado nos valores
  const minValue = Math.min(...metric.values.map(v => v.value));
  const maxValue = Math.max(...metric.values.map(v => v.value));
  // Só usar domínio automático se houver valores negativos significativos (mais de 1% do range ou maior que 10)
  const range = maxValue - minValue;
  const threshold = Math.max(10, Math.abs(range * 0.01));
  const yAxisDomain: [number | 'auto', number | 'auto'] = minValue < -threshold ? ['auto', 'auto'] : [0, 'auto'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border border-border shadow-card">
          <p className="text-sm font-semibold text-text-primary">
            {payload[0].payload.fullDate}
          </p>
          <p className="text-sm text-text-secondary">
            {formatMetricValue(payload[0].value, metric.unit)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey="date" stroke="#718096" style={{ fontSize: '12px' }} />
          <YAxis stroke="#718096" style={{ fontSize: '12px' }} domain={yAxisDomain} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#48C74C"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Meta"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#F26600"
            strokeWidth={2}
            dot={{ fill: '#F26600', r: 4 }}
            activeDot={{ r: 6 }}
            name="Valor"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'area') {
    // Calcular a meta média para a linha de referência
    const avgTarget = chartData.length > 0
      ? chartData.reduce((sum, item) => sum + item.target, 0) / chartData.length
      : 0;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey="date" stroke="#718096" style={{ fontSize: '12px' }} />
          <YAxis stroke="#718096" style={{ fontSize: '12px' }} domain={yAxisDomain} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgTarget}
            stroke="#48C74C"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{ value: 'Meta', position: 'right', fill: '#48C74C', fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#F26600"
            fill="#F26600"
            fillOpacity={0.2}
            strokeWidth={2}
            name="Valor"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'bar') {
    // Calcular a meta média para a linha de referência
    const avgTarget = chartData.length > 0
      ? chartData.reduce((sum, item) => sum + item.target, 0) / chartData.length
      : 0;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey="date" stroke="#718096" style={{ fontSize: '12px' }} />
          <YAxis stroke="#718096" style={{ fontSize: '12px' }} domain={yAxisDomain} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgTarget}
            stroke="#48C74C"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{ value: 'Meta', position: 'right', fill: '#48C74C', fontSize: 12 }}
          />
          <Bar dataKey="value" fill="#F26600" radius={[8, 8, 0, 0]} name="Valor" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-text-secondary">Tipo de gráfico não suportado</p>
    </div>
  );
};
