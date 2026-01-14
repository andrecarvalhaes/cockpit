import { useContext } from 'react';
import { MetricsContext } from '../contexts/MetricsContext';

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};
