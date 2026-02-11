import React, { useState, useMemo } from 'react';
import { X, Calendar, TrendingUp, Flame } from 'lucide-react';
import { useDesignMetricsDetailed } from '../../hooks/useDesignMetrics';
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, endOfWeek, addDays, startOfMonth, endOfMonth, isWeekend, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DesignMetricExpandedChart } from './DesignMetricExpandedChart';

interface DesignTableExpandedOperadorProps {
  operador: string;
  dateStart: string;
  dateEnd: string;
  onClose: () => void;
}

type TimeGranularity = 'day' | 'week' | '15days' | 'month';

const granularityOptions: Array<{ value: TimeGranularity; label: string }> = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: '15days', label: '15 dias' },
  { value: 'month', label: 'Mês' },
];

export const DesignTableExpandedOperador: React.FC<DesignTableExpandedOperadorProps> = ({
  operador,
  dateStart,
  dateEnd,
  onClose,
}) => {
  const [granularity, setGranularity] = useState<TimeGranularity>('week');
  const [expandedMetric, setExpandedMetric] = useState<'pontuacao' | 'quantidade' | 'percentualNoPrazo' | null>(null);
  const [heatMapEnabled, setHeatMapEnabled] = useState(false);
  const [hideWeekends, setHideWeekends] = useState(false);
  const [hideZeroCalls, setHideZeroCalls] = useState(false);

  const { rawData, loading } = useDesignMetricsDetailed(
    [operador],
    dateStart,
    dateEnd
  );

  // Gerar períodos com base na granularidade
  const periods = useMemo(() => {
    const startDate = parseISO(dateStart);
    const endDate = parseISO(dateEnd);
    let periodList: { start: Date; end: Date; label: string }[] = [];

    switch (granularity) {
      case 'day':
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        periodList = days.map(day => ({
          start: startOfDay(day),
          end: endOfDay(day),
          label: format(day, 'dd/MM', { locale: ptBR }),
        }));
        break;

      case 'week':
        const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 0 });
        periodList = weeks.map((weekStart, index) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
          return {
            start: startOfDay(weekStart),
            end: endOfDay(weekEnd > endDate ? endDate : weekEnd),
            label: `Sem ${index + 1}\n${format(weekStart, 'dd/MM', { locale: ptBR })}`,
          };
        });
        break;

      case '15days':
        const quinzenas: { start: Date; end: Date; label: string }[] = [];
        let currentDate = startDate;
        let quinzenaIndex = 1;
        while (currentDate <= endDate) {
          const monthStart = startOfMonth(currentDate);
          const monthEnd = endOfMonth(currentDate);
          const mid = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);

          if (currentDate <= mid) {
            const quinzenaEnd = mid < monthEnd ? mid : monthEnd;
            quinzenas.push({
              start: startOfDay(currentDate >= monthStart ? currentDate : monthStart),
              end: endOfDay(quinzenaEnd <= endDate ? quinzenaEnd : endDate),
              label: `Quin ${quinzenaIndex}\n${format(currentDate >= monthStart ? currentDate : monthStart, 'dd/MM', { locale: ptBR })}`,
            });
            quinzenaIndex++;
            currentDate = addDays(mid, 1);
          } else {
            quinzenas.push({
              start: startOfDay(currentDate),
              end: endOfDay(monthEnd <= endDate ? monthEnd : endDate),
              label: `Quin ${quinzenaIndex}\n${format(currentDate, 'dd/MM', { locale: ptBR })}`,
            });
            quinzenaIndex++;
            currentDate = addDays(monthEnd, 1);
          }
        }
        periodList = quinzenas;
        break;

      case 'month':
        const months: { start: Date; end: Date; label: string }[] = [];
        let month = startDate;
        while (month <= endDate) {
          const monthStartDate = startOfMonth(month);
          const monthEndDate = endOfMonth(month);
          months.push({
            start: startOfDay(monthStartDate >= startDate ? monthStartDate : startDate),
            end: endOfDay(monthEndDate <= endDate ? monthEndDate : endDate),
            label: `${format(month, 'MMM', { locale: ptBR })}\n${format(month, 'yyyy', { locale: ptBR })}`,
          });
          month = addDays(monthEndDate, 1);
        }
        periodList = months;
        break;
    }

    return periodList;
  }, [granularity, dateStart, dateEnd]);

  // Agregar dados por período
  const periodMetrics = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    return periods.map((period) => {
      const periodData = rawData.filter(row => {
        if (row.user !== operador) return false;
        const rowDate = parseISO(row.created_at);
        return rowDate >= period.start && rowDate <= period.end;
      });

      const totalScore = periodData.reduce((sum, row) => sum + (row.score || 0), 0);
      const count = periodData.length;

      // Calcular % no prazo
      const comDueDate = periodData.filter(row => row.due_date !== null);
      const noPrazo = comDueDate.filter(row => {
        const createdDate = parseISO(row.created_at);
        const dueDate = parseISO(row.due_date);
        // Adiciona 1 dia ao due_date para flexibilizar a entrega
        dueDate.setDate(dueDate.getDate() + 1);
        return createdDate <= dueDate;
      });
      const percentualNoPrazo = comDueDate.length > 0
        ? (noPrazo.length / comDueDate.length) * 100
        : 0;

      return {
        periodLabel: period.label,
        periodStart: period.start,
        pontuacao: totalScore,
        quantidade: count,
        percentualNoPrazo,
      };
    });
  }, [rawData, periods, operador]);

  // Filtrar períodos baseado nas opções avançadas
  const filteredPeriodMetrics = useMemo(() => {
    let filtered = [...periodMetrics];

    // Filtrar finais de semana (apenas para granularidade 'day')
    if (hideWeekends && granularity === 'day') {
      filtered = filtered.filter(pm => !isWeekend(pm.periodStart));
    }

    // Filtrar períodos com 0 quantidade
    if (hideZeroCalls) {
      filtered = filtered.filter(pm => pm.quantidade > 0);
    }

    return filtered;
  }, [periodMetrics, hideWeekends, hideZeroCalls, granularity]);

  // Calcular cor do mapa de calor
  const getHeatMapColor = (metricType: 'pontuacao' | 'quantidade' | 'percentualNoPrazo', periodIndex: number): string => {
    if (!heatMapEnabled) return '';

    const values = filteredPeriodMetrics.map(pm => {
      if (metricType === 'pontuacao') return pm.pontuacao;
      if (metricType === 'quantidade') return pm.quantidade;
      return pm.percentualNoPrazo;
    });

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const currentValue = metricType === 'pontuacao'
      ? filteredPeriodMetrics[periodIndex].pontuacao
      : metricType === 'quantidade'
      ? filteredPeriodMetrics[periodIndex].quantidade
      : filteredPeriodMetrics[periodIndex].percentualNoPrazo;

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

          {/* Opções Avançadas */}
          <div className="flex items-center gap-4 pt-3 border-t border-border">
            {/* Mapa de Calor */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={heatMapEnabled}
                  onChange={(e) => setHeatMapEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral rounded-full peer peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Flame size={18} className={heatMapEnabled ? 'text-primary' : 'text-text-secondary'} />
                <span className="text-sm font-medium text-text-primary">
                  Mapa de Calor
                </span>
              </div>
            </label>

            {/* Tirar final de semana (apenas para dia) */}
            {granularity === 'day' && (
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={hideWeekends}
                    onChange={(e) => setHideWeekends(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral rounded-full peer peer-checked:bg-primary transition-colors"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-sm font-medium text-text-primary whitespace-nowrap">
                  Tirar final de semana
                </span>
              </label>
            )}

            {/* Tirar zerados */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={hideZeroCalls}
                  onChange={(e) => setHideZeroCalls(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral rounded-full peer peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-text-primary whitespace-nowrap">
                Tirar zerados
              </span>
            </label>
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
              {/* Linha de Pontuação */}
              <tr className="hover:bg-bg-submenu transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-text-primary sticky left-0 bg-white hover:bg-bg-submenu z-10">
                  <div className="flex items-center justify-between gap-3">
                    <span>Pontuação</span>
                    <button
                      onClick={() => setExpandedMetric('pontuacao')}
                      className="text-primary hover:text-primary-dark transition-colors p-1 hover:bg-primary hover:bg-opacity-10 rounded"
                      title="Expandir gráfico"
                    >
                      <TrendingUp size={16} />
                    </button>
                  </div>
                </td>
                {filteredPeriodMetrics.map((pm, index) => (
                  <td
                    key={index}
                    className="px-6 py-4 text-sm text-text-primary text-center font-semibold transition-colors"
                    style={{
                      backgroundColor: getHeatMapColor('pontuacao', index),
                    }}
                  >
                    {pm.pontuacao.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Linha de Quantidade */}
              <tr className="hover:bg-bg-submenu transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-text-primary sticky left-0 bg-white hover:bg-bg-submenu z-10">
                  <div className="flex items-center justify-between gap-3">
                    <span>Quantidade</span>
                    <button
                      onClick={() => setExpandedMetric('quantidade')}
                      className="text-primary hover:text-primary-dark transition-colors p-1 hover:bg-primary hover:bg-opacity-10 rounded"
                      title="Expandir gráfico"
                    >
                      <TrendingUp size={16} />
                    </button>
                  </div>
                </td>
                {filteredPeriodMetrics.map((pm, index) => (
                  <td
                    key={index}
                    className="px-6 py-4 text-sm text-text-primary text-center font-semibold transition-colors"
                    style={{
                      backgroundColor: getHeatMapColor('quantidade', index),
                    }}
                  >
                    {pm.quantidade}
                  </td>
                ))}
              </tr>

              {/* Linha de % no prazo */}
              <tr className="hover:bg-bg-submenu transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-text-primary sticky left-0 bg-white hover:bg-bg-submenu z-10">
                  <div className="flex items-center justify-between gap-3">
                    <span>% no prazo</span>
                    <button
                      onClick={() => setExpandedMetric('percentualNoPrazo')}
                      className="text-primary hover:text-primary-dark transition-colors p-1 hover:bg-primary hover:bg-opacity-10 rounded"
                      title="Expandir gráfico"
                    >
                      <TrendingUp size={16} />
                    </button>
                  </div>
                </td>
                {filteredPeriodMetrics.map((pm, index) => (
                  <td
                    key={index}
                    className="px-6 py-4 text-sm text-text-primary text-center font-semibold transition-colors"
                    style={{
                      backgroundColor: getHeatMapColor('percentualNoPrazo', index),
                    }}
                  >
                    {pm.percentualNoPrazo.toFixed(1)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de gráfico expandido */}
      {expandedMetric && (
        <DesignMetricExpandedChart
          metricName={
            expandedMetric === 'pontuacao' ? 'Pontuação' :
            expandedMetric === 'quantidade' ? 'Quantidade' :
            '% no prazo'
          }
          periodData={filteredPeriodMetrics}
          onClose={() => setExpandedMetric(null)}
          metricType={expandedMetric}
        />
      )}
    </div>
  );
};
