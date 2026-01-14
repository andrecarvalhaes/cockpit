import React, { useState } from 'react';
import { ArrowDown, Target } from 'lucide-react';
import { FiveWhysLevel } from '../../types/rootCauseAnalysis';
import { Button } from '../shared/Button';

interface FiveWhysAnalysisProps {
  problem: string;
  initialData?: FiveWhysLevel[];
  onSave: (levels: FiveWhysLevel[], rootCause: string) => void;
  readOnly?: boolean;
}

export const FiveWhysAnalysis: React.FC<FiveWhysAnalysisProps> = ({
  problem,
  initialData = [],
  onSave,
  readOnly = false,
}) => {
  const [levels, setLevels] = useState<FiveWhysLevel[]>(
    initialData.length > 0
      ? initialData
      : [{ level: 1, question: 'Por quê?', answer: '' }]
  );

  const handleAnswerChange = (level: number, answer: string) => {
    setLevels((prev) => {
      const updated = prev.map((l) => (l.level === level ? { ...l, answer } : l));

      if (answer.trim() && level < 5 && !prev.find((l) => l.level === level + 1)) {
        return [
          ...updated,
          { level: level + 1, question: 'Por quê?', answer: '' },
        ];
      }

      return updated;
    });
  };

  const handleSave = () => {
    const filledLevels = levels.filter((l) => l.answer.trim());
    const rootCause = filledLevels[filledLevels.length - 1]?.answer || '';
    onSave(filledLevels, rootCause);
  };

  const canSave = levels.some((l) => l.answer.trim());

  return (
    <div className="space-y-6">
      {/* Problema */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <p className="text-xs font-semibold text-blue-600 uppercase mb-2">
          Problema
        </p>
        <p className="text-text-primary font-medium">{problem}</p>
      </div>

      {/* 5 Porquês */}
      <div className="space-y-4">
        {levels.map((level, index) => {
          const isLast = index === levels.length - 1;
          const isFilled = level.answer.trim();
          const isRootCause = level.level === 5 || (isFilled && isLast);

          return (
            <div key={level.level}>
              <div
                className={`rounded-lg p-4 ${
                  isRootCause && isFilled
                    ? 'bg-red-50 border-2 border-red-200'
                    : 'bg-white border border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {isRootCause && isFilled && (
                    <Target size={20} className="text-error" />
                  )}
                  <p className="text-sm font-semibold text-text-secondary uppercase">
                    {isRootCause && isFilled
                      ? `Causa Raiz (Nível ${level.level})`
                      : `Por quê? (Nível ${level.level})`}
                  </p>
                </div>
                <textarea
                  value={level.answer}
                  onChange={(e) => handleAnswerChange(level.level, e.target.value)}
                  placeholder={`Responda o nível ${level.level}...`}
                  disabled={readOnly}
                  className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {!isLast && isFilled && (
                <div className="flex justify-center py-2">
                  <ArrowDown size={24} className="text-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ações */}
      {!readOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!canSave}
          >
            Salvar Análise
          </Button>
        </div>
      )}
    </div>
  );
};
