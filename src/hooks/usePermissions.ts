import { useMemo } from 'react';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'marketing_viewer';

export interface UserPermissions {
  role: UserRole;
  canAccessDashboard: boolean;
  canAccessTeams: boolean;
  canAccessActionPlans: boolean;
  canAccessHunter: boolean;
  canAccessDesign: boolean;
  canAccessMarketing: boolean;
}

// Emails com acesso restrito apenas ao Marketing
const MARKETING_ONLY_EMAILS = [
  'joao.augusto.lagelima@gmail.com',
  'andrecarva97@gmail.com',
];

export const usePermissions = (user: User | null): UserPermissions => {
  return useMemo(() => {
    if (!user?.email) {
      return {
        role: 'admin',
        canAccessDashboard: false,
        canAccessTeams: false,
        canAccessActionPlans: false,
        canAccessHunter: false,
        canAccessDesign: false,
        canAccessMarketing: false,
      };
    }

    // Verificar se é um usuário com acesso apenas ao Marketing
    if (MARKETING_ONLY_EMAILS.includes(user.email.toLowerCase())) {
      return {
        role: 'marketing_viewer',
        canAccessDashboard: false,
        canAccessTeams: false,
        canAccessActionPlans: false,
        canAccessHunter: false,
        canAccessDesign: false,
        canAccessMarketing: true,
      };
    }

    // Usuários padrão (admin) têm acesso a tudo
    return {
      role: 'admin',
      canAccessDashboard: true,
      canAccessTeams: true,
      canAccessActionPlans: true,
      canAccessHunter: true,
      canAccessDesign: true,
      canAccessMarketing: true,
    };
  }, [user]);
};
