import React from 'react';
import { useForm } from 'react-hook-form';
import { ActionPlanFormData } from '../../types/actionPlan';
import { Input } from '../shared/Input';
import { Select } from '../shared/Select';
import { Button } from '../shared/Button';
import { useMetrics } from '../../hooks/useMetrics';

interface ActionPlanFormProps {
  onSubmit: (data: ActionPlanFormData) => void;
  initialData?: Partial<ActionPlanFormData>;
  onCancel?: () => void;
  prefilledMetricId?: string;
}

export const ActionPlanForm: React.FC<ActionPlanFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
  prefilledMetricId,
}) => {
  const { metrics } = useMetrics();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActionPlanFormData>({
    defaultValues: initialData || {
      metricId: prefilledMetricId || '',
    },
  });

  const metricOptions = metrics.map((metric) => ({
    value: metric.id,
    label: `${metric.name} (${metric.area})`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Título do Plano de Ação"
        {...register('title', { required: 'Título é obrigatório' })}
        error={errors.title?.message}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-primary">Descrição</label>
        <textarea
          {...register('description', { required: 'Descrição é obrigatória' })}
          className="min-h-[100px] px-4 py-2 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200"
        />
        {errors.description && (
          <span className="text-sm text-error">{errors.description.message}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Métrica Relacionada"
          options={[{ value: '', label: 'Selecione uma métrica' }, ...metricOptions]}
          {...register('metricId', { required: 'Métrica é obrigatória' })}
          error={errors.metricId?.message}
        />

        <Input
          label="Responsável"
          {...register('responsible', { required: 'Responsável é obrigatório' })}
          error={errors.responsible?.message}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-primary">Resultado Esperado</label>
        <textarea
          {...register('expectedResult', { required: 'Resultado esperado é obrigatório' })}
          className="min-h-[80px] px-4 py-2 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200"
          placeholder="Descreva o resultado esperado para este plano de ação..."
        />
        {errors.expectedResult && (
          <span className="text-sm text-error">{errors.expectedResult.message}</span>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary">
          {initialData ? 'Atualizar' : 'Criar'} Plano de Ação
        </Button>
      </div>
    </form>
  );
};
