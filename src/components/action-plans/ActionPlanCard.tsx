import React from 'react';
import { User, CheckCircle2, Circle, MessageSquare } from 'lucide-react';
import { ActionPlan } from '../../types/actionPlan';
import { Card } from '../shared/Card';

interface ActionPlanCardProps {
  plan: ActionPlan;
  onClick?: () => void;
}

export const ActionPlanCard: React.FC<ActionPlanCardProps> = ({ plan, onClick }) => {
  return (
    <Card hoverable onClick={onClick}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {plan.completed ? (
                <CheckCircle2 size={24} className="text-success flex-shrink-0" />
              ) : (
                <Circle size={24} className="text-primary flex-shrink-0" />
              )}
              <h3 className="text-lg font-heading font-bold text-text-primary">
                {plan.title}
              </h3>
            </div>
            <p className="text-sm text-text-secondary mt-1 line-clamp-2 ml-9">
              {plan.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-text-secondary flex-wrap ml-9">
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>{plan.responsible}</span>
          </div>

          {plan.comments && plan.comments.length > 0 && (
            <div className="flex items-center gap-2 text-primary">
              <MessageSquare size={16} />
              <span>{plan.comments.length} comentário(s)</span>
            </div>
          )}
        </div>

        {(plan.metricName || plan.area) && (
          <div className="text-xs text-primary font-medium bg-primary bg-opacity-10 px-3 py-1 rounded-full inline-block self-start ml-9">
            {plan.metricName ? `Métrica: ${plan.metricName}` : `Área: ${plan.area}`}
          </div>
        )}
      </div>
    </Card>
  );
};
