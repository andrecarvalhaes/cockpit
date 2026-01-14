import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MetricFormData, MetricArea, MonthlyTarget } from '../../types/metric';
import { Input } from '../shared/Input';
import { Select } from '../shared/Select';
import { Button } from '../shared/Button';
import { MonthlyTargetsInput } from './MonthlyTargetsInput';
import { useAreas } from '../../hooks/useAreas';
import { useTeams } from '../../hooks/useTeams';
import { useMetrics } from '../../hooks/useMetrics';
import { Plus } from 'lucide-react';

interface MetricFormProps {
  onClose: () => void;
  initialData?: MetricFormData;
  initialTeamId?: string;
  initialArea?: MetricArea;
  metricId?: string;
}

export const MetricForm: React.FC<MetricFormProps> = ({
  onClose,
  initialData,
  initialTeamId,
  initialArea,
  metricId,
}) => {
  const { areas, addArea } = useAreas();
  const { teams } = useTeams();
  const { addMetric, updateMetric } = useMetrics();

  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>(
    initialData?.monthlyTargets || []
  );
  const [targetType, setTargetType] = useState<'linear' | 'monthly'>(
    initialData?.monthlyTargets && initialData.monthlyTargets.length > 0 ? 'monthly' : 'linear'
  );
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MetricFormData>({
    defaultValues: initialData || {
      teamId: initialTeamId,
      area: initialArea,
    },
  });

  const teamOptions = teams.map((team) => ({ value: team.id, label: team.name }));
  const areaOptions = areas.map((area) => ({ value: area, label: area }));

  const unitOptions = [
    { value: '%', label: '%' },
    { value: 'R$', label: 'R$' },
    { value: 'unidades', label: 'Unidades' },
    { value: 'leads', label: 'Leads' },
    { value: 'conversões', label: 'Conversões' },
    { value: 'contratos', label: 'Contratos' },
  ];

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      addArea(newAreaName.trim());
      setNewAreaName('');
      setIsAddingArea(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const metricData: MetricFormData = {
        ...data,
        target: targetType === 'monthly' ? 0 : data.target,
        monthlyTargets: targetType === 'monthly' ? monthlyTargets : [],
      };

      if (metricId) {
        await updateMetric(metricId, metricData);
      } else {
        await addMetric(metricData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar métrica:', error);
      // O erro já será mostrado pelo contexto via alert
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome da Métrica"
        {...register('name', { required: 'Nome é obrigatório' })}
        error={errors.name?.message}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-primary">Descrição</label>
        <textarea
          {...register('description', { required: 'Descrição é obrigatória' })}
          className="min-h-[80px] px-4 py-2 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200"
        />
        {errors.description && (
          <span className="text-sm text-error">{errors.description.message}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Time"
          options={teamOptions}
          {...register('teamId', { required: 'Time é obrigatório' })}
          error={errors.teamId?.message}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-primary">Área</label>
          <div className="flex gap-2">
            <select
              {...register('area', { required: 'Área é obrigatória' })}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200"
            >
              <option value="">Selecione uma área</option>
              {areaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddingArea(!isAddingArea)}
            >
              <Plus size={20} />
            </Button>
          </div>
          {errors.area && (
            <span className="text-sm text-error">{errors.area.message}</span>
          )}
        </div>
      </div>

      {/* Campo para adicionar nova área */}
      {isAddingArea && (
        <div className="p-4 bg-bg-secondary rounded-lg space-y-3">
          <label className="text-sm font-medium text-text-primary">Nova Área</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              placeholder="Nome da nova área"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-white text-text-primary focus-ring"
            />
            <Button type="button" variant="primary" onClick={handleAddArea}>
              Adicionar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddingArea(false);
                setNewAreaName('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <Select
        label="Unidade de Medida"
        options={unitOptions}
        {...register('unit', { required: 'Unidade é obrigatória' })}
        error={errors.unit?.message}
      />

      {/* Tipo de Meta */}
      <div className="border-t border-border pt-4 mt-6">
        <label className="text-sm font-medium text-text-primary mb-3 block">
          Tipo de Meta
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="linear"
              checked={targetType === 'linear'}
              onChange={(e) => setTargetType(e.target.value as 'linear' | 'monthly')}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-primary">Linear (padrão)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="monthly"
              checked={targetType === 'monthly'}
              onChange={(e) => setTargetType(e.target.value as 'linear' | 'monthly')}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-primary">Variada (mensal)</span>
          </label>
        </div>
        <p className="text-xs text-text-secondary mt-2">
          {targetType === 'linear'
            ? 'A meta padrão será usada para todos os meses'
            : 'Defina metas específicas para cada mês do ano'}
        </p>
      </div>

      {/* Meta Padrão - Apenas para tipo Linear */}
      {targetType === 'linear' && (
        <Input
          label="Meta Padrão"
          type="number"
          step="0.01"
          {...register('target', {
            required: targetType === 'linear' ? 'Meta é obrigatória' : false,
            valueAsNumber: true,
          })}
          error={errors.target?.message}
        />
      )}

      {/* Metas Mensais - Apenas para tipo Variada */}
      {targetType === 'monthly' && (
        <div className="border-t border-border pt-4">
          <MonthlyTargetsInput
            targets={monthlyTargets}
            onChange={setMonthlyTargets}
          />
        </div>
      )}

      {/* Campos adicionais */}
      <div className="border-t border-border pt-4 mt-6 space-y-4">
        <Input
          label="Ordem de Exibição"
          type="number"
          {...register('displayOrder', { valueAsNumber: true })}
          placeholder="0"
          helperText="Menor valor aparece primeiro (0 é o padrão)"
        />

        <Input
          label="Link da Fonte de Dados"
          type="url"
          {...register('dataSourceLink')}
          placeholder="https://exemplo.com/dados"
          helperText="Link para onde buscar os dados desta métrica"
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Atualizar' : 'Criar'} Métrica
        </Button>
      </div>
    </form>
  );
};
