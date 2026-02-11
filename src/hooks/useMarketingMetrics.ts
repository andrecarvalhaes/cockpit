import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { differenceInDays, subDays, format } from 'date-fns';

export interface MarketingMetrics {
  downloads: number;
  leads: number;
  leadsQualificados: number;
  mqls: number;
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

    return {
      downloads,
      leads,
      leadsQualificados,
      mqls,
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    throw error;
  }
}
