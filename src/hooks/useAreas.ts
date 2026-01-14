import { useContext } from 'react';
import { AreasContext } from '../contexts/AreasContext';

export const useAreas = () => {
  const context = useContext(AreasContext);
  if (!context) {
    throw new Error('useAreas must be used within an AreasProvider');
  }
  return context;
};
