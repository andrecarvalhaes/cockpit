import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AppProviders } from './contexts/AppProviders';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthorizedRoute } from './components/auth/AuthorizedRoute';
import { Dashboard } from './pages/Dashboard';
import { Metrics } from './pages/Metrics';
import { MetricDetails } from './pages/MetricDetails';
import { MetricsByArea } from './pages/MetricsByArea';
import { MetricsByTeam } from './pages/MetricsByTeam';
import { MetricsByTeamAndArea } from './pages/MetricsByTeamAndArea';
import { ActionPlans } from './pages/ActionPlans';
import { Individual } from './pages/Individual';
import { Design } from './pages/Design';
import { Marketing } from './pages/Marketing';

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
            <Route path="" element={<AuthorizedRoute requirePermission="dashboard"><Dashboard /></AuthorizedRoute>} />
            <Route path="metrics" element={<AuthorizedRoute requirePermission="teams"><Metrics /></AuthorizedRoute>} />
            <Route path="metrics/team/:teamId" element={<AuthorizedRoute requirePermission="teams"><MetricsByTeam /></AuthorizedRoute>} />
            <Route path="metrics/team/:teamId/area/:area" element={<AuthorizedRoute requirePermission="teams"><MetricsByTeamAndArea /></AuthorizedRoute>} />
            <Route path="metrics/area/:area" element={<AuthorizedRoute requirePermission="teams"><MetricsByArea /></AuthorizedRoute>} />
            <Route path="metrics/:id" element={<AuthorizedRoute requirePermission="teams"><MetricDetails /></AuthorizedRoute>} />
            <Route path="action-plans" element={<AuthorizedRoute requirePermission="actionPlans"><ActionPlans /></AuthorizedRoute>} />
            <Route path="individual" element={<AuthorizedRoute requirePermission="hunter"><Individual /></AuthorizedRoute>} />
            <Route path="design" element={<AuthorizedRoute requirePermission="design"><Design /></AuthorizedRoute>} />
            <Route path="marketing" element={<AuthorizedRoute requirePermission="marketing"><Marketing /></AuthorizedRoute>} />
          </Route>
        </Routes>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
