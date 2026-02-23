import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MonthlyCohortData } from '../../hooks/useCohortAnalysis';

interface CohortAnalysisTableProps {
  monthlyData: MonthlyCohortData[];
  conversionMode: 'phase-to-phase' | 'funnel';
  onConversionModeChange: (mode: 'phase-to-phase' | 'funnel') => void;
}

interface ConversionRow {
  stage: string;
  conversions: Record<string, number | string>;
}

export const CohortAnalysisTable: React.FC<CohortAnalysisTableProps> = ({
  monthlyData,
  conversionMode,
  onConversionModeChange,
}) => {
  // Calcular taxas de conversão
  const calculateConversionRates = (): ConversionRow[] => {
    const rows: ConversionRow[] = [
      { stage: 'Leads', conversions: {} },
      { stage: 'Qualificados', conversions: {} },
      { stage: 'MQLs', conversions: {} },
      { stage: 'SQLs', conversions: {} },
      { stage: 'Agenda', conversions: {} },
      { stage: 'Show', conversions: {} },
      { stage: 'Venda', conversions: {} },
    ];

    monthlyData.forEach((month) => {
      // Leads - valor absoluto
      rows[0].conversions[month.month] = month.leads;

      if (conversionMode === 'phase-to-phase') {
        // MODO FASE A FASE: % de conversão da fase anterior para a atual

        // Qualificados - % de leads
        const qualificadosRate = month.leads > 0 ? (month.qualificados / month.leads) * 100 : 0;
        rows[1].conversions[month.month] = qualificadosRate.toFixed(1) + '%';

        // MQLs - % de qualificados
        const mqlsRate = month.qualificados > 0 ? (month.mqls / month.qualificados) * 100 : 0;
        rows[2].conversions[month.month] = mqlsRate.toFixed(1) + '%';

        // SQLs - % de MQLs
        const sqlsRate = month.mqls > 0 ? (month.sqls / month.mqls) * 100 : 0;
        rows[3].conversions[month.month] = sqlsRate.toFixed(1) + '%';

        // Agenda - % de SQLs
        const agendaRate = month.sqls > 0 ? (month.agenda / month.sqls) * 100 : 0;
        rows[4].conversions[month.month] = agendaRate.toFixed(1) + '%';

        // Show - % de Agenda
        const showRate = month.agenda > 0 ? (month.shows / month.agenda) * 100 : 0;
        rows[5].conversions[month.month] = showRate.toFixed(1) + '%';

        // Venda - % de Shows
        const vendaRate = month.shows > 0 ? (month.venda / month.shows) * 100 : 0;
        rows[6].conversions[month.month] = vendaRate.toFixed(1) + '%';
      } else {
        // MODO FUNIL: % de conversão de leads (primeira fase) para cada fase

        // Qualificados - % de leads
        const qualificadosRate = month.leads > 0 ? (month.qualificados / month.leads) * 100 : 0;
        rows[1].conversions[month.month] = qualificadosRate.toFixed(1) + '%';

        // MQLs - % de leads
        const mqlsRate = month.leads > 0 ? (month.mqls / month.leads) * 100 : 0;
        rows[2].conversions[month.month] = mqlsRate.toFixed(1) + '%';

        // SQLs - % de leads
        const sqlsRate = month.leads > 0 ? (month.sqls / month.leads) * 100 : 0;
        rows[3].conversions[month.month] = sqlsRate.toFixed(1) + '%';

        // Agenda - % de leads
        const agendaRate = month.leads > 0 ? (month.agenda / month.leads) * 100 : 0;
        rows[4].conversions[month.month] = agendaRate.toFixed(1) + '%';

        // Show - % de leads
        const showRate = month.leads > 0 ? (month.shows / month.leads) * 100 : 0;
        rows[5].conversions[month.month] = showRate.toFixed(1) + '%';

        // Venda - % de leads
        const vendaRate = month.leads > 0 ? (month.venda / month.leads) * 100 : 0;
        rows[6].conversions[month.month] = vendaRate.toFixed(1) + '%';
      }
    });

    return rows;
  };

  const conversionRows = calculateConversionRates();

  // Formatar nomes dos meses
  const formatMonthHeader = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, 'MMM/yy', { locale: ptBR });
  };

  // Calcular cor baseada no valor relativo dentro da linha
  const getColorForValue = (value: number | string, rowValues: (number | string)[]): string => {
    // Se for o primeiro valor (Leads - valor absoluto), não aplicar cor
    if (typeof value === 'number') {
      return 'transparent';
    }

    // Extrair valores numéricos dos percentuais
    const numericValues = rowValues
      .filter(v => typeof v === 'string' && v.includes('%'))
      .map(v => parseFloat((v as string).replace('%', '')));

    if (numericValues.length === 0) return 'transparent';

    const currentValue = parseFloat(value.replace('%', ''));
    const minValue = Math.min(...numericValues);
    const maxValue = Math.max(...numericValues);

    // Se todos os valores são iguais, não aplicar cor
    if (minValue === maxValue) return 'transparent';

    // Normalizar o valor entre 0 e 1
    const normalized = (currentValue - minValue) / (maxValue - minValue);

    // Gerar cor em gradiente: vermelho (0) -> amarelo (0.5) -> verde (1)
    let r: number, g: number, b: number;

    if (normalized < 0.5) {
      // Vermelho para amarelo
      const ratio = normalized * 2;
      r = 239;
      g = Math.round(68 + (180 * ratio)); // 68 -> 248
      b = 68;
    } else {
      // Amarelo para verde
      const ratio = (normalized - 0.5) * 2;
      r = Math.round(239 - (161 * ratio)); // 239 -> 78
      g = Math.round(248 - (54 * ratio)); // 248 -> 194
      b = Math.round(68 + (50 * ratio)); // 68 -> 118
    }

    // Retornar cor RGBA com maior opacidade para cores mais fortes
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  if (monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-border p-8 text-center">
        <p className="text-text-secondary">Nenhum dado disponível para o período selecionado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Análise de Safra</h2>
            <p className="text-sm text-text-secondary mt-1">
              Acompanhamento de leads por mês de entrada (safra) ao longo do funil
            </p>
          </div>
          <div className="flex items-center gap-2 bg-bg-submenu rounded-lg p-1">
            <button
              onClick={() => onConversionModeChange('phase-to-phase')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                conversionMode === 'phase-to-phase'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              % Fase a Fase
            </button>
            <button
              onClick={() => onConversionModeChange('funnel')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                conversionMode === 'funnel'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              % Funil
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-submenu border-b border-border">
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider sticky left-0 bg-bg-submenu z-10">
                Etapa
              </th>
              {monthlyData.map((month) => (
                <th
                  key={month.month}
                  className="px-6 py-3 text-center text-xs font-semibold text-text-primary uppercase tracking-wider"
                >
                  {formatMonthHeader(month.month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {conversionRows.map((row, index) => {
              // Obter todos os valores da linha para calcular cores relativas
              const rowValues = Object.values(row.conversions);

              return (
                <tr
                  key={row.stage}
                  className="transition-colors hover:opacity-90"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary sticky left-0 bg-white border-r border-border z-10">
                    {row.stage}
                  </td>
                  {monthlyData.map((month) => {
                    const value = row.conversions[month.month];
                    const backgroundColor = getColorForValue(value, rowValues);

                    return (
                      <td
                        key={month.month}
                        className="px-6 py-4 whitespace-nowrap text-sm text-center text-text-primary font-medium"
                        style={{ backgroundColor }}
                      >
                        {value || '-'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="p-4 bg-gray-50 border-t border-border">
        <div className="flex items-center gap-6 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="w-12 h-3 rounded" style={{ background: 'linear-gradient(to right, rgba(239, 68, 68, 0.5), rgba(239, 248, 68, 0.5), rgba(78, 194, 118, 0.5))' }}></div>
            </div>
            <span className="ml-2">
              <span className="font-medium">Escala de cor relativa por etapa:</span> vermelho (menor %) → verde (maior %)
            </span>
          </div>
          <div className="ml-auto text-text-secondary italic">
            {conversionMode === 'phase-to-phase'
              ? '* Leads mostra valor absoluto por safra, demais etapas mostram % de conversão da etapa anterior'
              : '* Leads mostra valor absoluto por safra, demais etapas mostram % de conversão em relação aos Leads da safra'}
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="p-4 bg-blue-50 border-t border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>💡 O que é Análise de Safra?</strong> Esta tabela agrupa os leads pela data de entrada (safra)
          e acompanha sua jornada pelo funil. Diferente da "Performance do Funil" que mostra eventos que ocorreram
          no mês, aqui vemos como os leads de cada mês evoluem ao longo do tempo, permitindo identificar padrões
          de conversão por período de entrada.
        </p>
      </div>
    </div>
  );
};
