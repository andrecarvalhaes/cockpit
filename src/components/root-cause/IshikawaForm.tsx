import React, { useState } from 'react';
import { Plus, X, Target } from 'lucide-react';
import { IshikawaCause, IshikawaCategory } from '../../types/rootCauseAnalysis';
import { Button } from '../shared/Button';
import { Select } from '../shared/Select';
import { Input } from '../shared/Input';

interface IshikawaFormProps {
  initialCauses?: IshikawaCause[];
  onSave: (causes: IshikawaCause[]) => void;
  readOnly?: boolean;
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
  'Método': 'bg-blue-100 text-blue-700',
  'Material': 'bg-green-100 text-green-700',
  'Máquina': 'bg-yellow-100 text-yellow-700',
  'Mão de obra': 'bg-purple-100 text-purple-700',
  'Medição': 'bg-pink-100 text-pink-700',
  'Meio Ambiente': 'bg-teal-100 text-teal-700',
};

export const IshikawaForm: React.FC<IshikawaFormProps> = ({
  initialCauses = [],
  onSave,
  readOnly = false,
}) => {
  const [causes, setCauses] = useState<IshikawaCause[]>(initialCauses);
  const [selectedCategory, setSelectedCategory] = useState<IshikawaCategory>('Método');
  const [newCause, setNewCause] = useState('');
  const [isRootCause, setIsRootCause] = useState(false);

  const handleAddCause = () => {
    if (newCause.trim()) {
      const cause: IshikawaCause = {
        id: Date.now().toString(),
        category: selectedCategory,
        cause: newCause.trim(),
        isRootCause,
      };
      setCauses((prev) => [...prev, cause]);
      setNewCause('');
      setIsRootCause(false);
    }
  };

  const handleRemoveCause = (id: string) => {
    setCauses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleRootCause = (id: string) => {
    setCauses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isRootCause: !c.isRootCause } : c
      )
    );
  };

  const handleSave = () => {
    onSave(causes);
  };

  const getCausesByCategory = (category: IshikawaCategory) => {
    return causes.filter((c) => c.category === category);
  };

  const canSave = causes.length > 0;

  return (
    <div className="space-y-6">
      {/* Formulário de Adição */}
      {!readOnly && (
        <div className="bg-bg-secondary border border-border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Adicionar Nova Causa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Categoria"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as IshikawaCategory)}
              options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
            />

            <div className="md:col-span-2">
              <Input
                label="Descrição da Causa"
                value={newCause}
                onChange={(e) => setNewCause(e.target.value)}
                placeholder="Digite a causa identificada..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCause();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRootCause}
                onChange={(e) => setIsRootCause(e.target.checked)}
                className="w-4 h-4 rounded border-border text-error focus:ring-error"
              />
              <span className="text-sm text-text-secondary">
                Marcar como Causa Raiz
              </span>
            </label>

            <Button
              variant="primary"
              onClick={handleAddCause}
              disabled={!newCause.trim()}
            >
              <Plus size={16} className="mr-2" />
              Adicionar Causa
            </Button>
          </div>
        </div>
      )}

      {/* Lista de Causas por Categoria */}
      <div className="space-y-4">
        {CATEGORIES.map((category) => {
          const categoryCauses = getCausesByCategory(category);
          if (categoryCauses.length === 0) return null;

          return (
            <div
              key={category}
              className="border border-border rounded-lg p-4 bg-white"
            >
              <h4
                className={`text-sm font-semibold mb-3 inline-block px-3 py-1 rounded-full ${CATEGORY_COLORS[category]}`}
              >
                {category}
              </h4>
              <div className="space-y-2">
                {categoryCauses.map((cause) => (
                  <div
                    key={cause.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      cause.isRootCause
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {cause.isRootCause && (
                        <Target size={16} className="text-error flex-shrink-0" />
                      )}
                      <p className="text-sm text-text-primary">{cause.cause}</p>
                    </div>

                    {!readOnly && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRootCause(cause.id)}
                          className="text-xs text-text-secondary hover:text-error transition-colors"
                          title="Marcar/Desmarcar como Causa Raiz"
                        >
                          {cause.isRootCause ? 'Desmarcar' : 'Marcar Raiz'}
                        </button>
                        <button
                          onClick={() => handleRemoveCause(cause.id)}
                          className="text-text-secondary hover:text-error transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {causes.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          <p>Nenhuma causa adicionada ainda</p>
          <p className="text-sm mt-1">
            Adicione causas nas 6 categorias (6M) para completar a análise
          </p>
        </div>
      )}

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
