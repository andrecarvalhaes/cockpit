import React, { useState } from 'react';
import { MarketingFilters, MarketingFiltersState } from '../components/individual/MarketingFilters';
import { MarketingMetricExpandedChart } from '../components/individual/MarketingMetricExpandedChart';
import { useMarketingMetrics } from '../hooks/useMarketingMetrics';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Download, Users, UserCheck, Target, TrendingUp, TrendingDown, Maximize2, Minimize2 } from 'lucide-react';

type MetricType = 'downloads' | 'leads' | 'leadsQualificados' | 'mqls';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  previousValue?: number;
  isComparison?: boolean;
  isExpanded?: boolean;
  onExpand?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  previousValue,
  isComparison = false,
  isExpanded = false,
  onExpand
}) => {
  const calculateVariation = () => {
    if (!isComparison || previousValue === undefined || previousValue === 0) return null;
    const variation = ((value - previousValue) / previousValue) * 100;
    return variation;
  };

  const variation = calculateVariation();

  return (
    <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
          <p className="text-3xl font-bold text-text-primary">{value.toLocaleString('pt-BR')}</p>

          {isComparison && previousValue !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-text-secondary">
                Período anterior: {previousValue.toLocaleString('pt-BR')}
              </span>
              {variation !== null && (
                <div className={`flex items-center gap-1 ${variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {variation >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="text-xs font-semibold">
                    {Math.abs(variation).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
          {icon}
        </div>
      </div>

      {/* Botão Expandir/Retrair */}
      <button
        onClick={onExpand}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-submenu rounded transition-colors"
      >
        {isExpanded ? (
          <>
            <Minimize2 size={14} />
            Retrair
          </>
        ) : (
          <>
            <Maximize2 size={14} />
            Expandir
          </>
        )}
      </button>
    </div>
  );
};

export const Marketing: React.FC = () => {
  // Período padrão: mês atual
  const defaultStartDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const [filters, setFilters] = useState<MarketingFiltersState>({
    dateStart: defaultStartDate,
    dateEnd: defaultEndDate,
    compareWithPrevious: false,
    channels: [],
    origins: [],
  });

  const [appliedFilters, setAppliedFilters] = useState<MarketingFiltersState>({
    dateStart: defaultStartDate,
    dateEnd: defaultEndDate,
    compareWithPrevious: false,
    channels: [],
    origins: [],
  });

  const [expandedMetric, setExpandedMetric] = useState<{ type: MetricType; title: string } | null>(null);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  // Buscar métricas reais do Supabase
  const { currentMetrics, previousMetrics, loading, error } = useMarketingMetrics({
    dateStart: appliedFilters.dateStart,
    dateEnd: appliedFilters.dateEnd,
    compareWithPrevious: appliedFilters.compareWithPrevious,
    channels: appliedFilters.channels,
    origins: appliedFilters.origins,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Marketing</h1>
          <p className="text-text-secondary mt-1">
            Métricas de performance de marketing
          </p>
        </div>
      </div>

      {/* Filtros */}
      <MarketingFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
      />

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg border border-border p-8 text-center">
          <p className="text-text-secondary">Carregando métricas...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Cards de Métricas */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Downloads"
            value={currentMetrics.downloads}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.downloads : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'downloads'}
            icon={<Download size={24} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'downloads' ? null : { type: 'downloads', title: 'Downloads' })}
          />
          <MetricCard
            title="Leads"
            value={currentMetrics.leads}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.leads : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'leads'}
            icon={<Users size={24} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'leads' ? null : { type: 'leads', title: 'Leads' })}
          />
          <MetricCard
            title="Leads Qualificados"
            value={currentMetrics.leadsQualificados}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.leadsQualificados : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'leadsQualificados'}
            icon={<UserCheck size={24} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'leadsQualificados' ? null : { type: 'leadsQualificados', title: 'Leads Qualificados' })}
          />
          <MetricCard
            title="MQLs"
            value={currentMetrics.mqls}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.mqls : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'mqls'}
            icon={<Target size={24} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'mqls' ? null : { type: 'mqls', title: 'MQLs' })}
          />
        </div>
      )}

      {/* Gráfico Expandido */}
      {expandedMetric && (
        <MarketingMetricExpandedChart
          metricType={expandedMetric.type}
          metricTitle={expandedMetric.title}
          onClose={() => setExpandedMetric(null)}
          channels={appliedFilters.channels}
          origins={appliedFilters.origins}
        />
      )}

      {/* Área para gráficos e tabelas adicionais */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Detalhamento
        </h2>
        <p className="text-text-secondary">
          Gráficos e tabelas detalhadas virão aqui...
        </p>
      </div>
    </div>
  );
};
