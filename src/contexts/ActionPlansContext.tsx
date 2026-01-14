import React, { createContext, useState, useEffect } from 'react';
import { ActionPlan, ActionPlanFormData } from '../types/actionPlan';
import { mockActionPlans } from '../utils/mockData';

interface ActionPlansContextType {
  actionPlans: ActionPlan[];
  addActionPlan: (data: ActionPlanFormData, metricName?: string) => void;
  updateActionPlan: (id: string, data: Partial<ActionPlanFormData>) => void;
  deleteActionPlan: (id: string) => void;
  toggleComplete: (id: string) => void;
  addComment: (id: string, content: string) => void;
  getActionPlansByMetric: (metricId: string) => ActionPlan[];
}

export const ActionPlansContext = createContext<ActionPlansContextType | undefined>(undefined);

export const ActionPlansProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(() => {
    const saved = localStorage.getItem('actionPlans');
    if (saved) {
      const plans = JSON.parse(saved);
      // Migrate old data structure to new structure
      return plans.map((plan: any) => ({
        ...plan,
        completed: plan.completed ?? false,
        comments: plan.comments ?? [],
        expectedResult: plan.expectedResult ?? '',
      }));
    }
    return mockActionPlans;
  });

  useEffect(() => {
    localStorage.setItem('actionPlans', JSON.stringify(actionPlans));
  }, [actionPlans]);

  const addActionPlan = (data: ActionPlanFormData, metricName: string = '') => {
    const newPlan: ActionPlan = {
      id: Date.now().toString(),
      ...data,
      metricName,
      completed: false,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setActionPlans((prev) => [...prev, newPlan]);
  };

  const updateActionPlan = (id: string, data: Partial<ActionPlanFormData>) => {
    setActionPlans((prev) =>
      prev.map((plan) =>
        plan.id === id
          ? { ...plan, ...data, updatedAt: new Date() }
          : plan
      )
    );
  };

  const deleteActionPlan = (id: string) => {
    setActionPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const toggleComplete = (id: string) => {
    setActionPlans((prev) =>
      prev.map((plan) =>
        plan.id === id
          ? { ...plan, completed: !plan.completed, updatedAt: new Date() }
          : plan
      )
    );
  };

  const addComment = (id: string, content: string) => {
    setActionPlans((prev) =>
      prev.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              comments: [
                ...plan.comments,
                {
                  id: Date.now().toString(),
                  content,
                  createdAt: new Date(),
                },
              ],
              updatedAt: new Date(),
            }
          : plan
      )
    );
  };

  const getActionPlansByMetric = (metricId: string) => {
    return actionPlans.filter((plan) => plan.metricId === metricId);
  };

  return (
    <ActionPlansContext.Provider
      value={{
        actionPlans,
        addActionPlan,
        updateActionPlan,
        deleteActionPlan,
        toggleComplete,
        addComment,
        getActionPlansByMetric,
      }}
    >
      {children}
    </ActionPlansContext.Provider>
  );
};
