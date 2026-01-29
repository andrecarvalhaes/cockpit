import React from 'react';
import { AuthProvider } from './AuthContext';
import { TeamsProvider } from './TeamsContext';
import { MetricsProvider } from './MetricsContext';
import { ActionPlansProvider } from './ActionPlansContext';
import { AreasProvider } from './AreasContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <TeamsProvider>
        <AreasProvider>
          <MetricsProvider>
            <ActionPlansProvider>
              {children}
            </ActionPlansProvider>
          </MetricsProvider>
        </AreasProvider>
      </TeamsProvider>
    </AuthProvider>
  );
};
