import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthorizedRouteProps {
  children: React.ReactNode;
  requirePermission: 'dashboard' | 'teams' | 'actionPlans' | 'hunter' | 'design' | 'marketing';
}

export const AuthorizedRoute: React.FC<AuthorizedRouteProps> = ({ children, requirePermission }) => {
  const { permissions } = useAuth();

  const hasPermission = () => {
    switch (requirePermission) {
      case 'dashboard':
        return permissions.canAccessDashboard;
      case 'teams':
        return permissions.canAccessTeams;
      case 'actionPlans':
        return permissions.canAccessActionPlans;
      case 'hunter':
        return permissions.canAccessHunter;
      case 'design':
        return permissions.canAccessDesign;
      case 'marketing':
        return permissions.canAccessMarketing;
      default:
        return false;
    }
  };

  if (!hasPermission()) {
    // Redirecionar para a primeira página permitida
    if (permissions.canAccessMarketing) {
      return <Navigate to="/marketing" replace />;
    }
    if (permissions.canAccessDashboard) {
      return <Navigate to="/" replace />;
    }
    // Se não tem permissão para nada, redireciona para login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
