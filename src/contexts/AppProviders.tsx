import React from 'react';
import { TeamsProvider } from './TeamsContext';
import { MetricsProvider } from './MetricsContext';
import { ActionPlansProvider } from './ActionPlansContext';
import { AreasProvider } from './AreasContext';
import { RootCauseProvider } from './RootCauseContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <TeamsProvider>
      <AreasProvider>
        <MetricsProvider>
          <ActionPlansProvider>
            <RootCauseProvider>
              {children}
            </RootCauseProvider>
          </ActionPlansProvider>
        </MetricsProvider>
      </AreasProvider>
    </TeamsProvider>
  );
};
