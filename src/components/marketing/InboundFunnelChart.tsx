import React, { useEffect, useState } from 'react';
import { useInboundPerformance, InboundFunnelMetrics } from '../../hooks/useInboundPerformance';

interface InboundFunnelChartProps {
  startDate?: string;
  endDate?: string;
}

export const InboundFunnelChart: React.FC<InboundFunnelChartProps> = ({ startDate, endDate }) => {
  const { getFunnelMetrics, loading, error } = useInboundPerformance();
  const [metrics, setMetrics] = useState<InboundFunnelMetrics | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [startDate, endDate]);

  const loadMetrics = async () => {
    try {
      const data = await getFunnelMetrics({ startDate, endDate });
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar métricas do funil:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26600]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">
          Erro ao carregar métricas: {error.message}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const funnelStages = [
    { label: 'Leads', value: metrics.leads, percentage: 100 },
    { label: 'Qualificados', value: metrics.qualificados, percentage: (metrics.qualificados / metrics.leads) * 100 },
    { label: 'MQL', value: metrics.mqls, percentage: (metrics.mqls / metrics.leads) * 100 },
    { label: 'SQL', value: metrics.sqls, percentage: (metrics.sqls / metrics.leads) * 100 },
    { label: 'Agenda', value: metrics.agendas, percentage: (metrics.agendas / metrics.leads) * 100 },
    { label: 'Show', value: metrics.shows, percentage: (metrics.shows / metrics.leads) * 100 },
    { label: 'Venda', value: metrics.vendas, percentage: (metrics.vendas / metrics.leads) * 100 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Funil de Conversão Inbound</h2>
        <button
          onClick={loadMetrics}
          className="text-sm text-[#F26600] hover:text-[#d95a00] flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {/* Funil Visual */}
      <div className="space-y-3 mb-8">
        {funnelStages.map((stage, index) => (
          <div key={stage.label} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{stage.label}</span>
              <span className="text-sm text-gray-600">
                {stage.value.toLocaleString('pt-BR')} ({stage.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-500"
                style={{
                  width: `${stage.percentage}%`,
                  backgroundColor: `hsl(${25 - index * 3}, 100%, ${50 - index * 3}%)`,
                }}
              >
                {stage.value > 0 && stage.percentage > 15 && (
                  <span>{stage.value.toLocaleString('pt-BR')}</span>
                )}
              </div>
            </div>
            {index < funnelStages.length - 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 text-xs text-gray-500">
                ↓ {((funnelStages[index + 1].value / stage.value) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Métricas Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#F26600]">
            {metrics.taxa_conversao_mql.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">Taxa Lead → MQL</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#F26600]">
            {metrics.taxa_conversao_sql.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">Taxa MQL → SQL</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#F26600]">
            {metrics.taxa_conversao_venda.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">Taxa Lead → Venda</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#F26600]">
            R$ {metrics.ticket_medio.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600 mt-1">Ticket Médio</div>
        </div>
      </div>

      {/* MRR Total */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">MRR Total</div>
          <div className="text-3xl font-bold text-[#F26600]">
            R$ {metrics.mrr_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};
