import React, { createContext, useState, useEffect } from 'react';
import { Metric, MetricFormData, MetricValueFormData } from '../types/metric';
import { supabase } from '../lib/supabase';

interface MetricsContextType {
  metrics: Metric[];
  addMetric: (data: MetricFormData) => Promise<void>;
  updateMetric: (id: string, data: MetricFormData) => Promise<void>;
  updateMetricOrder: (id: string, newOrder: number) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
  addMetricValue: (metricId: string, data: MetricValueFormData) => Promise<void>;
  getMetricById: (id: string) => Metric | undefined;
  refreshMetrics: () => Promise<void>;
}

export const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  const refreshMetrics = async () => {
    try {
      // Buscar métricas com suas metas mensais e valores
      const { data: metricsData, error: metricsError } = await supabase
        .from('me_metrics')
        .select(`
          *,
          me_monthly_targets (*),
          me_metric_values (*),
          me_teams (name)
        `)
        .order('display_order', { ascending: true });

      if (metricsError) throw metricsError;

      if (metricsData) {
        const formattedMetrics: Metric[] = metricsData.map(metric => ({
          id: metric.id,
          name: metric.name,
          description: metric.description,
          teamId: metric.team_id,
          teamName: metric.me_teams?.name,
          area: metric.area,
          unit: metric.unit,
          target: metric.target,
          displayOrder: metric.display_order || 0,
          dataSourceLink: metric.data_source_link,
          monthlyTargets: (metric.me_monthly_targets || []).map((mt: any) => ({
            month: mt.month,
            target: mt.target,
          })),
          values: (metric.me_metric_values || []).map((v: any) => {
            // Parse date string (YYYY-MM-DD) to local timezone
            const dateParts = v.date.split('T')[0].split('-'); // Get just the date part before any time
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
            const day = parseInt(dateParts[2]);

            return {
              id: v.id,
              metricId: v.metric_id,
              value: v.value,
              date: new Date(year, month, day),
              note: v.note,
            };
          }),
          createdAt: new Date(metric.created_at),
          updatedAt: new Date(metric.updated_at),
        }));

        setMetrics(formattedMetrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  const addMetric = async (data: MetricFormData) => {
    try {
      console.log('Tentando adicionar métrica:', data);

      // Inserir métrica
      const { data: metricData, error: metricError } = await supabase
        .from('me_metrics')
        .insert([{
          name: data.name,
          description: data.description,
          team_id: data.teamId,
          area: data.area,
          unit: data.unit,
          target: data.target,
          display_order: data.displayOrder || 0,
          data_source_link: data.dataSourceLink,
        }])
        .select()
        .single();

      if (metricError) {
        console.error('Erro ao inserir métrica:', metricError);
        alert(`Erro ao criar métrica: ${metricError.message}`);
        throw metricError;
      }

      console.log('Métrica criada com sucesso:', metricData);

      // Inserir metas mensais se existirem
      if (data.monthlyTargets && data.monthlyTargets.length > 0 && metricData) {
        console.log('Inserindo metas mensais:', data.monthlyTargets);

        const monthlyTargetsData = data.monthlyTargets.map(mt => ({
          metric_id: metricData.id,
          month: mt.month,
          target: mt.target,
        }));

        const { error: targetsError } = await supabase
          .from('me_monthly_targets')
          .insert(monthlyTargetsData);

        if (targetsError) {
          console.error('Erro ao inserir metas mensais:', targetsError);
          alert(`Erro ao criar metas mensais: ${targetsError.message}`);
          throw targetsError;
        }

        console.log('Metas mensais inseridas com sucesso');
      }

      await refreshMetrics();
      console.log('Métricas atualizadas com sucesso');
    } catch (error) {
      console.error('Error adding metric:', error);
      throw error;
    }
  };

  const updateMetric = async (id: string, data: MetricFormData) => {
    try {
      // Atualizar métrica
      const { error: metricError } = await supabase
        .from('me_metrics')
        .update({
          name: data.name,
          description: data.description,
          team_id: data.teamId,
          area: data.area,
          unit: data.unit,
          target: data.target,
          display_order: data.displayOrder || 0,
          data_source_link: data.dataSourceLink,
        })
        .eq('id', id);

      if (metricError) throw metricError;

      // Deletar metas mensais antigas
      const { error: deleteError } = await supabase
        .from('me_monthly_targets')
        .delete()
        .eq('metric_id', id);

      if (deleteError) throw deleteError;

      // Inserir novas metas mensais se existirem
      if (data.monthlyTargets && data.monthlyTargets.length > 0) {
        const monthlyTargetsData = data.monthlyTargets.map(mt => ({
          metric_id: id,
          month: mt.month,
          target: mt.target,
        }));

        const { error: targetsError } = await supabase
          .from('me_monthly_targets')
          .insert(monthlyTargetsData);

        if (targetsError) throw targetsError;
      }

      await refreshMetrics();
    } catch (error) {
      console.error('Error updating metric:', error);
      throw error;
    }
  };

  const updateMetricOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('me_metrics')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;

      await refreshMetrics();
    } catch (error) {
      console.error('Error updating metric order:', error);
      throw error;
    }
  };

  const deleteMetric = async (id: string) => {
    try {
      const { error } = await supabase
        .from('me_metrics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refreshMetrics();
    } catch (error) {
      console.error('Error deleting metric:', error);
      throw error;
    }
  };

  const addMetricValue = async (metricId: string, data: MetricValueFormData) => {
    try {
      const { error } = await supabase
        .from('me_metric_values')
        .insert([{
          metric_id: metricId,
          value: data.value,
          date: data.date.toISOString(),
          note: data.note,
        }]);

      if (error) throw error;

      await refreshMetrics();
    } catch (error) {
      console.error('Error adding metric value:', error);
      throw error;
    }
  };

  const getMetricById = (id: string) => {
    return metrics.find((metric) => metric.id === id);
  };

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        addMetric,
        updateMetric,
        updateMetricOrder,
        deleteMetric,
        addMetricValue,
        getMetricById,
        refreshMetrics,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};
