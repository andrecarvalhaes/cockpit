import React, { useState } from 'react';
import { MonthlyTarget } from '../../types/metric';

interface MonthlyTargetsInputProps {
  targets: MonthlyTarget[];
  onChange: (targets: MonthlyTarget[]) => void;
}

export const MonthlyTargetsInput: React.FC<MonthlyTargetsInputProps> = ({
  targets,
  onChange,
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleTargetChange = (monthIndex: number, value: string) => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const targetValue = parseFloat(value);

    if (value === '' || isNaN(targetValue)) {
      // Remove a meta se o valor for vazio
      onChange(targets.filter((t) => t.month !== month));
    } else {
      // Verifica se já existe uma meta para este mês
      const existingIndex = targets.findIndex((t) => t.month === month);

      if (existingIndex >= 0) {
        // Atualiza a meta existente
        const updatedTargets = [...targets];
        updatedTargets[existingIndex] = { month, target: targetValue };
        onChange(updatedTargets);
      } else {
        // Adiciona nova meta
        onChange([...targets, { month, target: targetValue }].sort((a, b) => a.month.localeCompare(b.month)));
      }
    }
  };

  const getTargetForMonth = (monthIndex: number): string => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const target = targets.find((t) => t.month === month);
    return target ? target.target.toString() : '';
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-text-primary">
          Selecione o ano:
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {months.map((monthName, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {monthName}
            </label>
            <input
              type="number"
              step="0.01"
              value={getTargetForMonth(index)}
              onChange={(e) => handleTargetChange(index, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Meta"
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-text-secondary">
        {targets.length > 0
          ? `${targets.length} ${targets.length === 1 ? 'meta mensal definida' : 'metas mensais definidas'}`
          : 'Nenhuma meta mensal definida. Será usada a meta padrão para todos os meses.'}
      </p>
    </div>
  );
};
