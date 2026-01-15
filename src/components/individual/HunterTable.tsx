import React, { useMemo } from 'react';
import { LigacaoCampanha, LigacaoManual } from '../../hooks/useLigacoes';

interface HunterTableProps {
  ligacoesCampanha: LigacaoCampanha[];
  ligacoesManuais: LigacaoManual[];
  selectedPhases: string[];
}

interface PhaseMetrics {
  phase: string;
  ligacoes: number;
  tempoTotal: number;
  tempoFalada: number;
  tabulacoesPositivas: number;
  cardsCriados: number;
}

export const HunterTable: React.FC<HunterTableProps> = ({
  ligacoesCampanha,
  ligacoesManuais,
  selectedPhases,
}) => {
  // Tabulações positivas
  const tabulacoesPositivas = [
    'Em tratamento',
    'Está com o concorrente',
    'Raio de Exclusividade',
    'Reunião agendada',
    'Sem interesse'
  ];

  // Tabulações que geram cards
  const tabulacoesCards = [
    'Em tratamento',
    'Reunião agendada',
    'Ligação falhou'
  ];

  const calculateMetrics = useMemo(() => {
    const phases: PhaseMetrics[] = [
      {
        phase: 'Ligações',
        ligacoes: 0,
        tempoTotal: 0,
        tempoFalada: 0,
        tabulacoesPositivas: 0,
        cardsCriados: 0,
      },
      {
        phase: 'Tempo total',
        ligacoes: 0,
        tempoTotal: 0,
        tempoFalada: 0,
        tabulacoesPositivas: 0,
        cardsCriados: 0,
      },
      {
        phase: 'Tempo falada',
        ligacoes: 0,
        tempoTotal: 0,
        tempoFalada: 0,
        tabulacoesPositivas: 0,
        cardsCriados: 0,
      },
      {
        phase: 'Tabulações Positivas',
        ligacoes: 0,
        tempoTotal: 0,
        tempoFalada: 0,
        tabulacoesPositivas: 0,
        cardsCriados: 0,
      },
      {
        phase: 'Cards criados',
        ligacoes: 0,
        tempoTotal: 0,
        tempoFalada: 0,
        tabulacoesPositivas: 0,
        cardsCriados: 0,
      },
    ];

    // Processar ligações de campanha
    ligacoesCampanha.forEach((lig) => {
      // Ligações totais
      phases[0].ligacoes += 1;

      // Tempo total (duração + conversa)
      const duracao = lig.duracao || 0;
      const conversa = lig.conversa || 0;
      phases[1].tempoTotal += duracao + conversa;

      // Tempo falada (conversa)
      phases[2].tempoFalada += conversa;

      // Tabulações positivas
      if (lig.tabulacao && tabulacoesPositivas.includes(lig.tabulacao)) {
        phases[3].tabulacoesPositivas += 1;
      }

      // Cards criados
      if (lig.tabulacao && tabulacoesCards.includes(lig.tabulacao)) {
        phases[4].cardsCriados += 1;
      }
    });

    // Processar ligações manuais
    ligacoesManuais.forEach((lig) => {
      // Ligações totais
      phases[0].ligacoes += 1;

      // Tempo total (duração + conversa)
      const duracao = lig.duracao || 0;
      const conversa = lig.conversa || 0;
      phases[1].tempoTotal += duracao + conversa;

      // Tempo falada (conversa)
      phases[2].tempoFalada += conversa;

      // Tabulações positivas
      if (lig.tabulacao && tabulacoesPositivas.includes(lig.tabulacao)) {
        phases[3].tabulacoesPositivas += 1;
      }

      // Cards criados
      if (lig.tabulacao && tabulacoesCards.includes(lig.tabulacao)) {
        phases[4].cardsCriados += 1;
      }
    });

    return phases;
  }, [ligacoesCampanha, ligacoesManuais]);

  // Filtrar fases selecionadas
  const filteredPhases = useMemo(() => {
    if (selectedPhases.length === 0) {
      return calculateMetrics;
    }
    return calculateMetrics.filter(phase => selectedPhases.includes(phase.phase));
  }, [calculateMetrics, selectedPhases]);

  // Formatar tempo em horas:minutos
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Renderizar valor da métrica principal
  const renderMainValue = (phase: PhaseMetrics) => {
    switch (phase.phase) {
      case 'Ligações':
        return phase.ligacoes.toLocaleString('pt-BR');
      case 'Tempo total':
        return formatTime(phase.tempoTotal);
      case 'Tempo falada':
        return formatTime(phase.tempoFalada);
      case 'Tabulações Positivas':
        return phase.tabulacoesPositivas.toLocaleString('pt-BR');
      case 'Cards criados':
        return phase.cardsCriados.toLocaleString('pt-BR');
      default:
        return '-';
    }
  };

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
                    {renderMainValue(phase)}
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
