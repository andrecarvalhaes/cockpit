import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, format, differenceInDays, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface MonthlyMetric {
  month: string; // "Jan 2024"
  value: number;
  projectionExtension?: number; // Extensão projetada (projeção - valor atual)
  isCurrentMonth?: boolean;
  [key: string]: any; // Para permitir chaves dinâmicas (canais/origens)
}

type MetricType = 'downloads' | 'leads' | 'leadsQualificados' | 'mqls';
type ViewMode = 'general' | 'channel' | 'origin';

interface UseMarketingMetricsMonthlyParams {
  metricType: MetricType;
  viewMode?: ViewMode;
  monthsCount?: number; // Número de meses para trás (padrão: 12)
  channels?: string[];
  origins?: string[];
}

interface UseMarketingMetricsMonthlyResult {
  monthlyData: MonthlyMetric[];
  loading: boolean;
  error: string | null;
}

export const useMarketingMetricsMonthly = ({
  metricType,
  viewMode = 'general',
  monthsCount = 12,
  channels = [],
  origins = [],
}: UseMarketingMetricsMonthlyParams): UseMarketingMetricsMonthlyResult => {
  const [monthlyData, setMonthlyData] = useState<MonthlyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calcular intervalo de meses
        const endDate = new Date();
        const startDate = subMonths(endDate, monthsCount - 1);
        const months = eachMonthOfInterval({ start: startDate, end: endDate });

        // Buscar dados para cada mês
        const today = new Date();
        const monthlyPromises = months.map(async (month) => {
          const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
          const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(month, today);

          if (viewMode === 'general') {
            const value = await fetchMetricForPeriod(metricType, monthStart, monthEnd, channels, origins);

            // Calcular extensão projetada para mês atual (apenas a diferença)
            let projectionExtension: number | undefined;
            if (isCurrentMonth && value > 0) {
              const daysInMonth = differenceInDays(endOfMonth(month), startOfMonth(month)) + 1;
              const daysPassed = differenceInDays(today, startOfMonth(month)) + 1;
              const totalProjection = Math.round((value / daysPassed) * daysInMonth);
              projectionExtension = totalProjection - value;
            }

            return {
              month: format(month, 'MMM yyyy', { locale: ptBR }),
              value,
              projectionExtension,
              isCurrentMonth,
            };
          } else {
            // Por canal ou origem - retorna dados agrupados
            const groupedData = await fetchMetricForPeriodGrouped(metricType, monthStart, monthEnd, viewMode, channels, origins);

            return {
              month: format(month, 'MMM yyyy', { locale: ptBR }),
              value: 0, // Não usado em visualização agrupada
              isCurrentMonth,
              ...groupedData, // Adiciona as chaves dinâmicas (Canal A: X, Canal B: Y, etc)
            };
          }
        });

        const results = await Promise.all(monthlyPromises);
        setMonthlyData(results);
      } catch (err) {
        console.error('Erro ao buscar dados mensais:', err);
        setError('Erro ao carregar dados históricos');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [metricType, monthsCount, viewMode, channels, origins]);

  return { monthlyData, loading, error };
};

async function fetchMetricForPeriod(
  metricType: MetricType,
  dateStart: string,
  dateEnd: string,
  channels: string[] = [],
  origins: string[] = []
): Promise<number> {
  // MQLs vem de outra tabela - contar emails distintos
  if (metricType === 'mqls') {
    let query = supabase
      .from('BD_RDOportunidades')
      .select('email')
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd)
      .not('email', 'is', null);

    // Aplicar filtros
    if (channels.length > 0) {
      query = query.in('ld_ko_source', channels);
    }
    if (origins.length > 0) {
      query = query.in('ld_ko_sub_origem', origins);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar MQLs:', error);
      throw error;
    }

    const uniqueEmails = new Set(data?.map(item => item.email).filter(Boolean) || []);
    return uniqueEmails.size;
  }

  // Outras métricas vêm de BD_Conversoes_RD
  let query = supabase
    .from('BD_Conversoes_RD')
    .select('url_conversion, email, relacao_posto')
    .gte('created_at', dateStart)
    .lte('created_at', dateEnd)
    .not('url_conversion', 'is', null);

  // Aplicar filtros
  if (channels.length > 0) {
    query = query.in('utm_source', channels);
  }
  if (origins.length > 0) {
    query = query.in('sub_origem', origins);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar dados:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  switch (metricType) {
    case 'downloads':
      return data.length;

    case 'leads': {
      const uniqueEmails = new Set(data.map(item => item.email).filter(Boolean));
      return uniqueEmails.size;
    }

    case 'leadsQualificados': {
      const qualifiedRelations = [
        'Dono(a) ou Diretor(a)',
        'Gerente ou Supervisor(a)',
        'Outra relação'
      ];
      const qualifiedEmails = new Set(
        data
          .filter(item =>
            item.email &&
            item.relacao_posto &&
            qualifiedRelations.includes(item.relacao_posto)
          )
          .map(item => item.email)
      );
      return qualifiedEmails.size;
    }

    default:
      return 0;
  }
}

async function fetchMetricForPeriodGrouped(
  metricType: MetricType,
  dateStart: string,
  dateEnd: string,
  viewMode: 'channel' | 'origin',
  channels: string[] = [],
  origins: string[] = []
): Promise<Record<string, number>> {
  const groupField = viewMode === 'channel' ? 'utm_source' : 'sub_origem';
  const groupFieldMQL = viewMode === 'channel' ? 'ld_ko_source' : 'ld_ko_sub_origem';

  // MQLs vem de BD_RDOportunidades
  if (metricType === 'mqls') {
    let query = supabase
      .from('BD_RDOportunidades')
      .select(`email, ${groupFieldMQL}`)
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd)
      .not('email', 'is', null);

    // Aplicar filtros
    if (channels.length > 0) {
      query = query.in('ld_ko_source', channels);
    }
    if (origins.length > 0) {
      query = query.in('ld_ko_sub_origem', origins);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar MQLs agrupados:', error);
      return {};
    }

    // Agrupar emails distintos por canal/origem
    const grouped: Record<string, Set<string>> = {};
    data?.forEach(item => {
      const group = item[groupFieldMQL] || 'Outros';
      if (!grouped[group]) {
        grouped[group] = new Set();
      }
      if (item.email) {
        grouped[group].add(item.email);
      }
    });

    // Converter Sets para counts
    const result: Record<string, number> = {};
    Object.keys(grouped).forEach(key => {
      result[key] = grouped[key].size;
    });

    return result;
  }

  // Outras métricas vêm de BD_Conversoes_RD
  let query = supabase
    .from('BD_Conversoes_RD')
    .select(`url_conversion, email, relacao_posto, ${groupField}`)
    .gte('created_at', dateStart)
    .lte('created_at', dateEnd)
    .not('url_conversion', 'is', null);

  // Aplicar filtros
  if (channels.length > 0) {
    query = query.in('utm_source', channels);
  }
  if (origins.length > 0) {
    query = query.in('sub_origem', origins);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar dados agrupados:', error);
    return {};
  }

  if (!data || data.length === 0) {
    return {};
  }

  switch (metricType) {
    case 'downloads': {
      // Contar todos os registros por canal/origem
      const grouped: Record<string, number> = {};
      data.forEach(item => {
        const group = item[groupField] || 'Outros';
        grouped[group] = (grouped[group] || 0) + 1;
      });
      return grouped;
    }

    case 'leads': {
      // Contar emails distintos por canal/origem
      const grouped: Record<string, Set<string>> = {};
      data.forEach(item => {
        if (item.email) {
          const group = item[groupField] || 'Outros';
          if (!grouped[group]) {
            grouped[group] = new Set();
          }
          grouped[group].add(item.email);
        }
      });

      const result: Record<string, number> = {};
      Object.keys(grouped).forEach(key => {
        result[key] = grouped[key].size;
      });
      return result;
    }

    case 'leadsQualificados': {
      const qualifiedRelations = [
        'Dono(a) ou Diretor(a)',
        'Gerente ou Supervisor(a)',
        'Outra relação'
      ];

      const grouped: Record<string, Set<string>> = {};
      data.forEach(item => {
        if (
          item.email &&
          item.relacao_posto &&
          qualifiedRelations.includes(item.relacao_posto)
        ) {
          const group = item[groupField] || 'Outros';
          if (!grouped[group]) {
            grouped[group] = new Set();
          }
          grouped[group].add(item.email);
        }
      });

      const result: Record<string, number> = {};
      Object.keys(grouped).forEach(key => {
        result[key] = grouped[key].size;
      });
      return result;
    }

    default:
      return {};
  }
}
