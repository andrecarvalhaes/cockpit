import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users, LayoutGrid, List, StickyNote } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/shared/Button';
import { MetricCard } from '../components/metrics/MetricCard';
import { MetricList } from '../components/metrics/MetricList';
import { Modal } from '../components/shared/Modal';
import { MetricForm } from '../components/metrics/MetricForm';
import { PresentationMode } from '../components/metrics/PresentationMode';
import { CommentModal } from '../components/metrics/CommentModal';
import { AnalysisNotesModal } from '../components/metrics/AnalysisNotesModal';
import { WarRoomModal } from '../components/metrics/WarRoomModal';
import { ActionPlanForm } from '../components/action-plans/ActionPlanForm';
import { useMetrics } from '../hooks/useMetrics';
import { useActionPlans } from '../hooks/useActionPlans';
import { MetricFormData, MetricArea, Metric } from '../types/metric';
import { ActionPlanFormData } from '../types/actionPlan';

export const MetricsByArea: React.FC = () => {
  const { area } = useParams<{ area: string }>();
  const navigate = useNavigate();
  const { metrics, addMetric, addMetricValue } = useMetrics();
  const { addActionPlan } = useActionPlans();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);
  const [isAnalysisNotesModalOpen, setIsAnalysisNotesModalOpen] = useState(false);
  const [isWarRoomModalOpen, setIsWarRoomModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredMetrics = metrics.filter((metric) => metric.area === area);

  const handleCreateMetric = (data: MetricFormData) => {
    addMetric({
      ...data,
      area: area as MetricArea,
    });
    setIsModalOpen(false);
  };

  const handleOpenComment = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsCommentModalOpen(true);
  };

  const handleSaveComment = (comment: string) => {
    if (selectedMetric) {
      // Adiciona comentário como nota no último valor ou cria um novo valor
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
    } else {
      // Criando plano vinculado à área, não a uma métrica específica
      addActionPlan({ ...data, area: area }, '');
    }
    setIsActionPlanModalOpen(false);
  };

  return (
    <div>
      <Header
        title={`Métricas - ${area}`}
        subtitle={`${filteredMetrics.length} métrica(s) nesta área`}
        actions={
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
              onClick={() => setIsAnalysisNotesModalOpen(true)}
            >
              <StickyNote size={20} className="mr-2" />
              Notas
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsWarRoomModalOpen(true)}
            >
              <Users size={20} className="mr-2" />
              War Room
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedMetric(null);
                setIsActionPlanModalOpen(true);
              }}
            >
              <Plus size={20} className="mr-2" />
              Novo Plano de Ação
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Nova Métrica
            </Button>
          </div>
        }
      />

      <div className="p-10">
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
            <p className="text-text-secondary text-lg mb-2">
              Nenhuma métrica cadastrada nesta área
            </p>
            <p className="text-text-secondary text-sm mb-6">
              Crie a primeira métrica para começar a acompanhar os resultados de {area}
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Criar Primeira Métrica
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Nova Métrica - ${area}`}
        size="lg"
      >
        <MetricForm
          onSubmit={handleCreateMetric}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

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
      <Modal
        isOpen={isActionPlanModalOpen}
        onClose={() => setIsActionPlanModalOpen(false)}
        title={selectedMetric ? `Criar Plano de Ação - ${selectedMetric.name}` : `Criar Plano de Ação - ${area}`}
        size="lg"
      >
        <ActionPlanForm
          onSubmit={handleCreateActionPlan}
          onCancel={() => setIsActionPlanModalOpen(false)}
          prefilledMetricId={selectedMetric?.id}
        />
      </Modal>

      {/* Modal de Notas de Análise */}
      <AnalysisNotesModal
        isOpen={isAnalysisNotesModalOpen}
        onClose={() => setIsAnalysisNotesModalOpen(false)}
        area={area || ''}
      />

      {/* Modal de War Room */}
      <WarRoomModal
        isOpen={isWarRoomModalOpen}
        onClose={() => setIsWarRoomModalOpen(false)}
        area={area || ''}
      />
    </div>
  );
};
