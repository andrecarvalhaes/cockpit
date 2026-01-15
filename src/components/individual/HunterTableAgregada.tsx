import React from 'react';
import { MetricasCalculadas } from '../../hooks/useLigacoesAgregadas';

interface HunterTableAgregadaProps {
  metricas: MetricasCalculadas;
  selectedPhases: string[];
}

export const HunterTableAgregada: React.FC<HunterTableAgregadaProps> = ({
  metricas,
  selectedPhases,
}) => {
  // Formatar tempo em horas:minutos
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Mapeamento de fases para valores
  const phasesData = [
    {
      phase: 'Ligações',
      value: metricas.ligacoes.toLocaleString('pt-BR'),
    },
    {
      phase: 'Tempo total',
      value: formatTime(metricas.tempoTotal),
    },
    {
      phase: 'Tempo falada',
      value: formatTime(metricas.tempoFalada),
    },
    {
      phase: 'Tabulações Positivas',
      value: metricas.tabulacoesPositivas.toLocaleString('pt-BR'),
    },
    {
      phase: 'Cards criados',
      value: metricas.cardsCriados.toLocaleString('pt-BR'),
    },
  ];

  // Filtrar fases selecionadas
  const filteredPhases = phasesData.filter(p => selectedPhases.includes(p.phase));

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                Fase
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPhases.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-text-secondary">
                  Nenhuma fase selecionada
                </td>
              </tr>
            ) : (
              filteredPhases.map((phase, index) => (
                <tr
                  key={index}
                  className="hover:bg-bg-submenu transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">
                    {phase.phase}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary text-right font-semibold">
                    {phase.value}
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
