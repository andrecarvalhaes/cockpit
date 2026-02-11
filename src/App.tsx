import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AppProviders } from './contexts/AppProviders';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Metrics } from './pages/Metrics';
import { MetricDetails } from './pages/MetricDetails';
import { MetricsByArea } from './pages/MetricsByArea';
import { MetricsByTeam } from './pages/MetricsByTeam';
import { MetricsByTeamAndArea } from './pages/MetricsByTeamAndArea';
import { ActionPlans } from './pages/ActionPlans';
import { Individual } from './pages/Individual';
import { Design } from './pages/Design';

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          {/* Rota pública de login */}
          <Route path="/login" element={<Login />} />

          {/* Todas as outras rotas protegidas */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<Dashboard />} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="metrics/team/:teamId" element={<MetricsByTeam />} />
            <Route path="metrics/team/:teamId/area/:area" element={<MetricsByTeamAndArea />} />
            <Route path="metrics/area/:area" element={<MetricsByArea />} />
            <Route path="metrics/:id" element={<MetricDetails />} />
            <Route path="action-plans" element={<ActionPlans />} />
            <Route path="individual" element={<Individual />} />
            <Route path="design" element={<Design />} />
          </Route>
        </Routes>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
