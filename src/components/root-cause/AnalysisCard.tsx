import React from 'react';
import { HelpCircle, GitBranch, Clock, CheckCircle2, Target } from 'lucide-react';
import { RootCauseAnalysis } from '../../types/rootCauseAnalysis';
import { Card } from '../shared/Card';

interface AnalysisCardProps {
  analysis: RootCauseAnalysis;
  onClick?: () => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onClick,
}) => {
  const getTypeIcon = () => {
    switch (analysis.type) {
      case '5whys':
        return <HelpCircle size={20} className="text-blue-600" />;
      case 'ishikawa':
        return <GitBranch size={20} className="text-green-600" />;
      case 'both':
        return <Target size={20} className="text-purple-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (analysis.type) {
      case '5whys':
        return '5 Porquês';
      case 'ishikawa':
        return 'Ishikawa';
      case 'both':
        return 'Ambos';
    }
  };

  const getTypeBgColor = () => {
    switch (analysis.type) {
      case '5whys':
        return 'bg-blue-100';
      case 'ishikawa':
        return 'bg-green-100';
      case 'both':
        return 'bg-purple-100';
    }
  };

  return (
    <Card hoverable onClick={onClick}>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg ${getTypeBgColor()} flex items-center justify-center`}
            >
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-heading font-bold text-text-primary line-clamp-2 mb-1">
                {analysis.problem}
              </h3>
              <p className="text-sm text-text-secondary">
                {getTypeLabel()}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
              analysis.status === 'Concluída'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {analysis.status === 'Concluída' ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Concluída</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Em Andamento</span>
              </div>
            )}
          </div>
        </div>

        {/* Root Cause Preview */}
        {analysis.rootCause && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Target size={14} className="text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-error uppercase mb-1">
                  Causa Raiz Identificada
                </p>
                <p className="text-sm text-text-primary line-clamp-2">
                  {analysis.rootCause}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ishikawa Causes Count */}
        {analysis.type === 'ishikawa' && analysis.ishikawaCauses && (
          <div className="text-sm text-text-secondary">
            {analysis.ishikawaCauses.length} causa(s) identificada(s) em{' '}
            {new Set(analysis.ishikawaCauses.map((c) => c.category)).size} categoria(s)
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
          {/* Métrica */}
          {analysis.metricName && (
            <div className="text-primary font-medium bg-primary bg-opacity-10 px-3 py-1 rounded-full">
              {analysis.metricName}
            </div>
          )}

          {/* Planos Vinculados */}
          {analysis.linkedActionPlanIds && analysis.linkedActionPlanIds.length > 0 && (
            <div>
              {analysis.linkedActionPlanIds.length} plano(s) de ação vinculado(s)
            </div>
          )}

          {/* Data */}
          <div>
            Criada em{' '}
            {new Date(analysis.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
