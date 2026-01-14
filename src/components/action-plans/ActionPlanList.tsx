import React from 'react';
import { ActionPlan } from '../../types/actionPlan';
import { ActionPlanCard } from './ActionPlanCard';

interface ActionPlanListProps {
  plans: ActionPlan[];
  onPlanClick?: (plan: ActionPlan) => void;
}

export const ActionPlanList: React.FC<ActionPlanListProps> = ({ plans, onPlanClick }) => {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Nenhum plano de ação encontrado</p>
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
