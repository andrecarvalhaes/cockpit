import { useContext } from 'react';
import { ActionPlansContext } from '../contexts/ActionPlansContext';

export const useActionPlans = () => {
  const context = useContext(ActionPlansContext);
  if (context === undefined) {
    throw new Error('useActionPlans must be used within an ActionPlansProvider');
  }
  return context;
};
