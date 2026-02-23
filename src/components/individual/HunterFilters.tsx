import React from 'react';
import { MultiSelect } from '../shared/MultiSelect';
import { DateRangePicker } from '../shared/DateRangePicker';
import { Search } from 'lucide-react';

export interface HunterFiltersState {
  operadores: string[];
  campanhas: string[];
  dateStart: string;
  dateEnd: string;
}

interface HunterFiltersProps {
  filters: HunterFiltersState;
  onFiltersChange: (filters: HunterFiltersState) => void;
  onApplyFilters: () => void;
  operadores: string[];
  campanhas: string[];
}

export const HunterFilters: React.FC<HunterFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  operadores,
  campanhas,
}) => {
  const updateFilter = (key: keyof HunterFiltersState, value: string[] | string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleDateChange = (range: { startDate: string; endDate: string }) => {
    onFiltersChange({
      ...filters,
      dateStart: range.startDate,
      dateEnd: range.endDate,
    });
  };

  const toggleAllOperadores = () => {
    if (filters.operadores.length === operadores.length) {
      updateFilter('operadores', []);
    } else {
      updateFilter('operadores', operadores);
    }
  };

  const toggleAllCampanhas = () => {
    if (filters.campanhas.length === campanhas.length) {
      updateFilter('campanhas', []);
    } else {
      updateFilter('campanhas', campanhas);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Operador - MultiSelect */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">Operador</label>
            <button
              onClick={toggleAllOperadores}
              className="text-xs text-primary hover:text-primary-dark font-medium"
              type="button"
            >
              {filters.operadores.length === operadores.length ? 'Limpar todos' : 'Selecionar todos'}
            </button>
          </div>
          <MultiSelect
            value={filters.operadores}
            onChange={(value) => updateFilter('operadores', value)}
            options={operadores.map(op => ({ value: op, label: op }))}
            placeholder="Todos os operadores"
          />
        </div>

        {/* Campanha - MultiSelect */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">Campanha</label>
            <button
              onClick={toggleAllCampanhas}
              className="text-xs text-primary hover:text-primary-dark font-medium"
              type="button"
            >
              {filters.campanhas.length === campanhas.length ? 'Limpar todos' : 'Selecionar todos'}
            </button>
          </div>
          <MultiSelect
            value={filters.campanhas}
            onChange={(value) => updateFilter('campanhas', value)}
            options={campanhas.map(camp => ({ value: camp, label: camp }))}
            placeholder="Todas as campanhas"
          />
        </div>

        {/* Período - DateRangePicker */}
        <DateRangePicker
          label="Período"
          startDate={filters.dateStart}
          endDate={filters.dateEnd}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Botão Filtrar */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onApplyFilters}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          <Search size={18} />
          Filtrar
        </button>
      </div>
    </div>
  );
};
