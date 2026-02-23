import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MonthlyCohortData {
  month: string; // formato: YYYY-MM
  leads: number;
  qualificados: number;
  mqls: number;
  sqls: number;
  agenda: number;
  shows: number;
  venda: number;
}

interface UseCohortAnalysisParams {
  dateStart: string;
  dateEnd: string;
}

export function useCohortAnalysis({ dateStart, dateEnd }: UseCohortAnalysisParams) {
  const [monthlyData, setMonthlyData] = useState<MonthlyCohortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCohortData();
  }, [dateStart, dateEnd]);

  const loadCohortData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da view materializada
      const { data, error: queryError } = await supabase
        .from('vm_inbound_performance')
        .select('*')
        .gte('data_criado', dateStart)
        .lte('data_criado', dateEnd)
        .order('data_criado', { ascending: true });

      if (queryError) {
        throw new Error(`Erro ao buscar dados de safra: ${queryError.message}`);
      }

      if (!data || data.length === 0) {
        setMonthlyData([]);
        return;
      }

      // Agrupar por mês (usando data_criado)
      const monthlyMap = new Map<string, MonthlyCohortData>();

      data.forEach((lead) => {
        const monthKey = lead.data_criado.substring(0, 7); // YYYY-MM

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            leads: 0,
            qualificados: 0,
            mqls: 0,
            sqls: 0,
            agenda: 0,
            shows: 0,
            venda: 0,
          });
        }

        const monthData = monthlyMap.get(monthKey)!;
        monthData.leads++;
        if (lead.qualificado) monthData.qualificados++;
        if (lead.mql) monthData.mqls++;
        if (lead.sql) monthData.sqls++;
        if (lead.agenda) monthData.agenda++;
        if (lead.show) monthData.shows++;
        if (lead.venda) monthData.venda++;
      });

      // Converter para array e ordenar por mês
      const sortedData = Array.from(monthlyMap.values()).sort((a, b) =>
        a.month.localeCompare(b.month)
      );

      setMonthlyData(sortedData);
    } catch (err) {
      console.error('Erro ao carregar dados de safra:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return {
    monthlyData,
    loading,
    error,
  };
}
