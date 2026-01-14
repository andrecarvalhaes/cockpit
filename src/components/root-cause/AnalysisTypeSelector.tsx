import React from 'react';
import { HelpCircle, GitBranch } from 'lucide-react';
import { AnalysisType } from '../../types/rootCauseAnalysis';

interface AnalysisTypeSelectorProps {
  value: AnalysisType;
  onChange: (type: AnalysisType) => void;
}

export const AnalysisTypeSelector: React.FC<AnalysisTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  const types: { value: AnalysisType; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: '5whys',
      label: '5 Porquês',
      description: 'Investigação profunda perguntando "Por quê?" 5 vezes consecutivas para chegar à causa raiz.',
      icon: <HelpCircle size={24} className="text-blue-600" />,
    },
    {
      value: 'ishikawa',
      label: 'Diagrama de Ishikawa',
      description: 'Análise categorizada usando as 6 categorias (6M): Método, Material, Máquina, Mão de obra, Medição e Meio Ambiente.',
      icon: <GitBranch size={24} className="text-green-600" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">
          Escolha o Tipo de Análise
        </h3>
        <p className="text-sm text-text-secondary">
          Selecione a metodologia mais adequada para investigar a causa raiz do problema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`relative flex flex-col items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              value === type.value
                ? 'border-primary bg-primary bg-opacity-5'
                : 'border-border bg-white hover:border-primary hover:border-opacity-50'
            }`}
          >
            {/* Radio Indicator */}
            <div
              className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                value === type.value
                  ? 'border-primary bg-primary'
                  : 'border-border bg-white'
              }`}
            >
              {value === type.value && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>

            {/* Icon & Title */}
            <div className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                  type.value === '5whys'
                    ? 'bg-blue-100'
                    : 'bg-green-100'
                }`}
              >
                {type.icon}
              </div>
              <h4 className="text-base font-semibold text-text-primary">
                {type.label}
              </h4>
            </div>

            {/* Description */}
            <p className="text-sm text-text-secondary leading-relaxed">
              {type.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
