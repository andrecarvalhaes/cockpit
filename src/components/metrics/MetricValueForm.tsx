import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { Edit2 } from 'lucide-react';
import { MetricValue } from '../../types/metric';
import { format } from 'date-fns';

interface MonthValue {
  month: string; // formato "YYYY-MM"
  value: number;
  note?: string;
}

interface MetricValueFormProps {
  onSubmit: (values: MonthValue[]) => void;
  onCancel?: () => void;
  unit: string;
  existingValues?: MetricValue[]; // Valores já lançados
}

export const MetricValueForm: React.FC<MetricValueFormProps> = ({
  onSubmit,
  onCancel,
  unit,
  existingValues = [],
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [monthValues, setMonthValues] = useState<MonthValue[]>([]);
  const [editingMonths, setEditingMonths] = useState<Set<string>>(new Set());

  // Verifica se um mês já tem valor lançado
  const getExistingValueForMonth = (monthIndex: number): MetricValue | undefined => {
    const targetMonth = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    return existingValues.find(v => {
      const valueMonth = format(new Date(v.date), 'yyyy-MM');
      return valueMonth === targetMonth;
    });
  };

  const isMonthEditing = (monthIndex: number): boolean => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    return editingMonths.has(month);
  };

  const toggleEditMonth = (monthIndex: number) => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const existing = getExistingValueForMonth(monthIndex);

    setEditingMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(month)) {
        newSet.delete(month);
        // Remove dos valores se parar de editar
        setMonthValues(current => current.filter(v => v.month !== month));
      } else {
        newSet.add(month);
        // Adiciona o valor existente para edição
        if (existing) {
          setMonthValues(current => [...current, {
            month,
            value: existing.value,
            note: existing.note
          }]);
        }
      }
      return newSet;
    });
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleValueChange = (monthIndex: number, value: string) => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const numericValue = parseFloat(value);

    if (value === '' || isNaN(numericValue)) {
      // Remove o valor se o campo for vazio
      setMonthValues(prev => prev.filter(v => v.month !== month));
    } else {
      // Verifica se já existe um valor para este mês
      const existingIndex = monthValues.findIndex(v => v.month === month);

      if (existingIndex >= 0) {
        // Atualiza o valor existente
        const updated = [...monthValues];
        updated[existingIndex] = { ...updated[existingIndex], value: numericValue };
        setMonthValues(updated);
      } else {
        // Adiciona novo valor
        setMonthValues(prev => [...prev, { month, value: numericValue }].sort((a, b) => a.month.localeCompare(b.month)));
      }
    }
  };

  const handleNoteChange = (monthIndex: number, note: string) => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const existingIndex = monthValues.findIndex(v => v.month === month);

    if (existingIndex >= 0) {
      const updated = [...monthValues];
      updated[existingIndex] = { ...updated[existingIndex], note: note || undefined };
      setMonthValues(updated);
    }
  };

  const getValueForMonth = (monthIndex: number): string => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const monthValue = monthValues.find(v => v.month === month);
    return monthValue ? monthValue.value.toString() : '';
  };

  const getNoteForMonth = (monthIndex: number): string => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const monthValue = monthValues.find(v => v.month === month);
    return monthValue?.note || '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (monthValues.length > 0) {
      onSubmit(monthValues);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // 2 anos atrás até 2 anos à frente

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="space-y-3">
        <p className="text-sm font-medium text-text-primary">
          Lançar valores mensais ({unit}):
        </p>

        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {months.map((monthName, index) => {
            const existingValue = getExistingValueForMonth(index);
            const isEditing = isMonthEditing(index);
            const hasExisting = !!existingValue;

            return (
              <div key={index} className={`border rounded-lg p-3 ${hasExisting && !isEditing ? 'bg-green-50 border-green-200' : 'bg-bg-secondary border-border'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-text-primary w-24">
                    {monthName}
                  </span>

                  {hasExisting && !isEditing ? (
                    <>
                      <div className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg">
                        <span className="text-sm font-semibold text-green-700">
                          {existingValue.value} {unit}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleEditMonth(index)}
                        className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Editar
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        step="0.01"
                        value={getValueForMonth(index)}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={`Valor em ${unit}`}
                      />
                      {hasExisting && isEditing && (
                        <button
                          type="button"
                          onClick={() => toggleEditMonth(index)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </>
                  )}
                </div>
                {(getValueForMonth(index) || (hasExisting && !isEditing)) && (
                  <div className="text-xs text-text-secondary">
                    {hasExisting && !isEditing ? (
                      existingValue.note && (
                        <p className="px-3 py-2 bg-white border border-green-200 rounded-lg">
                          <span className="font-medium">Obs:</span> {existingValue.note}
                        </p>
                      )
                    ) : (
                      getValueForMonth(index) && (
                        <input
                          type="text"
                          value={getNoteForMonth(index)}
                          onChange={(e) => handleNoteChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          placeholder="Observação (opcional)"
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs text-text-secondary mb-4">
          {monthValues.length > 0
            ? `${monthValues.length} ${monthValues.length === 1 ? 'valor será lançado' : 'valores serão lançados'}`
            : 'Nenhum valor será lançado. Preencha pelo menos um mês.'}
        </p>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="success"
            disabled={monthValues.length === 0}
          >
            Lançar {monthValues.length > 0 ? `${monthValues.length} ${monthValues.length === 1 ? 'Valor' : 'Valores'}` : 'Valores'}
          </Button>
        </div>
      </div>
    </form>
  );
};
