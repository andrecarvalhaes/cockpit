import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface MonthlyFunnelData {
  month: string; // YYYY-MM
  leads: number;
  leadsQualificados: number;
  mqls: number;
  sqls: number;
  agenda: number;
  shows: number;
  venda: number;
}

interface UseMarketingFunnelPerformanceParams {
  dateStart: string;
  dateEnd: string;
  channels?: string[];
  origins?: string[];
}

interface UseMarketingFunnelPerformanceResult {
  monthlyData: MonthlyFunnelData[];
  loading: boolean;
  error: string | null;
}

export const useMarketingFunnelPerformance = ({
  dateStart,
  dateEnd,
  channels = [],
  origins = [],
}: UseMarketingFunnelPerformanceParams): UseMarketingFunnelPerformanceResult => {
  const [monthlyData, setMonthlyData] = useState<MonthlyFunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gerar lista de meses no período
        const months = generateMonthsList(dateStart, dateEnd);

        // Buscar dados para cada mês
        const monthlyDataPromises = months.map(async (month) => {
          const monthStart = format(startOfMonth(new Date(month)), 'yyyy-MM-dd');
          const monthEnd = format(endOfMonth(new Date(month)), 'yyyy-MM-dd');

          const data = await fetchMonthMetrics(monthStart, monthEnd, channels, origins);
          return {
            month,
            ...data,
          };
        });

        const results = await Promise.all(monthlyDataPromises);
        setMonthlyData(results);
      } catch (err) {
        console.error('Erro ao buscar dados mensais de funil:', err);
        setError('Erro ao carregar dados de performance');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [dateStart, dateEnd, channels, origins]);

  return { monthlyData, loading, error };
};

function generateMonthsList(dateStart: string, dateEnd: string): string[] {
  const months: string[] = [];
  const start = new Date(dateStart);
  const end = new Date(dateEnd);

  let current = startOfMonth(start);
  const endMonth = startOfMonth(end);

  while (current <= endMonth) {
    months.push(format(current, 'yyyy-MM'));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

async function fetchMonthMetrics(
  dateStart: string,
  dateEnd: string,
  channels: string[] = [],
  origins: string[] = []
): Promise<Omit<MonthlyFunnelData, 'month'>> {
  try {
    // Construir queries base com filtros de data
    let leadsQuery = supabase
      .from('BD_Conversoes_RD')
      .select('email')
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd)
      .not('url_conversion', 'is', null)
      .not('email', 'is', null);

    let qualifiedLeadsQuery = supabase
      .from('BD_Conversoes_RD')
      .select('email, relacao_posto')
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd)
      .not('url_conversion', 'is', null)
      .not('email', 'is', null)
      .in('relacao_posto', [
        'Dono(a) ou Diretor(a)',
        'Gerente ou Supervisor(a)',
        'Outra relação'
      ]);

    let mqlsQuery = supabase
      .from('BD_RDOportunidades')
      .select('email')
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd)
      .not('email', 'is', null);

    // Aplicar filtros de canal se houver
    if (channels.length > 0) {
      leadsQuery = leadsQuery.in('utm_source', channels);
      qualifiedLeadsQuery = qualifiedLeadsQuery.in('utm_source', channels);
      mqlsQuery = mqlsQuery.in('ld_ko_source', channels);
    }

    // Aplicar filtros de origem se houver
    if (origins.length > 0) {
      leadsQuery = leadsQuery.in('sub_origem', origins);
      qualifiedLeadsQuery = qualifiedLeadsQuery.in('sub_origem', origins);
      mqlsQuery = mqlsQuery.in('ld_ko_sub_origem', origins);
    }

    // Executar queries em paralelo
    const [leadsResult, qualifiedLeadsResult, mqlsResult] = await Promise.all([
      leadsQuery,
      qualifiedLeadsQuery,
      mqlsQuery,
    ]);

    if (leadsResult.error) throw leadsResult.error;
    if (qualifiedLeadsResult.error) throw qualifiedLeadsResult.error;
    if (mqlsResult.error) throw mqlsResult.error;

    // Contar emails distintos
    const uniqueLeadEmails = new Set(
      leadsResult.data?.map(item => item.email).filter(Boolean) || []
    );
    const leads = uniqueLeadEmails.size;

    const qualifiedEmails = new Set(
      qualifiedLeadsResult.data?.map(item => item.email).filter(Boolean) || []
    );
    const leadsQualificados = qualifiedEmails.size;

    const mqlEmails = new Set(
      mqlsResult.data?.map(item => item.email).filter(Boolean) || []
    );
    const mqls = mqlEmails.size;

    // Buscar métricas da tabela aux_kommo
    const kommoMetrics = await fetchKommoMetricsForMonth(dateStart, dateEnd);

    return {
      leads,
      leadsQualificados,
      mqls,
      ...kommoMetrics,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do mês:', error);
    throw error;
  }
}

async function fetchKommoMetricsForMonth(
  dateStart: string,
  dateEnd: string
): Promise<{ sqls: number; agenda: number; shows: number; venda: number }> {
  try {
    // Buscar todos os dados de aux_kommo com filtro de Origem = Inbound
    const { data: allData, error } = await supabase
      .from('aux_kommo')
      .select('ID, "É posto?", "Data da Apresentação:", "Valor da Mensalidade", "Data de Assinatura", "Etapa do lead", "Program_ID", "Criado em", "Origem"')
      .eq('Origem', 'Inbound');

    if (error) throw error;

    if (!allData) {
      return { sqls: 0, agenda: 0, shows: 0, venda: 0 };
    }

    // Filtrar por data no lado do cliente
    const filteredData = allData.filter(item => {
      if (!item['Criado em']) return false;

      const datePart = item['Criado em'].split(' ')[0];
      const [day, month, year] = datePart.split('.');
      const dateFormatted = `${year}-${month}-${day}`;

      return dateFormatted >= dateStart && dateFormatted <= dateEnd;
    });

    // Para "Venda ganha", agrupar por Program_ID
    const vendaGanhaData = filteredData.filter(item => item['Etapa do lead'] === 'Venda ganha');
    const vendaGanhaProgramIds = new Set(
      vendaGanhaData.map(item => item['Program_ID']).filter(Boolean)
    );

    const outrosData = filteredData.filter(item => item['Etapa do lead'] !== 'Venda ganha');

    // SQLs: É posto? = Sim
    const sqlsVendaGanha = vendaGanhaProgramIds.size > 0
      ? Array.from(vendaGanhaProgramIds).filter(programId => {
          const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
          return item && item['É posto?'] === 'Sim';
        }).length
      : 0;
    const sqlsOutros = outrosData.filter(item => item['É posto?'] === 'Sim').length;
    const sqls = sqlsVendaGanha + sqlsOutros;

    // Agenda: Data da Apresentação preenchido
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

    // Shows: Data da Apresentação E Valor da Mensalidade preenchidos
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

    // Venda: Data da Apresentação E Data de Assinatura preenchidos
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

    return {
      sqls,
      agenda,
      shows,
      venda,
    };
  } catch (error) {
    console.error('Erro ao buscar métricas do Kommo para o mês:', error);
    return { sqls: 0, agenda: 0, shows: 0, venda: 0 };
  }
}
