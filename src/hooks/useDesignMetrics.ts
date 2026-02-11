import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DesignMetric {
  id: number;
  created_at: string;
  nome: string | null;
  user: string | null;
  score: number | null;
  due_date: string | null;
}

export interface DesignMetricsAgregadas {
  user: string;
  totalScore: number;
  avgScore: number;
  count: number;
  percentualNoPrazo: number;
}

export interface DesignFilters {
  operadores?: string[];
  dateStart?: string;
  dateEnd?: string;
}

export const useDesignMetrics = (filters?: DesignFilters) => {
  const [metricasPorOperador, setMetricasPorOperador] = useState<Record<string, DesignMetricsAgregadas>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetricas = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('vm_interno_mkt')
        .select('*');

      // Aplicar filtros
      if (filters?.operadores && filters.operadores.length > 0) {
        query = query.in('user', filters.operadores);
      }

      if (filters?.dateStart) {
        query = query.gte('created_at', filters.dateStart);
      }

      if (filters?.dateEnd) {
        // Adiciona 1 dia ao dateEnd para incluir todo o dia final
        const endDate = new Date(filters.dateEnd);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString().split('T')[0]);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Agregar por operador
      const porOperador: Record<string, DesignMetricsAgregadas> = {};
      const onTimeTracking: Record<string, { totalWithDueDate: number; onTime: number }> = {};

      (data || []).forEach(row => {
        const op = row.user || 'Sem operador';
        if (!porOperador[op]) {
          porOperador[op] = {
            user: op,
            totalScore: 0,
            avgScore: 0,
            count: 0,
            percentualNoPrazo: 0,
          };
          onTimeTracking[op] = { totalWithDueDate: 0, onTime: 0 };
        }
        porOperador[op].totalScore += row.score || 0;
        porOperador[op].count += 1;

        // Track % no prazo
        if (row.due_date !== null) {
          onTimeTracking[op].totalWithDueDate += 1;
          const createdDate = new Date(row.created_at);
          const dueDate = new Date(row.due_date);
          // Adiciona 1 dia ao due_date para flexibilizar a entrega
          dueDate.setDate(dueDate.getDate() + 1);
          if (createdDate <= dueDate) {
            onTimeTracking[op].onTime += 1;
          }
        }
      });

      // Calcular média e % no prazo
      Object.keys(porOperador).forEach(op => {
        porOperador[op].avgScore = porOperador[op].count > 0
          ? porOperador[op].totalScore / porOperador[op].count
          : 0;

        porOperador[op].percentualNoPrazo = onTimeTracking[op].totalWithDueDate > 0
          ? (onTimeTracking[op].onTime / onTimeTracking[op].totalWithDueDate) * 100
          : 0;
      });

      setMetricasPorOperador(porOperador);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao buscar métricas de design:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricas();
  }, [JSON.stringify(filters)]);

  return {
    metricasPorOperador,
    loading,
    error,
    refetch: fetchMetricas,
  };
};

// Hook para buscar operadores únicos
export const useDesignOperadores = () => {
  const [operadores, setOperadores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperadores();
  }, []);

  const fetchOperadores = async () => {
    try {
      setLoading(true);

      const { data } = await supabase
        .from('vm_interno_mkt')
        .select('user')
        .not('user', 'is', null);

      const uniqueOps = [...new Set(data?.map(d => d.user) || [])].sort();
      setOperadores(uniqueOps);
    } catch (err) {
      console.error('Erro ao buscar operadores de design:', err);
    } finally {
      setLoading(false);
    }
  };

  return { operadores, loading };
};

// Hook para buscar dados brutos detalhados para múltiplos operadores
export const useDesignMetricsDetailed = (
  operadores: string[],
  dateStart: string,
  dateEnd: string
) => {
  const [rawData, setRawData] = useState<DesignMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (operadores.length === 0) {
      setRawData([]);
      setLoading(false);
      return;
    }
    fetchRawData();
  }, [JSON.stringify(operadores), dateStart, dateEnd]);

  const fetchRawData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Adiciona 1 dia ao dateEnd para incluir todo o dia final
      const endDate = new Date(dateEnd);
      endDate.setDate(endDate.getDate() + 1);

      let query = supabase
        .from('vm_interno_mkt')
        .select('*')
        .gte('created_at', dateStart)
        .lt('created_at', endDate.toISOString().split('T')[0]);

      if (operadores.length > 0) {
        query = query.in('user', operadores);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setRawData(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao buscar dados detalhados:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    rawData,
    loading,
    error,
    refetch: fetchRawData,
  };
};
