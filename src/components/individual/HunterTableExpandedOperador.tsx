import React, { useState, useMemo } from 'react';
import { X, Calendar } from 'lucide-react';
import { useOperadorTimeBreakdown, TimeGranularity, TimePeriodMetrics, MetricasCalculadas } from '../../hooks/useOperadorTimeBreakdown';
import { parseISO, isWeekend } from 'date-fns';

interface HunterTableExpandedOperadorProps {
  operador: string;
  dateStart: string;
  dateEnd: string;
  selectedPhases: string[];
  heatMapEnabled: boolean;
  onClose: () => void;
  hideWeekends: boolean;
  hideZeroCalls: boolean;
}

const granularityOptions: Array<{ value: TimeGranularity; label: string }> = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: '15days', label: '15 dias' },
  { value: 'month', label: 'Mês' },
];

export const HunterTableExpandedOperador: React.FC<HunterTableExpandedOperadorProps> = ({
  operador,
  dateStart,
  dateEnd,
  selectedPhases,
  heatMapEnabled,
  onClose,
  hideWeekends,
  hideZeroCalls,
}) => {
  const [granularity, setGranularity] = useState<TimeGranularity>('week');

  const { periodMetrics, loading } = useOperadorTimeBreakdown({
    operador,
    dateStart,
    dateEnd,
    granularity,
  });

  // Filtrar períodos baseado nas opções avançadas
  const filteredPeriodMetrics = useMemo(() => {
    let filtered = [...periodMetrics];

    // Filtrar finais de semana (apenas para granularidade 'day')
    if (hideWeekends && granularity === 'day') {
      filtered = filtered.filter(pm => {
        const date = parseISO(pm.period);
        return !isWeekend(date);
      });
    }

    // Filtrar dias com 0 ligações
    if (hideZeroCalls) {
      filtered = filtered.filter(pm => pm.metrics.ligacoes > 0);
    }

    return filtered;
  }, [periodMetrics, hideWeekends, hideZeroCalls, granularity]);

  // Formatar tempo em horas:minutos
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

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

  // Formatar valor para exibição
  const formatValueByPhase = (metrics: MetricasCalculadas, phase: string): string => {
    switch (phase) {
      case 'Ligações':
        return metrics.ligacoes.toLocaleString('pt-BR');
      case 'Tempo total':
        return formatTime(metrics.tempoTotal);
      case 'Tempo falada':
        return formatTime(metrics.tempoFalada);
      case 'Tabulações Positivas':
        return metrics.tabulacoesPositivas.toLocaleString('pt-BR');
      case 'Cards criados':
        return metrics.cardsCriados.toLocaleString('pt-BR');
      default:
        return '-';
    }
  };

  // Calcular cor do mapa de calor
  const getHeatMapColor = (phase: string, periodIndex: number): string => {
    if (!heatMapEnabled) return '';

    const values = filteredPeriodMetrics.map(pm =>
      getValueByPhase(pm.metrics, phase)
    );

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const currentValue = getValueByPhase(filteredPeriodMetrics[periodIndex].metrics, phase);

    if (maxValue === minValue) return '';

    // Normalizar entre 0 e 1
    const normalized = (currentValue - minValue) / (maxValue - minValue);

    // Gradiente de vermelho (0) para verde (1)
    if (normalized < 0.5) {
      // Vermelho para amarelo
      const r = 255;
      const g = Math.round(255 * (normalized * 2));
      const b = 0;
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    } else {
      // Amarelo para verde
      const r = Math.round(255 * (1 - (normalized - 0.5) * 2));
      const g = 255;
      const b = 0;
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden animate-fadeIn">
      {/* Header com informações do operador e controles */}
      <div className="bg-primary bg-opacity-5 border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-text-primary">
              Detalhamento: {operador}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white transition-all duration-200 border border-border"
          >
            <X size={16} />
            Fechar detalhamento
          </button>
        </div>

        {/* Seletor de granularidade e opções avançadas */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">
              Visualizar por:
            </span>
            <div className="flex gap-2">
              {granularityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setGranularity(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    granularity === option.value
                      ? 'bg-primary text-white'
                      : 'bg-white text-text-secondary hover:text-text-primary border border-border'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela com períodos como colunas */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Carregando dados...</p>
          </div>
        ) : filteredPeriodMetrics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">
              Nenhum dado encontrado para o período selecionado
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary sticky left-0 bg-bg-secondary z-10">
                  Métrica
                </th>
                {filteredPeriodMetrics.map((pm, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-center text-sm font-semibold text-text-primary"
                  >
                    <div className="whitespace-pre-line leading-tight">
                      {pm.periodLabel.split('\n').map((line, i) => (
                        <div key={i} className={i === 1 ? 'text-xs font-normal text-text-secondary mt-1' : ''}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {selectedPhases.length === 0 ? (
                <tr>
                  <td colSpan={filteredPeriodMetrics.length + 1} className="px-6 py-8 text-center text-text-secondary">
                    Nenhuma fase selecionada
                  </td>
                </tr>
              ) : (
                selectedPhases.map((phase) => (
                  <tr
                    key={phase}
                    className="hover:bg-bg-submenu transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-text-primary sticky left-0 bg-white hover:bg-bg-submenu z-10">
                      {phase}
                    </td>
                    {filteredPeriodMetrics.map((pm, index) => (
                      <td
                        key={index}
                        className="px-6 py-4 text-sm text-text-primary text-center font-semibold transition-colors"
                        style={{
                          backgroundColor: getHeatMapColor(phase, index),
                        }}
                      >
                        {formatValueByPhase(pm.metrics, phase)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
