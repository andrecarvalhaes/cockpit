import { useContext } from 'react';
import { RootCauseContext } from '../contexts/RootCauseContext';

export const useRootCause = () => {
  const context = useContext(RootCauseContext);
  if (!context) {
    throw new Error('useRootCause must be used within RootCauseProvider');
  }
  return context;
};
