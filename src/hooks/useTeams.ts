import { useContext } from 'react';
import { TeamsContext } from '../contexts/TeamsContext';

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
};
