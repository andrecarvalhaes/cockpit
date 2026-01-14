import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, Clock, Target } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/shared/Button';
import { FiveWhysAnalysis } from '../components/root-cause/FiveWhysAnalysis';
import { IshikawaDiagram } from '../components/root-cause/IshikawaDiagram';
import { IshikawaForm } from '../components/root-cause/IshikawaForm';
import { useRootCause } from '../hooks/useRootCause';
import { useActionPlans } from '../hooks/useActionPlans';

export const RootCauseAnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnalysisById, toggleStatus } = useRootCause();
  const { actionPlans } = useActionPlans();

  const analysis = id ? getAnalysisById(id) : undefined;

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-text-secondary text-lg mb-4">
            Análise não encontrada
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate('/root-cause-analyses')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Análises
          </Button>
        </div>
      </div>
    );
  }

  const linkedPlans = analysis.linkedActionPlanIds
    ? actionPlans.filter((plan) =>
        analysis.linkedActionPlanIds?.includes(plan.id)
      )
    : [];

  const handleToggleStatus = () => {
    if (id) {
      toggleStatus(id);
    }
  };

  const handleCreateActionPlan = () => {
    navigate(`/action-plans?analysisId=${id}`);
  };

  return (
    <div>
      <Header
        title={
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/root-cause-analyses')}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <span>Detalhes da Análise</span>
          </div>
        }
        subtitle={analysis.problem}
        actions={
          <div className="flex gap-3">
            <Button
              variant={analysis.status === 'Concluída' ? 'secondary' : 'success'}
              onClick={handleToggleStatus}
            >
              {analysis.status === 'Concluída' ? (
                <>
                  <Clock size={16} className="mr-2" />
                  Reabrir Análise
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} className="mr-2" />
                  Marcar como Concluída
                </>
              )}
            </Button>
            <Button variant="primary" onClick={handleCreateActionPlan}>
              <Plus size={16} className="mr-2" />
              Criar Plano de Ação
            </Button>
          </div>
        }
      />

      <div className="p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Gerais */}
            <div className="bg-white border border-border rounded-lg p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                  Problema
                </p>
                <p className="text-text-primary">{analysis.problem}</p>
              </div>

              {analysis.metricName && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                    Métrica Relacionada
                  </p>
                  <div className="inline-block bg-primary bg-opacity-10 px-3 py-1 rounded-full">
                    <p className="text-primary text-sm font-medium">
                      {analysis.metricName}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`font-semibold ${
                      analysis.status === 'Concluída'
                        ? 'text-success'
                        : 'text-warning'
                    }`}
                  >
                    {analysis.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Criada em:</span>{' '}
                  {new Date(analysis.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Análise */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-heading font-bold text-text-primary mb-6">
                {analysis.type === '5whys' ? '5 Porquês' : 'Diagrama de Ishikawa'}
              </h2>

              {analysis.type === '5whys' && analysis.fiveWhys ? (
                <FiveWhysAnalysis
                  problem={analysis.problem}
                  initialData={analysis.fiveWhys}
                  onSave={() => {}}
                  readOnly
                />
              ) : analysis.type === 'ishikawa' && analysis.ishikawaCauses ? (
                <>
                  <IshikawaDiagram
                    problem={analysis.problem}
                    causes={analysis.ishikawaCauses}
                  />
                  <div className="mt-6">
                    <IshikawaForm
                      initialCauses={analysis.ishikawaCauses}
                      onSave={() => {}}
                      readOnly
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Causa Raiz */}
            {analysis.rootCause && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={20} className="text-error" />
                  <p className="text-xs font-semibold text-error uppercase">
                    Causa Raiz Identificada
                  </p>
                </div>
                <p className="text-text-primary">{analysis.rootCause}</p>
              </div>
            )}

            {/* Planos de Ação Vinculados */}
            <div className="bg-white border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Planos de Ação Vinculados
              </h3>

              {linkedPlans.length > 0 ? (
                <div className="space-y-2">
                  {linkedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => navigate(`/action-plans`)}
                      className="p-3 bg-bg-secondary rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm font-medium text-text-primary mb-1">
                        {plan.title}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Responsável: {plan.responsible}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-text-secondary mb-3">
                    Nenhum plano de ação vinculado
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCreateActionPlan}
                  >
                    <Plus size={14} className="mr-1" />
                    Criar Plano
                  </Button>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-white border border-border rounded-lg p-4 space-y-3 text-sm">
              <div>
                <p className="text-text-secondary">Tipo de Análise</p>
                <p className="text-text-primary font-medium">
                  {analysis.type === '5whys' ? '5 Porquês' : 'Diagrama de Ishikawa'}
                </p>
              </div>
              <div>
                <p className="text-text-secondary">Autor</p>
                <p className="text-text-primary font-medium">{analysis.author}</p>
              </div>
              <div>
                <p className="text-text-secondary">Última atualização</p>
                <p className="text-text-primary font-medium">
                  {new Date(analysis.updatedAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
