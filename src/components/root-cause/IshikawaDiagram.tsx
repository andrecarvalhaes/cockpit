import React from 'react';
import { Target } from 'lucide-react';
import { IshikawaCause, IshikawaCategory } from '../../types/rootCauseAnalysis';

interface IshikawaDiagramProps {
  problem: string;
  causes: IshikawaCause[];
}

const CATEGORIES: IshikawaCategory[] = [
  'Método',
  'Material',
  'Máquina',
  'Mão de obra',
  'Medição',
  'Meio Ambiente',
];

const CATEGORY_COLORS: Record<IshikawaCategory, string> = {
  'Método': '#3B82F6',
  'Material': '#10B981',
  'Máquina': '#F59E0B',
  'Mão de obra': '#8B5CF6',
  'Medição': '#EC4899',
  'Meio Ambiente': '#14B8A6',
};

export const IshikawaDiagram: React.FC<IshikawaDiagramProps> = ({
  problem,
  causes,
}) => {
  const getCausesByCategory = (category: IshikawaCategory) => {
    return causes.filter((c) => c.category === category);
  };

  return (
    <div className="relative w-full bg-white border border-border rounded-lg p-8">
      <svg
        viewBox="0 0 1200 800"
        className="w-full h-auto"
        style={{ minHeight: '500px' }}
      >
        {/* Linha Principal (Espinha Central) */}
        <line
          x1="100"
          y1="400"
          x2="900"
          y2="400"
          stroke="#94A3B8"
          strokeWidth="4"
        />

        {/* Cabeça do Peixe (Problema) */}
        <ellipse
          cx="1000"
          cy="400"
          rx="150"
          ry="100"
          fill="#EFF6FF"
          stroke="#3B82F6"
          strokeWidth="3"
        />

        <foreignObject x="875" y="350" width="250" height="100">
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center">
              <Target size={20} className="mx-auto mb-2 text-primary" />
              <p className="text-sm font-semibold text-text-primary line-clamp-3">
                {problem}
              </p>
            </div>
          </div>
        </foreignObject>

        {/* Espinhas Superiores */}
        {CATEGORIES.slice(0, 3).map((category, index) => {
          const x = 200 + index * 250;
          const y = 400;
          const causesInCategory = getCausesByCategory(category);

          return (
            <g key={category}>
              {/* Linha da Espinha */}
              <line
                x1={x}
                y1={y}
                x2={x + 80}
                y2={y - 120}
                stroke={CATEGORY_COLORS[category]}
                strokeWidth="3"
              />

              {/* Nome da Categoria */}
              <foreignObject x={x + 85} y={y - 135} width="150" height="40">
                <div className="text-sm font-bold text-text-primary">
                  {category}
                </div>
              </foreignObject>

              {/* Causas */}
              {causesInCategory.map((cause, causeIndex) => (
                <foreignObject
                  key={cause.id}
                  x={x + 10}
                  y={y - 100 + causeIndex * 30}
                  width="150"
                  height="25"
                >
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      cause.isRootCause
                        ? 'bg-red-100 text-error font-semibold'
                        : 'bg-gray-100 text-text-secondary'
                    }`}
                  >
                    {cause.cause.length > 20
                      ? cause.cause.substring(0, 20) + '...'
                      : cause.cause}
                  </div>
                </foreignObject>
              ))}
            </g>
          );
        })}

        {/* Espinhas Inferiores */}
        {CATEGORIES.slice(3, 6).map((category, index) => {
          const x = 200 + index * 250;
          const y = 400;
          const causesInCategory = getCausesByCategory(category);

          return (
            <g key={category}>
              {/* Linha da Espinha */}
              <line
                x1={x}
                y1={y}
                x2={x + 80}
                y2={y + 120}
                stroke={CATEGORY_COLORS[category]}
                strokeWidth="3"
              />

              {/* Nome da Categoria */}
              <foreignObject x={x + 85} y={y + 100} width="150" height="40">
                <div className="text-sm font-bold text-text-primary">
                  {category}
                </div>
              </foreignObject>

              {/* Causas */}
              {causesInCategory.map((cause, causeIndex) => (
                <foreignObject
                  key={cause.id}
                  x={x + 10}
                  y={y + 30 + causeIndex * 30}
                  width="150"
                  height="25"
                >
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      cause.isRootCause
                        ? 'bg-red-100 text-error font-semibold'
                        : 'bg-gray-100 text-text-secondary'
                    }`}
                  >
                    {cause.cause.length > 20
                      ? cause.cause.substring(0, 20) + '...'
                      : cause.cause}
                  </div>
                </foreignObject>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legenda */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100"></div>
          <span className="text-xs text-text-secondary">Causa Identificada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100"></div>
          <span className="text-xs text-error font-semibold">Causa Raiz</span>
        </div>
      </div>
    </div>
  );
};
