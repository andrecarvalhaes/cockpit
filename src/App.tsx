import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AppProviders } from './contexts/AppProviders';
import { Dashboard } from './pages/Dashboard';
import { Metrics } from './pages/Metrics';
import { MetricDetails } from './pages/MetricDetails';
import { MetricsByArea } from './pages/MetricsByArea';
import { MetricsByTeam } from './pages/MetricsByTeam';
import { MetricsByTeamAndArea } from './pages/MetricsByTeamAndArea';
import { ActionPlans } from './pages/ActionPlans';
import { RootCauseAnalyses } from './pages/RootCauseAnalyses';
import { RootCauseAnalysisDetail } from './pages/RootCauseAnalysisDetail';
import { NewRootCauseAnalysis } from './pages/NewRootCauseAnalysis';

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/metrics/team/:teamId" element={<MetricsByTeam />} />
            <Route path="/metrics/team/:teamId/area/:area" element={<MetricsByTeamAndArea />} />
            <Route path="/metrics/area/:area" element={<MetricsByArea />} />
            <Route path="/metrics/:id" element={<MetricDetails />} />
            <Route path="/action-plans" element={<ActionPlans />} />
            <Route path="/root-cause-analyses" element={<RootCauseAnalyses />} />
            <Route path="/root-cause-analyses/new" element={<NewRootCauseAnalysis />} />
            <Route path="/root-cause-analyses/:id" element={<RootCauseAnalysisDetail />} />
          </Routes>
        </MainLayout>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
