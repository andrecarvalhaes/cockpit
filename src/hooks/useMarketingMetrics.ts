import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { differenceInDays, subDays, format } from 'date-fns';

export interface MarketingMetrics {
  downloads: number;
  leads: number;
  leadsQualificados: number;
  mqls: number;
  sqls: number;
  agenda: number;
  shows: number;
  venda: number;
  mrr: number;
}

interface UseMarketingMetricsParams {
  dateStart: string;
  dateEnd: string;
  compareWithPrevious?: boolean;
  channels?: string[];
  origins?: string[];
}

interface UseMarketingMetricsResult {
  currentMetrics: MarketingMetrics;
  previousMetrics: MarketingMetrics | null;
  loading: boolean;
  error: string | null;
}

export const useMarketingMetrics = ({
  dateStart,
  dateEnd,
  compareWithPrevious = false,
  channels = [],
  origins = [],
}: UseMarketingMetricsParams): UseMarketingMetricsResult => {
  const [currentMetrics, setCurrentMetrics] = useState<MarketingMetrics>({
    downloads: 0,
    leads: 0,
    leadsQualificados: 0,
    mqls: 0,
    sqls: 0,
    agenda: 0,
    shows: 0,
    venda: 0,
    mrr: 0,
  });
  const [previousMetrics, setPreviousMetrics] = useState<MarketingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar métricas do período atual
        const current = await fetchPeriodMetrics(dateStart, dateEnd, channels, origins);
        setCurrentMetrics(current);

        // Se comparação estiver ativa, calcular período anterior
        if (compareWithPrevious) {
          const periodDays = differenceInDays(new Date(dateEnd), new Date(dateStart)) + 1;
          const previousStart = format(subDays(new Date(dateStart), periodDays), 'yyyy-MM-dd');
          const previousEnd = format(subDays(new Date(dateStart), 1), 'yyyy-MM-dd');

          const previous = await fetchPeriodMetrics(previousStart, previousEnd, channels, origins);
          setPreviousMetrics(previous);
        } else {
          setPreviousMetrics(null);
        }
      } catch (err) {
        console.error('Erro ao buscar métricas de marketing:', err);
        setError('Erro ao carregar métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateStart, dateEnd, compareWithPrevious, channels, origins]);

  return { currentMetrics, previousMetrics, loading, error };
};

async function fetchPeriodMetrics(
  dateStart: string,
  dateEnd: string,
  channels: string[] = [],
  origins: string[] = []
): Promise<MarketingMetrics> {
  try {
    // Construir queries base com filtros de data
    let downloadsQuery = supabase
      .from('BD_Conversoes_RD')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', dateStart)
      .lte('created_at', dateEnd)
      .not('url_conversion', 'is', null);

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
      downloadsQuery = downloadsQuery.in('utm_source', channels);
      leadsQuery = leadsQuery.in('utm_source', channels);
      qualifiedLeadsQuery = qualifiedLeadsQuery.in('utm_source', channels);
      mqlsQuery = mqlsQuery.in('ld_ko_source', channels);
    }

    // Aplicar filtros de origem se houver
    if (origins.length > 0) {
      downloadsQuery = downloadsQuery.in('sub_origem', origins);
      leadsQuery = leadsQuery.in('sub_origem', origins);
      qualifiedLeadsQuery = qualifiedLeadsQuery.in('sub_origem', origins);
      mqlsQuery = mqlsQuery.in('ld_ko_sub_origem', origins);
    }

    // Executar queries em paralelo
    const [downloadsResult, leadsResult, qualifiedLeadsResult, mqlsResult] = await Promise.all([
      downloadsQuery,
      leadsQuery,
      qualifiedLeadsQuery,
      mqlsQuery,
    ]);

    if (downloadsResult.error) throw downloadsResult.error;
    if (leadsResult.error) throw leadsResult.error;
    if (qualifiedLeadsResult.error) throw qualifiedLeadsResult.error;
    if (mqlsResult.error) throw mqlsResult.error;

    // 1. Downloads
    const downloads = downloadsResult.count || 0;

    // 2. Leads: contar emails distintos
    const uniqueEmails = new Set(
      leadsResult.data?.map(item => item.email).filter(Boolean) || []
    );
    const leads = uniqueEmails.size;

    // 3. Leads Qualificados: contar emails distintos
    const qualifiedEmails = new Set(
      qualifiedLeadsResult.data?.map(item => item.email).filter(Boolean) || []
    );
    const leadsQualificados = qualifiedEmails.size;

    // 4. MQLs: contar emails distintos em BD_RDOportunidades
    const mqlEmails = new Set(
      mqlsResult.data?.map(item => item.email).filter(Boolean) || []
    );
    const mqls = mqlEmails.size;

    // 5-9. Buscar métricas da tabela aux_kommo
    const kommoMetrics = await fetchKommoMetrics(dateStart, dateEnd);

    return {
      downloads,
      leads,
      leadsQualificados,
      mqls,
      ...kommoMetrics,
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    throw error;
  }
}

// Função auxiliar para converter data do formato DD.MM.YYYY HH:MM:SS para comparação
async function fetchKommoMetrics(
  dateStart: string,
  dateEnd: string
): Promise<{ sqls: number; agenda: number; shows: number; venda: number; mrr: number }> {
  try {
    // Converter datas para o formato esperado: DD.MM.YYYY
    const [yearStart, monthStart, dayStart] = dateStart.split('-');
    const [yearEnd, monthEnd, dayEnd] = dateEnd.split('-');
    const startFormatted = `${dayStart}.${monthStart}.${yearStart}`;
    const endFormatted = `${dayEnd}.${monthEnd}.${yearEnd}`;

    console.log('🔍 Kommo Metrics - Período solicitado:');
    console.log('   Start:', dateStart, '→', startFormatted);
    console.log('   End:', dateEnd, '→', endFormatted);

    // Buscar todos os dados de aux_kommo com filtro de Origem = Inbound
    const { data: allData, error } = await supabase
      .from('aux_kommo')
      .select('ID, "É posto?", "Data da Apresentação:", "Valor da Mensalidade", "Data de Assinatura", "Etapa do lead", "Program_ID", "Criado em", "Origem"')
      .eq('Origem', 'Inbound');

    if (error) throw error;

    console.log('📊 Total de registros Inbound:', allData?.length || 0);

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

    console.log('📅 Registros no período:', filteredData.length);

    // Para "Venda ganha", agrupar por Program_ID (contar apenas 1 por Program_ID diferente)
    const vendaGanhaData = filteredData.filter(item => item['Etapa do lead'] === 'Venda ganha');
    const vendaGanhaProgramIds = new Set(
      vendaGanhaData.map(item => item['Program_ID']).filter(Boolean)
    );

    // Dados que não são "Venda ganha"
    const outrosData = filteredData.filter(item => item['Etapa do lead'] !== 'Venda ganha');

    console.log('🏆 Venda Ganha:', vendaGanhaData.length, 'registros, Program_IDs únicos:', vendaGanhaProgramIds.size);
    console.log('📌 Outros:', outrosData.length, 'registros');

    // 1. SQLs: É posto? = Sim
    const sqlsVendaGanha = vendaGanhaProgramIds.size > 0
      ? Array.from(vendaGanhaProgramIds).filter(programId => {
          const item = vendaGanhaData.find(d => d['Program_ID'] === programId);
          return item && item['É posto?'] === 'Sim';
        }).length
      : 0;
    const sqlsOutros = outrosData.filter(item => item['É posto?'] === 'Sim').length;
    const sqls = sqlsVendaGanha + sqlsOutros;

    console.log('📋 SQLs:');
    console.log('   Venda Ganha (Program_IDs únicos com "É posto?" = Sim):', sqlsVendaGanha);
    console.log('   Outros (registros com "É posto?" = Sim):', sqlsOutros);
    console.log('   Total SQLs:', sqls);

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

    console.log('📊 Resumo Final:');
    console.log('   SQLs:', sqls);
    console.log('   Agenda:', agenda);
    console.log('   Shows:', shows);
    console.log('   Venda:', venda);
    console.log('   MRR: R$', Math.round(mrr));

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
