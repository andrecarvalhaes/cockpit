import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, TrendingUp, TrendingDown } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { Header } from '../components/layout/Header';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Modal } from '../components/shared/Modal';
import { MetricChart } from '../components/metrics/MetricChart';
import { MetricValueForm } from '../components/metrics/MetricValueForm';
import { MetricForm } from '../components/metrics/MetricForm';
import { ActionPlanForm } from '../components/action-plans/ActionPlanForm';
import { ActionPlanCard } from '../components/action-plans/ActionPlanCard';
import { MonthRangePicker } from '../components/shared/MonthRangePicker';
import { useMetrics } from '../hooks/useMetrics';
import { useActionPlans } from '../hooks/useActionPlans';
import { formatMetricValue, formatDate } from '../utils/formatters';
import { getLatestValue, calculateAverage, calculateTrend } from '../utils/calculations';
import { MetricValueFormData, MetricFormData } from '../types/metric';
import { ActionPlanFormData } from '../types/actionPlan';

type ChartType = 'line' | 'bar' | 'area';

export const MetricDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMetricById, addMetricValue, updateMetric, deleteMetric } = useMetrics();
  const { getActionPlansByMetric, addActionPlan } = useActionPlans();

  const metric = id ? getMetricById(id) : undefined;
  const actionPlans = id ? getActionPlansByMetric(id) : [];

  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('line');

  // Default to last 6 months
  const [startMonth, setStartMonth] = useState(format(subMonths(new Date(), 5), 'yyyy-MM'));
  const [endMonth, setEndMonth] = useState(format(new Date(), 'yyyy-MM'));

  if (!metric) {
    return (
      <div className="p-10">
        <p className="text-text-secondary">Métrica não encontrada</p>
      </div>
    );
  }

  const latestValue = getLatestValue(metric.values);
  const average = calculateAverage(metric.values.map((v) => v.value));
  const maxValue = Math.max(...metric.values.map((v) => v.value), 0);
  const minValue = Math.min(...metric.values.map((v) => v.value), 0);
  const trend = calculateTrend(metric.values);

  const handleAddValue = async (values: any[]) => {
    try {
      // Lançar múltiplos valores
      for (const monthValue of values) {
        // Criar data no timezone local (meio do mês para evitar problemas de timezone)
        const [year, month] = monthValue.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 15); // Dia 15 do mês

        await addMetricValue(metric.id, {
          value: monthValue.value,
          date: date,
          note: monthValue.note,
        });
      }
      setIsValueModalOpen(false);
    } catch (error) {
      console.error('Error adding values:', error);
    }
  };

  const handleUpdateMetric = () => {
    // A atualização será feita dentro do MetricForm
    setIsEditModalOpen(false);
  };

  const handleDeleteMetric = () => {
    if (window.confirm('Tem certeza que deseja excluir esta métrica?')) {
      deleteMetric(metric.id);
      navigate('/metrics');
    }
  };

  const handleCreateActionPlan = (data: ActionPlanFormData) => {
    addActionPlan(data, metric.name);
    setIsActionPlanModalOpen(false);
  };

  return (
    <div>
      <Header
        title={metric.name}
        subtitle={metric.description}
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} className="mr-2" />
              Voltar
            </Button>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit size={20} className="mr-2" />
              Editar
            </Button>
            <Button variant="danger" onClick={handleDeleteMetric}>
              <Trash2 size={20} className="mr-2" />
              Excluir
            </Button>
            <Button variant="success" onClick={() => setIsValueModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Lançar Valor
            </Button>
          </div>
        }
      />

      <div className="p-10">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <p className="text-sm text-text-secondary font-medium mb-2">Valor Atual</p>
            <p className="text-2xl font-bold text-text-primary">
              {latestValue ? formatMetricValue(latestValue.value, metric.unit) : '-'}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-text-secondary font-medium mb-2">Meta</p>
            <p className="text-2xl font-bold text-primary">
              {formatMetricValue(metric.target, metric.unit)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-text-secondary font-medium mb-2">Média</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatMetricValue(average, metric.unit)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-text-secondary font-medium mb-2">Máximo</p>
            <p className="text-2xl font-bold text-success">
              {formatMetricValue(maxValue, metric.unit)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-text-secondary font-medium mb-2">Tendência</p>
            <div className="flex items-center gap-2">
              {trend === 'up' && <TrendingUp size={24} className="text-success" />}
              {trend === 'down' && <TrendingDown size={24} className="text-error" />}
              <p className="text-2xl font-bold text-text-primary capitalize">{trend === 'up' ? 'Alta' : trend === 'down' ? 'Baixa' : 'Estável'}</p>
            </div>
          </Card>
        </div>

        {/* Filtro de Período */}
        <Card className="mb-6">
          <MonthRangePicker
            label="Período do gráfico:"
            startMonth={startMonth}
            endMonth={endMonth}
            onStartMonthChange={setStartMonth}
            onEndMonthChange={setEndMonth}
          />
        </Card>

        {/* Gráfico */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-bold text-text-primary">
              {metric.name}
            </h3>
            <div className="flex gap-2">
              <Button
                variant={selectedChartType === 'line' ? 'primary' : 'secondary'}
                onClick={() => setSelectedChartType('line')}
              >
                Linha
              </Button>
              <Button
                variant={selectedChartType === 'bar' ? 'primary' : 'secondary'}
                onClick={() => setSelectedChartType('bar')}
              >
                Barras
              </Button>
              <Button
                variant={selectedChartType === 'area' ? 'primary' : 'secondary'}
                onClick={() => setSelectedChartType('area')}
              >
                Área
              </Button>
            </div>
          </div>
          <MetricChart
            metric={metric}
            height={400}
            chartType={selectedChartType}
            startMonth={startMonth}
            endMonth={endMonth}
          />
        </Card>

        {/* Histórico de Valores */}
        <Card className="mb-8">
          <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
            Histórico de Valores
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Data
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Valor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Observação
                  </th>
                </tr>
              </thead>
              <tbody>
                {metric.values
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((value) => (
                    <tr key={value.id} className="border-b border-border">
                      <td className="py-3 px-4 text-sm text-text-primary">
                        {formatDate(new Date(value.date))}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-text-primary">
                        {formatMetricValue(value.value, metric.unit)}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {value.note || '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Planos de Ação */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold text-text-primary">
              Planos de Ação Relacionados
            </h3>
            <Button
              variant="primary"
              onClick={() => setIsActionPlanModalOpen(true)}
            >
              <Plus size={20} className="mr-2" />
              Novo Plano de Ação
            </Button>
          </div>

          {actionPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {actionPlans.map((plan) => (
                <ActionPlanCard
                  key={plan.id}
                  plan={plan}
                  onClick={() => navigate(`/action-plans`)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-text-secondary text-center">
                Nenhum plano de ação vinculado a esta métrica
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isValueModalOpen}
        onClose={() => setIsValueModalOpen(false)}
        title="Lançar Novo Valor"
        size="md"
      >
        <MetricValueForm
          onSubmit={handleAddValue}
          onCancel={() => setIsValueModalOpen(false)}
          unit={metric.unit}
          existingValues={metric.values}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Métrica"
        size="lg"
      >
        <MetricForm
          onClose={() => setIsEditModalOpen(false)}
          metricId={metric.id}
          initialData={{
            name: metric.name,
            description: metric.description,
            teamId: metric.teamId,
            area: metric.area,
            unit: metric.unit,
            target: metric.target,
            monthlyTargets: metric.monthlyTargets || [],
          }}
        />
      </Modal>

      <Modal
        isOpen={isActionPlanModalOpen}
        onClose={() => setIsActionPlanModalOpen(false)}
        title="Novo Plano de Ação"
        size="lg"
      >
        <ActionPlanForm
          onSubmit={handleCreateActionPlan}
          onCancel={() => setIsActionPlanModalOpen(false)}
          prefilledMetricId={metric.id}
        />
      </Modal>
    </div>
  );
};
