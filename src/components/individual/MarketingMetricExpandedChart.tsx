import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { X, ExternalLink } from 'lucide-react';
import { useMarketingMetricsMonthly } from '../../hooks/useMarketingMetricsMonthly';

type MetricType = 'downloads' | 'leads' | 'leadsQualificados' | 'mqls';
type ViewMode = 'general' | 'channel' | 'origin';

interface MarketingMetricExpandedChartProps {
  metricType: MetricType;
  metricTitle: string;
  onClose: () => void;
  channels?: string[];
  origins?: string[];
}

// Cores para os canais/origens (paleta variada mas harmoniosa)
const COLORS = [
  '#F26600', // Laranja primário
  '#0088FE', // Azul
  '#00C49F', // Verde
  '#FFBB28', // Amarelo
  '#FF8042', // Coral
  '#8884D8', // Roxo claro
  '#82CA9D', // Verde claro
  '#FFC658', // Amarelo claro
  '#FF6B9D', // Rosa
  '#8DD1E1', // Azul claro
];

// Componente Modal de Detalhes
interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  data: Array<{ name: string; value: number; color: string }>;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, month, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">{month} - Todos os dados</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-submenu rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-2 px-3 text-sm font-medium text-text-secondary">Canal/Origem</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-text-secondary">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-border hover:bg-bg-submenu">
                  <td className="py-2 px-3 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-text-primary">{item.name}</span>
                  </td>
                  <td className="text-right py-2 px-3 text-sm font-medium text-text-primary">
                    {item.value.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente Tooltip Customizado
interface CustomTooltipProps extends TooltipProps<number, string> {
  onViewAll?: (month: string, data: Array<{ name: string; value: number; color: string }>) => void;
  colors: Record<string, string>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, onViewAll, colors }) => {
  if (!active || !payload || payload.length === 0) return null;

  // Filtrar e ordenar os dados
  const sortedData = payload
    .filter(p => p.value && p.value > 0)
    .sort((a, b) => (b.value as number) - (a.value as number));

  const top10 = sortedData.slice(0, 10);
  const hasMore = sortedData.length > 10;

  const handleViewAll = () => {
    if (onViewAll) {
      const allData = sortedData.map(p => ({
        name: p.name || '',
        value: p.value as number,
        color: colors[p.name || ''] || '#cccccc',
      }));
      onViewAll(label || '', allData);
    }
  };

  return (
    <div className="bg-white border border-border rounded-lg shadow-lg p-3 max-w-xs">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      <div className="space-y-1">
        {top10.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: colors[entry.name || ''] || '#cccccc' }}
              />
              <span className="text-xs text-text-secondary truncate">{entry.name}</span>
            </div>
            <span className="text-xs font-medium text-text-primary whitespace-nowrap">
              {(entry.value as number).toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={handleViewAll}
          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:bg-opacity-10 rounded transition-colors border border-primary"
        >
          <ExternalLink size={12} />
          Ver todos ({sortedData.length})
        </button>
      )}
    </div>
  );
};

export const MarketingMetricExpandedChart: React.FC<MarketingMetricExpandedChartProps> = ({
  metricType,
  metricTitle,
  onClose,
  channels = [],
  origins = [],
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('general');
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    month: string;
    data: Array<{ name: string; value: number; color: string }>;
  }>({
    isOpen: false,
    month: '',
    data: [],
  });

  const { monthlyData, loading, error } = useMarketingMetricsMonthly({
    metricType,
    viewMode,
    monthsCount: 12,
    channels,
    origins,
  });

  // Extrair todas as chaves únicas (canais/origens) dos dados mensais e criar mapa de cores
  const { uniqueKeys, colorMap } = useMemo(() => {
    if (viewMode === 'general') return { uniqueKeys: [], colorMap: {} };

    const keysSet = new Set<string>();
    monthlyData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'month' && key !== 'value' && key !== 'projectionExtension' && key !== 'isCurrentMonth') {
          keysSet.add(key);
        }
      });
    });

    const keys = Array.from(keysSet).sort();

    // Criar mapa de cores
    const colors: Record<string, string> = {};
    keys.forEach((key, index) => {
      colors[key] = COLORS[index % COLORS.length];
    });

    return { uniqueKeys: keys, colorMap: colors };
  }, [monthlyData, viewMode]);

  const handleViewAll = (month: string, data: Array<{ name: string; value: number; color: string }>) => {
    setDetailsModal({
      isOpen: true,
      month,
      data,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">{metricTitle}</h3>
          <p className="text-sm text-text-secondary mt-1">Evolução mensal (últimos 12 meses)</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-bg-submenu rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X size={20} className="text-text-secondary" />
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setViewMode('general')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            viewMode === 'general'
              ? 'text-primary border-primary'
              : 'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Geral
        </button>
        <button
          onClick={() => setViewMode('channel')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            viewMode === 'channel'
              ? 'text-primary border-primary'
              : 'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Por Canal
        </button>
        <button
          onClick={() => setViewMode('origin')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            viewMode === 'origin'
              ? 'text-primary border-primary'
              : 'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Por Origem
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-text-secondary">Carregando dados...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && monthlyData.length > 0 && (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'general' ? (
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  {/* Padrão tracejado para projeção */}
                  <pattern id="projection-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
                    <path d="M 0 8 L 8 0" stroke="#F26600" strokeWidth="2" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                  itemStyle={{ color: '#F26600' }}
                />
                <Bar
                  dataKey="value"
                  stackId="a"
                  fill="#F26600"
                  name="Realizado"
                />
                <Bar
                  dataKey="projectionExtension"
                  stackId="a"
                  fill="url(#projection-pattern)"
                  stroke="#F26600"
                  strokeWidth={2}
                  radius={[8, 8, 0, 0]}
                  name="Projeção (se manter ritmo)"
                />
              </BarChart>
            ) : (
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  content={<CustomTooltip onViewAll={handleViewAll} colors={colorMap} />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                {uniqueKeys.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={colorMap[key]}
                    name={key}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* No Data */}
      {!loading && !error && monthlyData.length === 0 && (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-text-secondary">Nenhum dado disponível para o período</p>
        </div>
      )}

      {/* Modal de Detalhes */}
      <DetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, month: '', data: [] })}
        month={detailsModal.month}
        data={detailsModal.data}
      />
    </div>
  );
};
