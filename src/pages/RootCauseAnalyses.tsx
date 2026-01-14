import React, { useState } from 'react';
import { Plus, Search, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Button } from '../components/shared/Button';
import { Select } from '../components/shared/Select';
import { AnalysisCard } from '../components/root-cause/AnalysisCard';
import { useRootCause } from '../hooks/useRootCause';
import { useMetrics } from '../hooks/useMetrics';
import { AnalysisType, AnalysisStatus } from '../types/rootCauseAnalysis';

export const RootCauseAnalyses: React.FC = () => {
  const navigate = useNavigate();
  const { analyses } = useRootCause();
  const { metrics } = useMetrics();

  const [selectedMetric, setSelectedMetric] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | AnalysisType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | AnalysisStatus>('all');

  const filteredAnalyses = analyses.filter((analysis) => {
    if (selectedMetric !== 'all' && analysis.metricId !== selectedMetric) {
      return false;
    }
    if (selectedType !== 'all' && analysis.type !== selectedType) {
      return false;
    }
    if (selectedStatus !== 'all' && analysis.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const metricOptions = [
    { value: 'all', label: 'Todas as Métricas' },
    ...metrics.map((m) => ({ value: m.id, label: m.name })),
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: '5whys', label: '5 Porquês' },
    { value: 'ishikawa', label: 'Ishikawa' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'Em Andamento', label: 'Em Andamento' },
    { value: 'Concluída', label: 'Concluídas' },
  ];

  const stats = {
    total: analyses.length,
    fiveWhys: analyses.filter((a) => a.type === '5whys').length,
    ishikawa: analyses.filter((a) => a.type === 'ishikawa').length,
    completed: analyses.filter((a) => a.status === 'Concluída').length,
  };

  return (
    <div>
      <Header
        title="Análise de Causa Raiz"
        subtitle={`${analyses.length} análise(s) cadastrada(s)`}
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/root-cause-analyses/new')}
          >
            <Plus size={20} className="mr-2" />
            Nova Análise
          </Button>
        }
      />

      <div className="p-10">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">
              Total de Análises
            </p>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">
              5 Porquês
            </p>
            <p className="text-2xl font-bold text-blue-600">{stats.fiveWhys}</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">
              Ishikawa
            </p>
            <p className="text-2xl font-bold text-green-600">{stats.ishikawa}</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">
              Concluídas
            </p>
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Métrica"
            options={metricOptions}
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          />
          <Select
            label="Tipo de Análise"
            options={typeOptions}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'all' | AnalysisType)}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | AnalysisStatus)}
          />
        </div>

        {/* Lista de Análises */}
        {filteredAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredAnalyses.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onClick={() => navigate(`/root-cause-analyses/${analysis.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search size={64} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary text-lg mb-2">
              Nenhuma análise encontrada
            </p>
            {analyses.length === 0 ? (
              <>
                <p className="text-text-secondary text-sm mb-6">
                  Crie análises de causa raiz para investigar métricas abaixo da meta
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/root-cause-analyses/new')}
                >
                  <Plus size={20} className="mr-2" />
                  Criar Primeira Análise
                </Button>
              </>
            ) : (
              <p className="text-text-secondary text-sm">
                Tente ajustar os filtros para encontrar análises
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
