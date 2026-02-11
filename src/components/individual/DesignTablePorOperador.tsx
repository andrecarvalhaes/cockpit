import React from 'react';
import { Maximize2 } from 'lucide-react';
import { DesignMetricsAgregadas } from '../../hooks/useDesignMetrics';

interface DesignTablePorOperadorProps {
  metricasPorOperador: Record<string, DesignMetricsAgregadas>;
  onExpandOperador?: (operador: string) => void;
}

export const DesignTablePorOperador: React.FC<DesignTablePorOperadorProps> = ({
  metricasPorOperador,
  onExpandOperador,
}) => {
  const operadores = Object.keys(metricasPorOperador).sort();

  if (operadores.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-border p-8 text-center">
        <p className="text-text-secondary">
          Nenhum operador selecionado ou dados não encontrados
        </p>
      </div>
    );
  }

  // Calcular totais somando todos os operadores
  const getTotalMetrics = () => {
    let totalScore = 0;
    let count = 0;
    let totalPercentualNoPrazo = 0;
    let validPercentCount = 0;

    operadores.forEach(operador => {
      const metrics = metricasPorOperador[operador];
      totalScore += metrics.totalScore;
      count += metrics.count;

      // Para % no prazo, fazemos média dos operadores que têm dados válidos
      if (metrics.percentualNoPrazo > 0 || metrics.count > 0) {
        totalPercentualNoPrazo += metrics.percentualNoPrazo;
        validPercentCount += 1;
      }
    });

    return {
      totalScore,
      count,
      percentualNoPrazo: validPercentCount > 0 ? totalPercentualNoPrazo / validPercentCount : 0,
    };
  };

  const totalMetrics = getTotalMetrics();

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary sticky left-0 bg-bg-secondary z-10">
                Métrica
              </th>
              {operadores.map((operador) => (
                <th
                  key={operador}
                  className="px-6 py-4 text-center text-sm font-semibold text-text-primary whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{operador}</span>
                    {onExpandOperador && (
                      <button
                        onClick={() => onExpandOperador(operador)}
                        className="p-1.5 rounded hover:bg-primary hover:bg-opacity-10 text-text-secondary hover:text-primary transition-all duration-200"
                        title="Expandir detalhamento"
                      >
                        <Maximize2 size={14} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary whitespace-nowrap bg-primary bg-opacity-5">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Linha de Pontuação */}
            <tr className="hover:bg-bg-submenu transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-text-primary sticky left-0 bg-white hover:bg-bg-submenu z-10">
                Pontuação
              </td>
              {operadores.map((operador) => (
                <td
                  key={operador}
                  className="px-6 py-4 text-sm text-text-primary text-center font-semibold transition-colors"
                >
                  {metricasPorOperador[operador].totalScore.toFixed(2)}
                </td>
              ))}
              <td className="px-6 py-4 text-sm text-text-primary text-center font-bold bg-primary bg-opacity-5">
                {totalMetrics.totalScore.toFixed(2)}
              </td>
            </tr>

            {/* Linha de Quantidade */}
            <tr className="hover:bg-bg-submenu transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-text-primary sticky left-0 bg-white hover:bg-bg-submenu z-10">
                Quantidade
              </td>
              {operadores.map((operador) => (
                <td
                  key={operador}
                  className="px-6 py-4 text-sm text-text-primary text-center font-semibold transition-colors"
                >
                  {metricasPorOperador[operador].count}
                </td>
              ))}
              <td className="px-6 py-4 text-sm text-text-primary text-center font-bold bg-primary bg-opacity-5">
                {totalMetrics.count}
              </td>
            </tr>

            {/* Linha de % no prazo */}
            <tr className="hover:bg-bg-submenu transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-text-primary sticky left-0 bg-white hover:bg-bg-submenu z-10">
                % no prazo
              </td>
              {operadores.map((operador) => (
                <td
                  key={operador}
                  className="px-6 py-4 text-sm text-text-primary text-center font-semibold transition-colors"
                >
                  {metricasPorOperador[operador].percentualNoPrazo.toFixed(1)}%
                </td>
              ))}
              <td className="px-6 py-4 text-sm text-text-primary text-center font-bold bg-primary bg-opacity-5">
                {totalMetrics.percentualNoPrazo.toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
