import React, { useState } from 'react';
import { DesignFilters, DesignFiltersState } from '../components/individual/DesignFilters';
import { DesignTablePorOperador } from '../components/individual/DesignTablePorOperador';
import { DesignTableExpandedOperador } from '../components/individual/DesignTableExpandedOperador';
import { useDesignMetrics, useDesignOperadores } from '../hooks/useDesignMetrics';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const Design: React.FC = () => {
  const [expandedOperador, setExpandedOperador] = useState<string | null>(null);

  // Período padrão: mês atual
  const defaultStartDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Estados para filtros
  const [filters, setFilters] = useState<DesignFiltersState>({
    operadores: [],
    dateStart: defaultStartDate,
    dateEnd: defaultEndDate,
  });
  const [appliedFilters, setAppliedFilters] = useState<DesignFiltersState>({
    operadores: [],
    dateStart: defaultStartDate,
    dateEnd: defaultEndDate,
  });

  // Hooks de dados
  const { operadores } = useDesignOperadores();
  const { metricasPorOperador, loading } = useDesignMetrics(
    appliedFilters.operadores.length > 0 ||
    appliedFilters.dateStart ||
    appliedFilters.dateEnd
      ? {
          operadores: appliedFilters.operadores.length > 0 ? appliedFilters.operadores : undefined,
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
          <h1 className="text-3xl font-bold text-text-primary">Design</h1>
          <p className="text-text-secondary mt-1">
            Acompanhamento de pontuação por operador
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Filtros */}
        <DesignFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          operadores={operadores}
        />

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-text-secondary">Carregando dados...</p>
          </div>
        )}

        {/* Tabela com operadores ou detalhamento expandido */}
        {!loading && (
          <>
            {expandedOperador ? (
              <DesignTableExpandedOperador
                operador={expandedOperador}
                dateStart={appliedFilters.dateStart || defaultStartDate}
                dateEnd={appliedFilters.dateEnd || defaultEndDate}
                onClose={() => setExpandedOperador(null)}
              />
            ) : (
              <DesignTablePorOperador
                metricasPorOperador={metricasPorOperador}
                onExpandOperador={setExpandedOperador}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
