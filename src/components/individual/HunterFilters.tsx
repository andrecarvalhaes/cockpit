import React, { useState } from 'react';
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

  return (
    <div className="bg-white rounded-lg border border-border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Operador - MultiSelect */}
        <MultiSelect
          label="Operador"
          value={filters.operadores}
          onChange={(value) => updateFilter('operadores', value)}
          options={operadores.map(op => ({ value: op, label: op }))}
          placeholder="Todos os operadores"
        />

        {/* Campanha - MultiSelect */}
        <MultiSelect
          label="Campanha"
          value={filters.campanhas}
          onChange={(value) => updateFilter('campanhas', value)}
          options={[
            ...campanhas.map(camp => ({ value: camp, label: camp })),
            { value: 'manual', label: 'Manual' },
          ]}
          placeholder="Todas as campanhas"
        />

        {/* Período - DateRangePicker */}
        <div className="lg:col-span-2">
          <DateRangePicker
            label="Período"
            startDate={filters.dateStart}
            endDate={filters.dateEnd}
            onDateChange={handleDateChange}
          />
        </div>
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
