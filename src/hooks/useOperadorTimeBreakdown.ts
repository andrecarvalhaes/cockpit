import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type TimeGranularity = 'day' | 'week' | '15days' | 'month';

export interface MetricasCalculadas {
  ligacoes: number;
  tempoTotal: number;
  tempoFalada: number;
  tabulacoesPositivas: number;
  cardsCriados: number;
}

export interface TimePeriodMetrics {
  period: string;
  periodLabel: string;
  metrics: MetricasCalculadas;
}

interface UseOperadorTimeBreakdownProps {
  operador: string;
  dateStart: string;
  dateEnd: string;
  granularity: TimeGranularity;
}

export const useOperadorTimeBreakdown = ({
  operador,
  dateStart,
  dateEnd,
  granularity,
}: UseOperadorTimeBreakdownProps) => {
  const [periodMetrics, setPeriodMetrics] = useState<TimePeriodMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getPeriods = (): Array<{ start: Date; end: Date; label: string }> => {
    const start = parseISO(dateStart);
    const end = parseISO(dateEnd);

    switch (granularity) {
      case 'day': {
        const days = eachDayOfInterval({ start, end });
        return days.map(day => ({
          start: startOfDay(day),
          end: endOfDay(day),
          label: `${format(day, 'dd/MM', { locale: ptBR })}\n${format(day, 'EEE', { locale: ptBR })}`,
        }));
      }

      case 'week': {
        const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 });
        return weeks.map((week, index) => {
          const weekEnd = endOfWeek(week, { weekStartsOn: 0 });
          const actualEnd = weekEnd > end ? end : weekEnd;
          return {
            start: startOfWeek(week, { weekStartsOn: 0 }),
            end: actualEnd,
            label: `Sem ${index + 1}`,
          };
        });
      }

      case '15days': {
        const periods: Array<{ start: Date; end: Date; label: string }> = [];
        const months = eachMonthOfInterval({ start, end });

        months.forEach(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const mid = new Date(month.getFullYear(), month.getMonth(), 15);

          // Primeira quinzena
          periods.push({
            start: monthStart,
            end: mid,
            label: `1ª quinz ${format(month, 'MMM', { locale: ptBR })}`,
          });

          // Segunda quinzena
          periods.push({
            start: addDays(mid, 1),
            end: monthEnd,
            label: `2ª quinz ${format(month, 'MMM', { locale: ptBR })}`,
          });
        });

        // Filter only periods within the date range
        return periods.filter(p => p.start >= start && p.end <= end);
      }

      case 'month': {
        const months = eachMonthOfInterval({ start, end });
        return months.map(month => ({
          start: startOfMonth(month),
          end: endOfMonth(month),
          label: format(month, 'MMM/yy', { locale: ptBR }),
        }));
      }

      default:
        return [];
    }
  };

  const fetchMetricsForPeriod = async (
    periodStart: Date,
    periodEnd: Date
  ): Promise<MetricasCalculadas> => {
    const startStr = format(periodStart, 'yyyy-MM-dd');
    const endStr = format(periodEnd, 'yyyy-MM-dd');

    let query = supabase
      .from('mv_hunter_metrics')
      .select('*')
      .gte('data_dia', startStr)
      .lte('data_dia', endStr);

    // Se não for "Total", filtrar por operador específico
    if (operador !== 'Total') {
      query = query.eq('operador', operador);
    }

    const { data, error: queryError } = await query;

    if (queryError) throw queryError;

    const agregado = (data || []).reduce(
      (acc, row) => ({
        ligacoes: acc.ligacoes + (row.total_ligacoes || 0),
        tempoTotal: acc.tempoTotal + (row.total_duracao || 0) + (row.total_conversa || 0),
        tempoFalada: acc.tempoFalada + (row.total_conversa || 0),
        tabulacoesPositivas: acc.tabulacoesPositivas + (row.total_tabulacoes_positivas || 0),
        cardsCriados: acc.cardsCriados + (row.total_cards_criados || 0),
      }),
      {
        ligacoes: 0,
        tempoTotal: 0,
        tempoFalada: 0,
        tabulacoesPositivas: 0,
        cardsCriados: 0,
      }
    );

    return agregado;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const periods = getPeriods();
      const metricsPromises = periods.map(async period => {
        const metrics = await fetchMetricsForPeriod(period.start, period.end);
        return {
          period: format(period.start, 'yyyy-MM-dd'),
          periodLabel: period.label,
          metrics,
        };
      });

      const results = await Promise.all(metricsPromises);
      setPeriodMetrics(results);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao buscar breakdown temporal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (operador && dateStart && dateEnd) {
      fetchData();
    }
  }, [operador, dateStart, dateEnd, granularity]);

  return {
    periodMetrics,
    loading,
    error,
    refetch: fetchData,
  };
};
