import React from 'react';
import { HelpCircle, Target } from 'lucide-react';
import { RootCauseAnalysis } from '../../types/rootCauseAnalysis';
import { Card } from '../shared/Card';

interface FiveWhysCardProps {
  analysis: RootCauseAnalysis;
  onClick?: () => void;
}

export const FiveWhysCard: React.FC<FiveWhysCardProps> = ({
  analysis,
  onClick,
}) => {
  return (
    <Card hoverable onClick={onClick}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <HelpCircle size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-heading font-bold text-text-primary mb-1">
              {analysis.problem}
            </h3>
            <p className="text-sm text-text-secondary">
              {analysis.fiveWhys?.length || 0} nível(is) de análise
            </p>
          </div>
        </div>

        {analysis.rootCause && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <Target size={16} className="text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-error uppercase mb-1">
                Causa Raiz
              </p>
              <p className="text-sm text-text-primary line-clamp-2">
                {analysis.rootCause}
              </p>
            </div>
          </div>
        )}

        {analysis.metricName && (
          <div className="text-xs text-primary font-medium bg-primary bg-opacity-10 px-3 py-1 rounded-full inline-block self-start">
            Métrica: {analysis.metricName}
          </div>
        )}
      </div>
    </Card>
  );
};
