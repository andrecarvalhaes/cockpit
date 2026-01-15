import React, { useState } from 'react';
import { HunterFilters, HunterFiltersState } from '../components/individual/HunterFilters';
import { HunterTablePorOperador } from '../components/individual/HunterTablePorOperador';
import { PhaseSelector } from '../components/individual/PhaseSelector';
import { useLigacoesAgregadas, useOperadoresAgregados, useCampanhasAgregadas } from '../hooks/useLigacoesAgregadas';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Flame } from 'lucide-react';

export const Individual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hunter' | 'closer'>('hunter');

  // Período padrão: mês atual
  const defaultStartDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Estados para Hunter
  const [filters, setFilters] = useState<HunterFiltersState>({
    operadores: [],
    campanhas: [],
    dateStart: defaultStartDate,
    dateEnd: defaultEndDate,
  });
  const [appliedFilters, setAppliedFilters] = useState<HunterFiltersState>({
    operadores: [],
    campanhas: [],
    dateStart: defaultStartDate,
    dateEnd: defaultEndDate,
  });
  const [selectedPhases, setSelectedPhases] = useState<string[]>([
    'Ligações',
    'Tempo total',
    'Tempo falada',
    'Tabulações Positivas',
    'Cards criados',
  ]);
  const [heatMapEnabled, setHeatMapEnabled] = useState(false);

  // Hooks de dados - usando view materializada
  const { operadores } = useOperadoresAgregados();
  const { campanhas } = useCampanhasAgregadas();
  const { metricas, metricasPorOperador, loading } = useLigacoesAgregadas(
    appliedFilters.operadores.length > 0 ||
    appliedFilters.campanhas.length > 0 ||
    appliedFilters.dateStart ||
    appliedFilters.dateEnd
      ? {
          operadores: appliedFilters.operadores.length > 0 ? appliedFilters.operadores : undefined,
          campanhas: appliedFilters.campanhas.length > 0 ? appliedFilters.campanhas : undefined,
          dateStart: appliedFilters.dateStart || undefined,
          dateEnd: appliedFilters.dateEnd || undefined,
        }
      : undefined
  );

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Individual</h1>
          <p className="text-text-secondary mt-1">
            Gestão individual por função
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('hunter')}
          className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'hunter'
              ? 'text-primary border-primary'
              : 'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Hunter
        </button>
        <button
          onClick={() => setActiveTab('closer')}
          className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'closer'
              ? 'text-primary border-primary'
              : 'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          Closer
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'hunter' && (
          <div className="space-y-6">
            {/* Filtros */}
            <HunterFilters
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
              operadores={operadores}
              campanhas={campanhas}
            />

            {/* Seletor de Fases e Mapa de Calor */}
            <div className="flex gap-4 items-stretch">
              <div className="flex-1">
                <PhaseSelector
                  selectedPhases={selectedPhases}
                  onPhasesChange={setSelectedPhases}
                />
              </div>

              {/* Toggle Mapa de Calor */}
              <div className="bg-white rounded-lg border border-border p-4 flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={heatMapEnabled}
                      onChange={(e) => setHeatMapEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral rounded-full peer peer-checked:bg-primary transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Flame size={18} className={heatMapEnabled ? 'text-primary' : 'text-text-secondary'} />
                    <span className="text-sm font-medium text-text-primary">
                      Mapa de Calor
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <p className="text-text-secondary">Carregando dados...</p>
              </div>
            )}

            {/* Tabela com operadores como colunas */}
            {!loading && (
              <HunterTablePorOperador
                metricasPorOperador={metricasPorOperador}
                selectedPhases={selectedPhases}
                heatMapEnabled={heatMapEnabled}
              />
            )}
          </div>
        )}

        {activeTab === 'closer' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">Closer</h2>
            <p className="text-text-secondary">
              Conteúdo de Closer virá aqui...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
