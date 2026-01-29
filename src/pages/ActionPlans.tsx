import React, { useState } from 'react';
import { Plus, Target, LayoutGrid, List, Trash2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { Select } from '../components/shared/Select';
import { ActionPlanList } from '../components/action-plans/ActionPlanList';
import { ActionPlanForm } from '../components/action-plans/ActionPlanForm';
import { useActionPlans } from '../hooks/useActionPlans';
import { useMetrics } from '../hooks/useMetrics';
import { ActionPlanFormData, ActionPlan } from '../types/actionPlan';

export const ActionPlans: React.FC = () => {
  const { actionPlans, addActionPlan, toggleComplete, addComment, deleteActionPlan } = useActionPlans();
  const { getMetricById } = useMetrics();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [newComment, setNewComment] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const filteredPlans = actionPlans.filter((plan) => {
    if (selectedStatus === 'completed') return plan.completed;
    if (selectedStatus === 'active') return !plan.completed;
    return true;
  });

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'completed', label: 'Concluídos' },
  ];

  const handleCreateActionPlan = (data: ActionPlanFormData) => {
    const metric = data.metricId ? getMetricById(data.metricId) : null;
    addActionPlan(data, metric?.name || '');
    setIsModalOpen(false);
  };

  const handlePlanClick = (plan: ActionPlan) => {
    setSelectedPlan(plan);
    setNewComment('');
  };

  const handleAddComment = () => {
    if (selectedPlan && newComment.trim()) {
      addComment(selectedPlan.id, newComment.trim());
      setNewComment('');
      const updatedPlan = actionPlans.find(p => p.id === selectedPlan.id);
      if (updatedPlan) {
        setSelectedPlan(updatedPlan);
      }
    }
  };

  const handleToggleComplete = () => {
    if (selectedPlan) {
      toggleComplete(selectedPlan.id);
      const updatedPlan = actionPlans.find(p => p.id === selectedPlan.id);
      if (updatedPlan) {
        setSelectedPlan(updatedPlan);
      }
    }
  };

  return (
    <div>
      <Header
        title="Planos de Ação"
        subtitle={`${actionPlans.length} plano(s) cadastrado(s)`}
        actions={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Novo Plano de Ação
          </Button>
        }
      />

      <div className="p-10">
        {/* Filtros */}
        <div className="mb-6 flex items-center justify-between">
          <div className="w-48">
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cards' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid size={20} className="mr-2" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('list')}
            >
              <List size={20} className="mr-2" />
              Lista
            </Button>
          </div>
        </div>

        {/* Lista de Planos */}
        {filteredPlans.length > 0 ? (
          <ActionPlanList plans={filteredPlans} onPlanClick={handlePlanClick} viewMode={viewMode} />
        ) : (
          <div className="text-center py-12">
            <Target size={64} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary text-lg mb-2">
              Nenhum plano de ação encontrado
            </p>
            <p className="text-text-secondary text-sm mb-6">
              Crie planos de ação para recuperar métricas abaixo da meta
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Criar Primeiro Plano
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Plano de Ação"
        size="lg"
      >
        <ActionPlanForm
          onSubmit={handleCreateActionPlan}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Modal de Detalhes */}
      {selectedPlan && (
        <Modal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          title={
            <div className="flex items-center gap-4 w-full">
              <span className="flex-1">{selectedPlan.title}</span>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir este plano de ação?')) {
                    deleteActionPlan(selectedPlan.id);
                    setSelectedPlan(null);
                  }
                }}
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </Button>
              <Button
                variant={selectedPlan.completed ? 'secondary' : 'success'}
                onClick={handleToggleComplete}
              >
                {selectedPlan.completed ? 'Reabrir Plano' : 'Concluir Plano'}
              </Button>
            </div>
          }
          size="xl"
        >
          <div className="flex gap-6 min-h-[500px]">
            {/* Conteúdo Principal - Esquerda */}
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                  Descrição
                </p>
                <p className="text-text-primary">{selectedPlan.description}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                  Responsável
                </p>
                <p className="text-text-primary">{selectedPlan.responsible}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                  Resultado Esperado
                </p>
                <p className="text-text-primary">{selectedPlan.expectedResult}</p>
              </div>

              {(selectedPlan.metricName || selectedPlan.area) && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                    {selectedPlan.metricName ? 'Métrica Relacionada' : 'Área Relacionada'}
                  </p>
                  <div className="inline-block bg-primary bg-opacity-10 px-3 py-1 rounded-full">
                    <p className="text-primary text-sm font-medium">
                      {selectedPlan.metricName || selectedPlan.area}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Comentários - Direita */}
            <div className="w-96 border-l border-border pl-6 flex flex-col">
              <p className="text-xs font-semibold text-text-secondary uppercase mb-4">
                Comentários
              </p>

              {/* Lista de Comentários */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {selectedPlan.comments && selectedPlan.comments.length > 0 ? (
                  selectedPlan.comments.map((comment) => (
                    <div key={comment.id} className="bg-bg-secondary p-3 rounded-lg">
                      <p className="text-text-primary text-sm mb-1">{comment.content}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(comment.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-text-secondary text-sm italic">Nenhum comentário ainda</p>
                )}
              </div>

              {/* Adicionar Comentário */}
              <div className="space-y-2 border-t border-border pt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newComment.trim()) {
                        handleAddComment();
                      }
                    }
                  }}
                  placeholder="Adicionar um comentário... (Enter para enviar, Shift+Enter para nova linha)"
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200 resize-none"
                />
                <Button
                  variant="primary"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="w-full"
                >
                  Adicionar Comentário
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
