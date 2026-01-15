import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MetricasAgregadas {
  tipo: 'campanha' | 'manual';
  operador: string | null;
  campanha: string | null;
  data_dia: string;
  total_ligacoes: number;
  total_duracao: number;
  total_conversa: number;
  total_tabulacoes_positivas: number;
  total_cards_criados: number;
}

export interface MetricasCalculadas {
  ligacoes: number;
  tempoTotal: number;
  tempoFalada: number;
  tabulacoesPositivas: number;
  cardsCriados: number;
}

export interface LigacaoFilters {
  operadores?: string[];
  campanhas?: string[];
  dateStart?: string;
  dateEnd?: string;
}

export const useLigacoesAgregadas = (filters?: LigacaoFilters) => {
  const [metricas, setMetricas] = useState<MetricasCalculadas>({
    ligacoes: 0,
    tempoTotal: 0,
    tempoFalada: 0,
    tabulacoesPositivas: 0,
    cardsCriados: 0,
  });
  const [metricasPorOperador, setMetricasPorOperador] = useState<Record<string, MetricasCalculadas>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetricas = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('mv_hunter_metrics')
        .select('*');

      // Aplicar filtros
      if (filters?.operadores && filters.operadores.length > 0) {
        query = query.in('operador', filters.operadores);
      }

      if (filters?.campanhas && filters.campanhas.length > 0) {
        query = query.in('campanha', filters.campanhas);
      }

      if (filters?.dateStart) {
        query = query.gte('data_dia', filters.dateStart);
      }

      if (filters?.dateEnd) {
        query = query.lte('data_dia', filters.dateEnd);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Agregar os resultados totais
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

      // Agregar por operador
      const porOperador: Record<string, MetricasCalculadas> = {};
      (data || []).forEach(row => {
        const op = row.operador || 'Sem operador';
        if (!porOperador[op]) {
          porOperador[op] = {
            ligacoes: 0,
            tempoTotal: 0,
            tempoFalada: 0,
            tabulacoesPositivas: 0,
            cardsCriados: 0,
          };
        }
        porOperador[op].ligacoes += row.total_ligacoes || 0;
        porOperador[op].tempoTotal += (row.total_duracao || 0) + (row.total_conversa || 0);
        porOperador[op].tempoFalada += row.total_conversa || 0;
        porOperador[op].tabulacoesPositivas += row.total_tabulacoes_positivas || 0;
        porOperador[op].cardsCriados += row.total_cards_criados || 0;
      });

      setMetricas(agregado);
      setMetricasPorOperador(porOperador);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao buscar métricas agregadas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricas();
  }, [JSON.stringify(filters)]);

  return {
    metricas,
    metricasPorOperador,
    loading,
    error,
    refetch: fetchMetricas,
  };
};

// Hook para buscar operadores únicos da view
export const useOperadoresAgregados = () => {
  const [operadores, setOperadores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperadores();
  }, []);

  const fetchOperadores = async () => {
    try {
      setLoading(true);

      const { data } = await supabase
        .from('mv_hunter_metrics')
        .select('operador')
        .not('operador', 'is', null);

      const uniqueOps = [...new Set(data?.map(d => d.operador) || [])].sort();
      setOperadores(uniqueOps);
    } catch (err) {
      console.error('Erro ao buscar operadores:', err);
    } finally {
      setLoading(false);
    }
  };

  return { operadores, loading };
};

// Hook para buscar campanhas únicas da view
export const useCampanhasAgregadas = () => {
  const [campanhas, setCampanhas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampanhas();
  }, []);

  const fetchCampanhas = async () => {
    try {
      setLoading(true);

      const { data } = await supabase
        .from('mv_hunter_metrics')
        .select('campanha')
        .not('campanha', 'is', null)
        .neq('campanha', 'manual');

      const uniqueCampanhas = [...new Set(data?.map(d => d.campanha) || [])].sort();
      setCampanhas(uniqueCampanhas);
    } catch (err) {
      console.error('Erro ao buscar campanhas:', err);
    } finally {
      setLoading(false);
    }
  };

  return { campanhas, loading };
};
