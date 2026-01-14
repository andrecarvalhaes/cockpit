import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Presentation, LayoutGrid, List } from 'lucide-react';
import { MetricCard } from '../components/metrics/MetricCard';
import { MetricList } from '../components/metrics/MetricList';
import { MetricForm } from '../components/metrics/MetricForm';
import { PresentationMode } from '../components/metrics/PresentationMode';
import { CommentModal } from '../components/metrics/CommentModal';
import { ActionPlanForm } from '../components/action-plans/ActionPlanForm';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';
import { useMetrics } from '../hooks/useMetrics';
import { useTeams } from '../hooks/useTeams';
import { useActionPlans } from '../hooks/useActionPlans';
import { MetricArea, Metric } from '../types/metric';
import { ActionPlanFormData } from '../types/actionPlan';

export const MetricsByTeamAndArea: React.FC = () => {
  const { teamId, area } = useParams<{ teamId: string; area: string }>();
  const navigate = useNavigate();
  const { metrics, addMetricValue } = useMetrics();
  const { getTeamById } = useTeams();
  const { addActionPlan } = useActionPlans();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const team = teamId ? getTeamById(teamId) : null;
  const filteredMetrics = metrics.filter(
    (m) => m.teamId === teamId && m.area === area
  );

  const handleOpenComment = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsCommentModalOpen(true);
  };

  const handleSaveComment = (comment: string) => {
    if (selectedMetric) {
      addMetricValue(selectedMetric.id, {
        value: selectedMetric.values[selectedMetric.values.length - 1]?.value || 0,
        date: new Date(),
        note: comment,
      });
    }
  };

  const handleOpenActionPlan = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsActionPlanModalOpen(true);
  };

  const handleCreateActionPlan = (data: ActionPlanFormData) => {
    if (selectedMetric) {
      addActionPlan(data, selectedMetric.name);
      setIsActionPlanModalOpen(false);
    }
  };

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <TrendingUp size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Time não encontrado</h2>
        <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text-primary">
              {team.name}
            </h1>
            <span className="text-2xl text-text-secondary">/</span>
            <h2 className="text-2xl font-semibold text-primary">{area}</h2>
          </div>
          {team.description && (
            <p className="text-text-secondary mt-1">{team.description}</p>
          )}
          <p className="text-sm text-text-secondary mt-2">
            {filteredMetrics.length} {filteredMetrics.length === 1 ? 'métrica' : 'métricas'}
          </p>
        </div>
        <div className="flex gap-3">
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
          <Button
            variant="secondary"
            onClick={() => setIsPresentationMode(true)}
            disabled={filteredMetrics.length === 0}
          >
            <Presentation size={20} className="mr-2" />
            Apresentar
          </Button>
          <Button onClick={() => setIsFormOpen(true)} icon={Plus}>
            Nova Métrica
          </Button>
        </div>
      </div>

      {/* Métricas */}
      {filteredMetrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
          <TrendingUp size={64} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Nenhuma métrica cadastrada
          </h2>
          <p className="text-text-secondary mb-6">
            Comece criando uma nova métrica para {team.name} - {area}
          </p>
          <Button onClick={() => setIsFormOpen(true)} icon={Plus}>
            Criar Primeira Métrica
          </Button>
        </div>
      ) : viewMode === 'list' ? (
        <MetricList metrics={filteredMetrics} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Nova Métrica"
      >
        <MetricForm
          onClose={() => setIsFormOpen(false)}
          initialTeamId={teamId}
          initialArea={area as MetricArea}
        />
      </Modal>

      {/* Modo Apresentação */}
      {isPresentationMode && (
        <PresentationMode
          metrics={filteredMetrics}
          onClose={() => setIsPresentationMode(false)}
          onOpenComment={handleOpenComment}
          onOpenActionPlan={handleOpenActionPlan}
        />
      )}

      {/* Modal de Comentário */}
      {selectedMetric && (
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          metric={selectedMetric}
          onSave={handleSaveComment}
        />
      )}

      {/* Modal de Plano de Ação */}
      {selectedMetric && (
        <Modal
          isOpen={isActionPlanModalOpen}
          onClose={() => setIsActionPlanModalOpen(false)}
          title={`Criar Plano de Ação - ${selectedMetric.name}`}
          size="lg"
        >
          <ActionPlanForm
            onSubmit={handleCreateActionPlan}
            onCancel={() => setIsActionPlanModalOpen(false)}
            prefilledMetricId={selectedMetric.id}
          />
        </Modal>
      )}
    </div>
  );
};
