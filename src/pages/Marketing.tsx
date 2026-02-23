import React, { useState } from 'react';
import { MarketingFilters, MarketingFiltersState } from '../components/individual/MarketingFilters';
import { MarketingMetricExpandedChart } from '../components/individual/MarketingMetricExpandedChart';
import { MarketingFunnelPerformanceTable } from '../components/individual/MarketingFunnelPerformanceTable';
import { CohortAnalysisTable } from '../components/individual/CohortAnalysisTable';
import { useMarketingMetrics } from '../hooks/useMarketingMetrics';
import { useMarketingFunnelPerformance } from '../hooks/useMarketingFunnelPerformance';
import { useCohortAnalysis } from '../hooks/useCohortAnalysis';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Download, Users, UserCheck, Target, TrendingUp, TrendingDown, Maximize2, Minimize2, CheckCircle, Calendar, Presentation, ShoppingCart, DollarSign } from 'lucide-react';

type MetricType = 'downloads' | 'leads' | 'leadsQualificados' | 'mqls' | 'sqls' | 'agenda' | 'shows' | 'venda' | 'mrr';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  previousValue?: number;
  isComparison?: boolean;
  isExpanded?: boolean;
  onExpand?: () => void;
  isCurrency?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  previousValue,
  isComparison = false,
  isExpanded = false,
  onExpand,
  isCurrency = false,
}) => {
  const calculateVariation = () => {
    if (!isComparison || previousValue === undefined || previousValue === 0) return null;
    const variation = ((value - previousValue) / previousValue) * 100;
    return variation;
  };

  const variation = calculateVariation();

  const formattedValue = isCurrency
    ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value.toLocaleString('pt-BR');

  const formattedPreviousValue = isCurrency && previousValue !== undefined
    ? `R$ ${previousValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : previousValue?.toLocaleString('pt-BR');

  return (
    <div className="bg-white rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Ícone centralizado no topo */}
      <div className="flex justify-center mb-3">
        <div className="p-2.5 bg-primary bg-opacity-10 rounded-lg">
          {icon}
        </div>
      </div>

      {/* Título e Valor */}
      <div className="text-center mb-3">
        <p className="text-xs font-medium text-text-secondary mb-1">{title}</p>
        <p className={`font-bold text-text-primary ${isCurrency ? 'text-xl' : 'text-2xl'}`}>
          {formattedValue}
        </p>

        {isComparison && previousValue !== undefined && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <span className="text-xs text-text-secondary">
              Anterior: {formattedPreviousValue}
            </span>
            {variation !== null && (
              <div className={`flex items-center gap-1 ${variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {variation >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="text-xs font-semibold">
                  {Math.abs(variation).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão Expandir/Retrair - alinhado ao final do card */}
      <button
        onClick={onExpand}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors mt-auto ${
          isExpanded
            ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-submenu'
        }`}
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

  const [expandedMetric, setExpandedMetric] = useState<{ type: MetricType; title: string } | null>({ type: 'mrr', title: 'MRR' });
  const [conversionMode, setConversionMode] = useState<'phase-to-phase' | 'funnel'>('phase-to-phase');
  const [cohortConversionMode, setCohortConversionMode] = useState<'phase-to-phase' | 'funnel'>('phase-to-phase');

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

  // Buscar dados mensais para tabela de performance (sempre últimos 12 meses)
  const last12MonthsStart = format(startOfMonth(subMonths(new Date(), 11)), 'yyyy-MM-dd');
  const last12MonthsEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const { monthlyData, loading: loadingPerformance, error: errorPerformance } = useMarketingFunnelPerformance({
    dateStart: last12MonthsStart,
    dateEnd: last12MonthsEnd,
    channels: appliedFilters.channels,
    origins: appliedFilters.origins,
  });

  // Buscar dados de análise de safra (últimos 12 meses)
  const { monthlyData: cohortData, loading: loadingCohort, error: errorCohort } = useCohortAnalysis({
    dateStart: last12MonthsStart,
    dateEnd: last12MonthsEnd,
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

      {/* Cards de Métricas - Todos em uma linha */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-4">
          <MetricCard
            title="Downloads"
            value={currentMetrics.downloads}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.downloads : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'downloads'}
            icon={<Download size={20} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'downloads' ? null : { type: 'downloads', title: 'Downloads' })}
          />
          <MetricCard
            title="Leads"
            value={currentMetrics.leads}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.leads : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'leads'}
            icon={<Users size={20} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'leads' ? null : { type: 'leads', title: 'Leads' })}
          />
          <MetricCard
            title="Qualificados"
            value={currentMetrics.leadsQualificados}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.leadsQualificados : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'leadsQualificados'}
            icon={<UserCheck size={20} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'leadsQualificados' ? null : { type: 'leadsQualificados', title: 'Qualificados' })}
          />
          <MetricCard
            title="MQLs"
            value={currentMetrics.mqls}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.mqls : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'mqls'}
            icon={<Target size={20} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'mqls' ? null : { type: 'mqls', title: 'MQLs' })}
          />
          <MetricCard
            title="SQLs"
            value={currentMetrics.sqls}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.sqls : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'sqls'}
            icon={<CheckCircle size={20} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'sqls' ? null : { type: 'sqls', title: 'SQLs' })}
          />
          <MetricCard
            title="Agenda"
            value={currentMetrics.agenda}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.agenda : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'agenda'}
            icon={<Calendar size={20} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'agenda' ? null : { type: 'agenda', title: 'Agenda' })}
          />
          <MetricCard
            title="Shows"
            value={currentMetrics.shows}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.shows : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'shows'}
            icon={<Presentation size={20} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'shows' ? null : { type: 'shows', title: 'Shows' })}
          />
          <MetricCard
            title="Venda"
            value={currentMetrics.venda}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.venda : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'venda'}
            icon={<ShoppingCart size={20} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'venda' ? null : { type: 'venda', title: 'Venda' })}
          />
          <MetricCard
            title="MRR"
            value={currentMetrics.mrr}
            previousValue={appliedFilters.compareWithPrevious && previousMetrics ? previousMetrics.mrr : undefined}
            isComparison={appliedFilters.compareWithPrevious}
            isExpanded={expandedMetric?.type === 'mrr'}
            isCurrency={true}
            icon={<DollarSign size={20} className="text-primary" />}
            onExpand={() => setExpandedMetric(expandedMetric?.type === 'mrr' ? null : { type: 'mrr', title: 'MRR' })}
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

      {/* Tabela de Performance do Funil */}
      {!loading && !error && (
        <>
          {loadingPerformance && (
            <div className="bg-white rounded-lg border border-border p-8 text-center">
              <p className="text-text-secondary">Carregando dados de performance...</p>
            </div>
          )}

          {errorPerformance && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">{errorPerformance}</p>
            </div>
          )}

          {!loadingPerformance && !errorPerformance && (
            <MarketingFunnelPerformanceTable
              monthlyData={monthlyData}
              conversionMode={conversionMode}
              onConversionModeChange={setConversionMode}
            />
          )}
        </>
      )}

      {/* Análise de Safra */}
      {!loading && !error && (
        <>
          {loadingCohort && (
            <div className="bg-white rounded-lg border border-border p-8 text-center">
              <p className="text-text-secondary">Carregando análise de safra...</p>
            </div>
          )}

          {errorCohort && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">{errorCohort}</p>
            </div>
          )}

          {!loadingCohort && !errorCohort && (
            <CohortAnalysisTable
              monthlyData={cohortData}
              conversionMode={cohortConversionMode}
              onConversionModeChange={setCohortConversionMode}
            />
          )}
        </>
      )}

    </div>
  );
};
