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

type MetricType = 'downloads' | 'leads' | 'leadsQualificados' | 'mqls' | 'sqls' | 'agenda' | 'shows' | 'venda' | 'mrr';
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

  // Métricas do Kommo (sqls, agenda, shows, venda, mrr)
  if (['sqls', 'agenda', 'shows', 'venda', 'mrr'].includes(metricType)) {
    const kommoMetrics = await fetchKommoMetrics(dateStart, dateEnd);
    return kommoMetrics[metricType as 'sqls' | 'agenda' | 'shows' | 'venda' | 'mrr'];
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
  // Métricas do Kommo - usar campos específicos
  if (['sqls', 'agenda', 'shows', 'venda', 'mrr'].includes(metricType)) {
    return await fetchKommoMetricsGrouped(
      metricType as 'sqls' | 'agenda' | 'shows' | 'venda' | 'mrr',
      dateStart,
      dateEnd,
      viewMode,
      channels,
      origins
    );
  }

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

// Função auxiliar para buscar métricas do Kommo
async function fetchKommoMetrics(
  dateStart: string,
  dateEnd: string
): Promise<{ sqls: number; agenda: number; shows: number; venda: number; mrr: number }> {
  try {
    // Buscar todos os dados de aux_kommo com filtro de Origem = Inbound
    const { data: allData, error } = await supabase
      .from('aux_kommo')
      .select('ID, "É posto?", "Data da Apresentação:", "Valor da Mensalidade", "Data de Assinatura", "Etapa do lead", "Program_ID", "Criado em", "Origem"')
      .eq('Origem', 'Inbound');

    if (error) throw error;

    if (!allData) {
      return { sqls: 0, agenda: 0, shows: 0, venda: 0, mrr: 0 };
    }

    // Filtrar por data no lado do cliente (já que está em formato text)
    const filteredData = allData.filter(item => {
      if (!item['Criado em']) return false;

      // Extrair apenas a parte da data (DD.MM.YYYY)
      const datePart = item['Criado em'].split(' ')[0];

      // Converter DD.MM.YYYY para YYYY-MM-DD para comparação correta
      const [day, month, year] = datePart.split('.');
      const dateFormatted = `${year}-${month}-${day}`;

      // Comparar datas no formato YYYY-MM-DD
      return dateFormatted >= dateStart && dateFormatted <= dateEnd;
    });

    // Para "Venda ganha", agrupar por Program_ID (contar apenas 1 por Program_ID diferente)
    const vendaGanhaData = filteredData.filter(item => item['Etapa do lead'] === 'Venda ganha');
    const vendaGanhaProgramIds = new Set(
      vendaGanhaData.map(item => item['Program_ID']).filter(Boolean)
    );

    // Dados que não são "Venda ganha"
    const outrosData = filteredData.filter(item => item['Etapa do lead'] !== 'Venda ganha');

    // 1. SQLs: É posto? = Sim
    const sqlsVendaGanha = vendaGanhaProgramIds.size > 0
      ? Array.from(vendaGanhaProgramIds).filter(programId => {
          const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
          return item && item['É posto?'] === 'Sim';
        }).length
      : 0;
    const sqlsOutros = outrosData.filter(item => item['É posto?'] === 'Sim').length;
    const sqls = sqlsVendaGanha + sqlsOutros;

    // 2. Agenda: Data da Apresentação preenchido
    const agendaVendaGanha = vendaGanhaProgramIds.size > 0
      ? Array.from(vendaGanhaProgramIds).filter(programId => {
          const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
          return item && item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '';
        }).length
      : 0;
    const agendaOutros = outrosData.filter(item =>
      item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== ''
    ).length;
    const agenda = agendaVendaGanha + agendaOutros;

    // 3. Shows: Data da Apresentação E Valor da Mensalidade preenchidos
    const showsVendaGanha = vendaGanhaProgramIds.size > 0
      ? Array.from(vendaGanhaProgramIds).filter(programId => {
          const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
          return item &&
            item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
            item['Valor da Mensalidade'] && item['Valor da Mensalidade'].trim() !== '';
        }).length
      : 0;
    const showsOutros = outrosData.filter(item =>
      item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
      item['Valor da Mensalidade'] && item['Valor da Mensalidade'].trim() !== ''
    ).length;
    const shows = showsVendaGanha + showsOutros;

    // 4. Venda: Data da Apresentação E Data de Assinatura preenchidos
    const vendaVendaGanha = vendaGanhaProgramIds.size > 0
      ? Array.from(vendaGanhaProgramIds).filter(programId => {
          const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
          return item &&
            item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
            item['Data de Assinatura'] && item['Data de Assinatura'].trim() !== '';
        }).length
      : 0;
    const vendaOutros = outrosData.filter(item =>
      item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
      item['Data de Assinatura'] && item['Data de Assinatura'].trim() !== ''
    ).length;
    const venda = vendaVendaGanha + vendaOutros;

    // 5. MRR: Soma de Valor da Mensalidade (todos os itens com Data da Apresentação preenchido)
    const mrrItems = filteredData.filter(item =>
      item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
      item['Valor da Mensalidade'] && item['Valor da Mensalidade'].trim() !== ''
    );

    const mrr = mrrItems.reduce((sum, item) => {
      const valor = item['Valor da Mensalidade'];
      if (!valor) return sum;

      // Remover R$, espaços e converter vírgula para ponto
      const valorLimpo = valor
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');

      const valorNumerico = parseFloat(valorLimpo);
      return sum + (isNaN(valorNumerico) ? 0 : valorNumerico);
    }, 0);

    return {
      sqls,
      agenda,
      shows,
      venda,
      mrr: Math.round(mrr), // Arredondar para inteiro
    };
  } catch (error) {
    console.error('Erro ao buscar métricas do Kommo:', error);
    return { sqls: 0, agenda: 0, shows: 0, venda: 0, mrr: 0 };
  }
}

// Função auxiliar para buscar métricas do Kommo agrupadas por canal ou origem
async function fetchKommoMetricsGrouped(
  metricType: 'sqls' | 'agenda' | 'shows' | 'venda' | 'mrr',
  dateStart: string,
  dateEnd: string,
  viewMode: 'channel' | 'origin',
  channels: string[] = [],
  origins: string[] = []
): Promise<Record<string, number>> {
  try {
    const groupField = viewMode === 'channel' ? 'utm_source' : 'Sub Origem';

    // Buscar todos os dados de aux_kommo com filtro de Origem = Inbound
    let selectFields = `ID, "É posto?", "Data da Apresentação:", "Valor da Mensalidade", "Data de Assinatura", "Etapa do lead", "Program_ID", "Criado em", "Origem", "${groupField}"`;

    let query = supabase
      .from('aux_kommo')
      .select(selectFields)
      .eq('Origem', 'Inbound');

    // Aplicar filtros se houver
    if (viewMode === 'channel' && channels.length > 0) {
      query = query.in('utm_source', channels);
    }
    if (viewMode === 'origin' && origins.length > 0) {
      query = query.in('Sub Origem', origins);
    }

    const { data: allData, error } = await query;

    if (error) throw error;

    if (!allData) {
      return {};
    }

    // Filtrar por data no lado do cliente
    const filteredData = allData.filter(item => {
      if (!item['Criado em']) return false;

      const datePart = item['Criado em'].split(' ')[0];
      const [day, month, year] = datePart.split('.');
      const dateFormatted = `${year}-${month}-${day}`;

      return dateFormatted >= dateStart && dateFormatted <= dateEnd;
    });

    // Agrupar dados por canal/origem
    const grouped: Record<string, any[]> = {};
    filteredData.forEach(item => {
      const group = item[groupField] || 'Outros';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(item);
    });

    // Calcular métricas para cada grupo
    const result: Record<string, number> = {};

    Object.keys(grouped).forEach(group => {
      const groupData = grouped[group];

      // Separar "Venda ganha" e outros
      const vendaGanhaData = groupData.filter(item => item['Etapa do lead'] === 'Venda ganha');
      const vendaGanhaProgramIds = new Set(
        vendaGanhaData.map(item => item['Program_ID']).filter(Boolean)
      );
      const outrosData = groupData.filter(item => item['Etapa do lead'] !== 'Venda ganha');

      switch (metricType) {
        case 'sqls': {
          const sqlsVendaGanha = vendaGanhaProgramIds.size > 0
            ? Array.from(vendaGanhaProgramIds).filter(programId => {
                const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
                return item && item['É posto?'] === 'Sim';
              }).length
            : 0;
          const sqlsOutros = outrosData.filter(item => item['É posto?'] === 'Sim').length;
          result[group] = sqlsVendaGanha + sqlsOutros;
          break;
        }

        case 'agenda': {
          const agendaVendaGanha = vendaGanhaProgramIds.size > 0
            ? Array.from(vendaGanhaProgramIds).filter(programId => {
                const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
                return item && item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '';
              }).length
            : 0;
          const agendaOutros = outrosData.filter(item =>
            item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== ''
          ).length;
          result[group] = agendaVendaGanha + agendaOutros;
          break;
        }

        case 'shows': {
          const showsVendaGanha = vendaGanhaProgramIds.size > 0
            ? Array.from(vendaGanhaProgramIds).filter(programId => {
                const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
                return item &&
                  item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
                  item['Valor da Mensalidade'] && item['Valor da Mensalidade'].trim() !== '';
              }).length
            : 0;
          const showsOutros = outrosData.filter(item =>
            item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
            item['Valor da Mensalidade'] && item['Valor da Mensalidade'].trim() !== ''
          ).length;
          result[group] = showsVendaGanha + showsOutros;
          break;
        }

        case 'venda': {
          const vendaVendaGanha = vendaGanhaProgramIds.size > 0
            ? Array.from(vendaGanhaProgramIds).filter(programId => {
                const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
                return item &&
                  item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
                  item['Data de Assinatura'] && item['Data de Assinatura'].trim() !== '';
              }).length
            : 0;
          const vendaOutros = outrosData.filter(item =>
            item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
            item['Data de Assinatura'] && item['Data de Assinatura'].trim() !== ''
          ).length;
          result[group] = vendaVendaGanha + vendaOutros;
          break;
        }

        case 'mrr': {
          const mrrItems = groupData.filter(item =>
            item['Data da Apresentação:'] && item['Data da Apresentação:'].trim() !== '' &&
            item['Valor da Mensalidade'] && item['Valor da Mensalidade'].trim() !== ''
          );

          const mrr = mrrItems.reduce((sum, item) => {
            const valor = item['Valor da Mensalidade'];
            if (!valor) return sum;

            const valorLimpo = valor
              .replace(/R\$/g, '')
              .replace(/\s/g, '')
              .replace(/\./g, '')
              .replace(',', '.');

            const valorNumerico = parseFloat(valorLimpo);
            return sum + (isNaN(valorNumerico) ? 0 : valorNumerico);
          }, 0);

          result[group] = Math.round(mrr);
          break;
        }
      }
    });

    return result;
  } catch (error) {
    console.error('Erro ao buscar métricas do Kommo agrupadas:', error);
    return {};
  }
}
