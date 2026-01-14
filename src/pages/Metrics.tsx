import React, { useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { MetricCard } from '../components/metrics/MetricCard';
import { MetricForm } from '../components/metrics/MetricForm';
import { MetricFilters } from '../components/metrics/MetricFilters';
import { useMetrics } from '../hooks/useMetrics';
import { useTeams } from '../hooks/useTeams';

export const Metrics: React.FC = () => {
  const { metrics } = useMetrics();
  const { teams } = useTeams();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');

  const filteredMetrics = metrics.filter((metric) => {
    if (selectedTeam !== 'all' && metric.teamId !== selectedTeam) return false;
    if (selectedArea !== 'all' && metric.area !== selectedArea) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Todas as Métricas</h1>
          <p className="text-text-secondary mt-1">
            {filteredMetrics.length} {filteredMetrics.length === 1 ? 'métrica' : 'métricas'}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} icon={Plus}>
          Nova Métrica
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Time
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os Times</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Área
          </label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas as Áreas</option>
            <option value="Marketing">Marketing</option>
            <option value="Comercial">Comercial</option>
            <option value="Hunter">Hunter</option>
            <option value="Contratos">Contratos</option>
            <option value="Redes Sociais">Redes Sociais</option>
            <option value="Site">Site</option>
          </select>
        </div>
      </div>

      {/* Grid de Métricas */}
      {filteredMetrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
          <TrendingUp size={64} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Nenhuma métrica encontrada
          </h2>
          <p className="text-text-secondary mb-6">
            Comece criando sua primeira métrica para acompanhar os resultados
          </p>
          <Button onClick={() => setIsFormOpen(true)} icon={Plus}>
            Criar Primeira Métrica
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Nova Métrica"
      >
        <MetricForm onClose={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
};
