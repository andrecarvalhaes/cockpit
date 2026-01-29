import React from 'react';
import { ActionPlan } from '../../types/actionPlan';
import { ActionPlanCard } from './ActionPlanCard';
import { CheckCircle2, Circle, User, MessageSquare } from 'lucide-react';

interface ActionPlanListProps {
  plans: ActionPlan[];
  onPlanClick?: (plan: ActionPlan) => void;
  viewMode?: 'cards' | 'list';
}

export const ActionPlanList: React.FC<ActionPlanListProps> = ({
  plans,
  onPlanClick,
  viewMode = 'cards'
}) => {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Nenhum plano de ação encontrado</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Título</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Vinculado a</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Responsável</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Comentários</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                onClick={() => onPlanClick && onPlanClick(plan)}
                className="border-t border-border hover:bg-bg-submenu cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  {plan.completed ? (
                    <CheckCircle2 size={20} className="text-success" />
                  ) : (
                    <Circle size={20} className="text-primary" />
                  )}
                </td>
                <td className="py-3 px-4">
                  <p className="text-text-primary font-medium">{plan.title}</p>
                  <p className="text-sm text-text-secondary line-clamp-1 mt-1">{plan.description}</p>
                </td>
                <td className="py-3 px-4">
                  {plan.metricName || plan.area ? (
                    <span className="text-xs text-primary font-medium bg-primary bg-opacity-10 px-3 py-1 rounded-full">
                      {plan.metricName ? `Métrica: ${plan.metricName}` : `Área: ${plan.area}`}
                    </span>
                  ) : (
                    <span className="text-text-secondary text-sm">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <User size={16} />
                    <span>{plan.responsible}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {plan.comments && plan.comments.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <MessageSquare size={16} />
                      <span>{plan.comments.length}</span>
                    </div>
                  ) : (
                    <span className="text-text-secondary text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <ActionPlanCard
          key={plan.id}
          plan={plan}
          onClick={() => onPlanClick && onPlanClick(plan)}
        />
      ))}
    </div>
  );
};
