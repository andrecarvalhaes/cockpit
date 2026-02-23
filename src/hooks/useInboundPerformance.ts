import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface InboundPerformanceLead {
  email: string;
  id: number;
  data_criado: string;
  qualificado: boolean;
  mql: boolean;
  data_mql: string | null;
  sql: boolean;
  data_sql: string | null;
  agenda: boolean;
  data_agenda: string | null;
  show: boolean;
  venda: boolean;
  mrr: number;
}

export interface InboundFunnelMetrics {
  leads: number;
  qualificados: number;
  mqls: number;
  sqls: number;
  agendas: number;
  shows: number;
  vendas: number;
  mrr_total: number;
  taxa_conversao_mql: number;
  taxa_conversao_sql: number;
  taxa_conversao_venda: number;
  ticket_medio: number;
}

export interface InboundCohortData {
  coorte: string;
  leads: number;
  vendas: number;
  taxa_conversao: number;
  mrr_total: number;
  ticket_medio: number;
}

export interface InboundAvgTime {
  dias_lead_to_mql: number;
  dias_mql_to_sql: number;
  dias_sql_to_agenda: number;
}

export function useInboundPerformance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Busca todos os leads da view
   */
  const getLeads = async (filters?: {
    startDate?: string;
    endDate?: string;
    mql?: boolean;
    sql?: boolean;
    venda?: boolean;
  }): Promise<InboundPerformanceLead[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('vm_inbound_performance').select('*');

      if (filters?.startDate) {
        query = query.gte('data_criado', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('data_criado', filters.endDate);
      }
      if (filters?.mql !== undefined) {
        query = query.eq('mql', filters.mql);
      }
      if (filters?.sql !== undefined) {
        query = query.eq('sql', filters.sql);
      }
      if (filters?.venda !== undefined) {
        query = query.eq('venda', filters.venda);
      }

      const { data, error: queryError } = await query.order('data_criado', { ascending: false });

      if (queryError) throw queryError;

      return data as InboundPerformanceLead[];
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula métricas consolidadas do funil
   */
  const getFunnelMetrics = async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<InboundFunnelMetrics> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('vm_inbound_performance').select('*');

      if (filters?.startDate) {
        query = query.gte('data_criado', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('data_criado', filters.endDate);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const leads = data as InboundPerformanceLead[];

      const metrics: InboundFunnelMetrics = {
        leads: leads.length,
        qualificados: leads.filter(l => l.qualificado).length,
        mqls: leads.filter(l => l.mql).length,
        sqls: leads.filter(l => l.sql).length,
        agendas: leads.filter(l => l.agenda).length,
        shows: leads.filter(l => l.show).length,
        vendas: leads.filter(l => l.venda).length,
        mrr_total: leads.reduce((sum, l) => sum + l.mrr, 0),
        taxa_conversao_mql: 0,
        taxa_conversao_sql: 0,
        taxa_conversao_venda: 0,
        ticket_medio: 0,
      };

      // Calcular taxas de conversão
      if (metrics.leads > 0) {
        metrics.taxa_conversao_mql = (metrics.mqls / metrics.leads) * 100;
      }
      if (metrics.mqls > 0) {
        metrics.taxa_conversao_sql = (metrics.sqls / metrics.mqls) * 100;
      }
      if (metrics.leads > 0) {
        metrics.taxa_conversao_venda = (metrics.vendas / metrics.leads) * 100;
      }
      if (metrics.vendas > 0) {
        metrics.ticket_medio = metrics.mrr_total / metrics.vendas;
      }

      return metrics;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca dados de coorte mensal
   */
  const getCohortData = async (monthsBack: number = 12): Promise<InboundCohortData[]> => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);

      const { data, error: queryError } = await supabase
        .from('vm_inbound_performance')
        .select('*')
        .gte('data_criado', startDate.toISOString().split('T')[0]);

      if (queryError) throw queryError;

      const leads = data as InboundPerformanceLead[];

      // Agrupar por mês
      const cohortMap = new Map<string, InboundCohortData>();

      leads.forEach(lead => {
        const monthKey = lead.data_criado.substring(0, 7); // YYYY-MM

        if (!cohortMap.has(monthKey)) {
          cohortMap.set(monthKey, {
            coorte: monthKey,
            leads: 0,
            vendas: 0,
            taxa_conversao: 0,
            mrr_total: 0,
            ticket_medio: 0,
          });
        }

        const cohort = cohortMap.get(monthKey)!;
        cohort.leads++;
        if (lead.venda) {
          cohort.vendas++;
          cohort.mrr_total += lead.mrr;
        }
      });

      // Calcular métricas derivadas
      const cohortData = Array.from(cohortMap.values()).map(cohort => ({
        ...cohort,
        taxa_conversao: cohort.leads > 0 ? (cohort.vendas / cohort.leads) * 100 : 0,
        ticket_medio: cohort.vendas > 0 ? cohort.mrr_total / cohort.vendas : 0,
      }));

      // Ordenar por data (mais recente primeiro)
      cohortData.sort((a, b) => b.coorte.localeCompare(a.coorte));

      return cohortData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula tempo médio entre etapas do funil
   */
  const getAverageTime = async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<InboundAvgTime> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('vm_inbound_performance').select('*');

      if (filters?.startDate) {
        query = query.gte('data_criado', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('data_criado', filters.endDate);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const leads = data as InboundPerformanceLead[];

      let sumLeadToMql = 0;
      let countLeadToMql = 0;
      let sumMqlToSql = 0;
      let countMqlToSql = 0;
      let sumSqlToAgenda = 0;
      let countSqlToAgenda = 0;

      leads.forEach(lead => {
        if (lead.data_mql) {
          const diffMs = new Date(lead.data_mql).getTime() - new Date(lead.data_criado).getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          sumLeadToMql += diffDays;
          countLeadToMql++;
        }

        if (lead.data_mql && lead.data_sql) {
          const diffMs = new Date(lead.data_sql).getTime() - new Date(lead.data_mql).getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          sumMqlToSql += diffDays;
          countMqlToSql++;
        }

        if (lead.data_sql && lead.data_agenda) {
          const diffMs = new Date(lead.data_agenda).getTime() - new Date(lead.data_sql).getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          sumSqlToAgenda += diffDays;
          countSqlToAgenda++;
        }
      });

      return {
        dias_lead_to_mql: countLeadToMql > 0 ? sumLeadToMql / countLeadToMql : 0,
        dias_mql_to_sql: countMqlToSql > 0 ? sumMqlToSql / countMqlToSql : 0,
        dias_sql_to_agenda: countSqlToAgenda > 0 ? sumSqlToAgenda / countSqlToAgenda : 0,
      };
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza a view materializada
   * Nota: Requer permissões de superusuário ou função específica
   */
  const refreshView = async (concurrent: boolean = false): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const query = concurrent
        ? 'REFRESH MATERIALIZED VIEW CONCURRENTLY vm_inbound_performance'
        : 'REFRESH MATERIALIZED VIEW vm_inbound_performance';

      const { error: queryError } = await supabase.rpc('exec_sql', { sql: query });

      if (queryError) throw queryError;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getLeads,
    getFunnelMetrics,
    getCohortData,
    getAverageTime,
    refreshView,
  };
}
