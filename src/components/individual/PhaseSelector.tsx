import React from 'react';

interface PhaseSelectorProps {
  selectedPhases: string[];
  onPhasesChange: (phases: string[]) => void;
}

const AVAILABLE_PHASES = [
  'Ligações',
  'Tempo total',
  'Tempo falada',
  'Tabulações Positivas',
  'Cards criados',
];

export const PhaseSelector: React.FC<PhaseSelectorProps> = ({
  selectedPhases,
  onPhasesChange,
}) => {
  const togglePhase = (phase: string) => {
    if (selectedPhases.includes(phase)) {
      onPhasesChange(selectedPhases.filter(p => p !== phase));
    } else {
      onPhasesChange([...selectedPhases, phase]);
    }
  };

  const selectAll = () => {
    onPhasesChange(AVAILABLE_PHASES);
  };

  const clearAll = () => {
    onPhasesChange([]);
  };

  return (
    <div className="bg-white rounded-lg border border-border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Selecionar Fases
        </h3>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
          >
            Selecionar todas
          </button>
          <span className="text-text-secondary">|</span>
          <button
            onClick={clearAll}
            className="text-xs text-text-secondary hover:text-text-primary font-medium transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_PHASES.map((phase) => (
          <button
            key={phase}
            onClick={() => togglePhase(phase)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedPhases.includes(phase)
                ? 'bg-primary text-white'
                : 'bg-bg-secondary text-text-primary hover:bg-bg-submenu'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>
    </div>
  );
};
