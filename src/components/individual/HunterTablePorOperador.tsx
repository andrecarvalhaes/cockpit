import React from 'react';
import { Maximize2 } from 'lucide-react';
import { MetricasCalculadas } from '../../hooks/useLigacoesAgregadas';

interface HunterTablePorOperadorProps {
  metricasPorOperador: Record<string, MetricasCalculadas>;
  selectedPhases: string[];
  heatMapEnabled: boolean;
  onExpandOperador?: (operador: string) => void;
}

export const HunterTablePorOperador: React.FC<HunterTablePorOperadorProps> = ({
  metricasPorOperador,
  selectedPhases,
  heatMapEnabled,
  onExpandOperador,
}) => {
  const operadores = Object.keys(metricasPorOperador).sort();

  // Calcular totais somando todos os operadores
  const getTotalMetrics = (): MetricasCalculadas => {
    return operadores.reduce((acc, operador) => {
      const metrics = metricasPorOperador[operador];
      return {
        ligacoes: acc.ligacoes + metrics.ligacoes,
        tempoTotal: acc.tempoTotal + metrics.tempoTotal,
        tempoFalada: acc.tempoFalada + metrics.tempoFalada,
        tabulacoesPositivas: acc.tabulacoesPositivas + metrics.tabulacoesPositivas,
        cardsCriados: acc.cardsCriados + metrics.cardsCriados,
      };
    }, {
      ligacoes: 0,
      tempoTotal: 0,
      tempoFalada: 0,
      tabulacoesPositivas: 0,
      cardsCriados: 0,
    });
  };

  const totalMetrics = getTotalMetrics();

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
  const getHeatMapColor = (phase: string, operador: string): string => {
    if (!heatMapEnabled) return '';

    const values = operadores.map(op =>
      getValueByPhase(metricasPorOperador[op], phase)
    );

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const currentValue = getValueByPhase(metricasPorOperador[operador], phase);

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

  if (operadores.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-border p-8 text-center">
        <p className="text-text-secondary">
          Nenhum operador selecionado ou dados não encontrados
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary sticky left-0 bg-bg-secondary z-10">
                Fase
              </th>
              {operadores.map((operador) => (
                <th
                  key={operador}
                  className="px-6 py-4 text-center text-sm font-semibold text-text-primary whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{operador}</span>
                    {onExpandOperador && (
                      <button
                        onClick={() => onExpandOperador(operador)}
                        className="p-1.5 rounded hover:bg-primary hover:bg-opacity-10 text-text-secondary hover:text-primary transition-all duration-200"
                        title="Expandir detalhamento"
                      >
                        <Maximize2 size={14} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary whitespace-nowrap bg-primary bg-opacity-5">
                <div className="flex items-center justify-center gap-2">
                  <span>Total</span>
                  {onExpandOperador && (
                    <button
                      onClick={() => onExpandOperador('Total')}
                      className="p-1.5 rounded hover:bg-primary hover:bg-opacity-10 text-text-secondary hover:text-primary transition-all duration-200"
                      title="Expandir detalhamento do total"
                    >
                      <Maximize2 size={14} />
                    </button>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {selectedPhases.length === 0 ? (
              <tr>
                <td colSpan={operadores.length + 1} className="px-6 py-8 text-center text-text-secondary">
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
                  {operadores.map((operador) => (
                    <td
                      key={operador}
                      className="px-6 py-4 text-sm text-text-primary text-center font-semibold transition-colors"
                      style={{
                        backgroundColor: getHeatMapColor(phase, operador),
                      }}
                    >
                      {formatValueByPhase(metricasPorOperador[operador], phase)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm text-text-primary text-center font-bold bg-primary bg-opacity-5">
                    {formatValueByPhase(totalMetrics, phase)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
