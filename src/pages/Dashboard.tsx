import React, { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Button } from '../components/shared/Button';
import { MetricCard } from '../components/metrics/MetricCard';
import { MetricList } from '../components/metrics/MetricList';
import { MetricFilters } from '../components/metrics/MetricFilters';
import { useMetrics } from '../hooks/useMetrics';
import { useActionPlans } from '../hooks/useActionPlans';
import { getLatestValue } from '../utils/calculations';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { metrics } = useMetrics();
  const { actionPlans } = useActionPlans();

  const [selectedArea, setSelectedArea] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'above' | 'below'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      // Filtro por área
      if (selectedArea !== 'all' && metric.area !== selectedArea) return false;

      // Filtro por status (acima/abaixo da meta)
      if (statusFilter !== 'all') {
        const latest = getLatestValue(metric.values);
        if (!latest) return false;

        if (statusFilter === 'above' && latest.value < metric.target) return false;
        if (statusFilter === 'below' && latest.value >= metric.target) return false;
      }

      return true;
    });
  }, [metrics, selectedArea, statusFilter]);

  const metricsAboveTarget = metrics.filter((metric) => {
    const latest = getLatestValue(metric.values);
    return latest && latest.value >= metric.target;
  }).length;

  const metricsBelowTarget = metrics.filter((metric) => {
    const latest = getLatestValue(metric.values);
    return latest && latest.value < metric.target;
  }).length;

  const activeActionPlans = actionPlans.filter(
    (plan) => plan.status === 'Em Andamento'
  ).length;

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Visão geral das métricas do ClubPetro"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate('/action-plans')}
            >
              <Plus size={20} className="mr-2" />
              Novo Plano de Ação
            </Button>
            <Button variant="primary" onClick={() => navigate('/metrics')}>
              <Plus size={20} className="mr-2" />
              Nova Métrica
            </Button>
          </>
        }
      />

      <div className="p-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setStatusFilter('all')}
            className={`bg-white rounded-lg border shadow-card p-6 text-left transition-all hover:shadow-lg ${
              statusFilter === 'all' ? 'border-primary border-2' : 'border-border'
            }`}
          >
            <p className="text-sm text-text-secondary font-medium mb-2">
              Total de Métricas
            </p>
            <p className="text-3xl font-bold text-text-primary">{metrics.length}</p>
          </button>

          <button
            onClick={() => setStatusFilter('above')}
            className={`bg-white rounded-lg border shadow-card p-6 text-left transition-all hover:shadow-lg ${
              statusFilter === 'above' ? 'border-success border-2' : 'border-border'
            }`}
          >
            <p className="text-sm text-text-secondary font-medium mb-2">
              Acima da Meta
            </p>
            <p className="text-3xl font-bold text-success">{metricsAboveTarget}</p>
          </button>

          <button
            onClick={() => setStatusFilter('below')}
            className={`bg-white rounded-lg border shadow-card p-6 text-left transition-all hover:shadow-lg ${
              statusFilter === 'below' ? 'border-error border-2' : 'border-border'
            }`}
          >
            <p className="text-sm text-text-secondary font-medium mb-2">
              Abaixo da Meta
            </p>
            <p className="text-3xl font-bold text-error">{metricsBelowTarget}</p>
          </button>

          <div className="bg-white rounded-lg border border-border shadow-card p-6">
            <p className="text-sm text-text-secondary font-medium mb-2">
              Planos em Andamento
            </p>
            <p className="text-3xl font-bold text-primary">{activeActionPlans}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center justify-between mb-6">
          <MetricFilters
            selectedArea={selectedArea}
            onAreaChange={setSelectedArea}
          />

          <div className="flex gap-1 bg-bg-secondary rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Visualização em lista"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Visualização em grade"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Grid/Lista de Métricas */}
        {filteredMetrics.length > 0 ? (
          viewMode === 'list' ? (
            <MetricList metrics={filteredMetrics} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMetrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  onClick={() => navigate(`/metrics/${metric.id}`)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">
              Nenhuma métrica encontrada
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/metrics')}
              className="mt-4"
            >
              Criar Primeira Métrica
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
