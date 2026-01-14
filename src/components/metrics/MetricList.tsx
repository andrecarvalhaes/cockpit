import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ExternalLink, AlertCircle, Plus, GripVertical } from 'lucide-react';
import { Metric } from '../../types/metric';
import { Modal } from '../shared/Modal';
import { MetricValueForm } from './MetricValueForm';
import { useMetrics } from '../../hooks/useMetrics';
import { getLatestValue, getPreviousValue, calculateVariation } from '../../utils/calculations';
import { formatMetricValue } from '../../utils/formatters';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MetricListProps {
  metrics: Metric[];
}

interface SortableRowProps {
  metric: Metric;
  onNavigate: (id: string) => void;
  onOpenValueModal: (metric: Metric) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({
  metric,
  onNavigate,
  onOpenValueModal,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const latestValue = getLatestValue(metric.values);
  const previousValue = getPreviousValue(metric.values);
  const currentValue = latestValue?.value || 0;
  const variation = previousValue ? calculateVariation(currentValue, previousValue.value) : 0;

  const getTrendIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp size={16} className="text-success" />;
    if (variation < 0) return <TrendingDown size={16} className="text-error" />;
    return <Minus size={16} className="text-text-secondary" />;
  };

  const getTrendColor = (variation: number) => {
    if (variation > 0) return 'text-success';
    if (variation < 0) return 'text-error';
    return 'text-text-secondary';
  };

  const getStatusIcon = (currentValue: number, target: number) => {
    const percentage = (currentValue / target) * 100;

    if (percentage >= 100) {
      return <AlertCircle size={16} className="text-success flex-shrink-0 mt-0.5" />;
    } else if (percentage >= 80) {
      return <AlertCircle size={16} className="text-warning flex-shrink-0 mt-0.5" />;
    } else {
      return <AlertCircle size={16} className="text-error flex-shrink-0 mt-0.5" />;
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-border hover:bg-bg-secondary transition-colors"
    >
      <td className="py-3 px-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="py-3 px-4 cursor-pointer" onClick={() => onNavigate(metric.id)}>
        <div className="flex items-start gap-2">
          {getStatusIcon(currentValue, metric.target)}
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {metric.name}
            </p>
            {metric.description && (
              <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                {metric.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 cursor-pointer" onClick={() => onNavigate(metric.id)}>
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {metric.area}
        </span>
      </td>
      <td className="py-3 px-4 text-right cursor-pointer" onClick={() => onNavigate(metric.id)}>
        <span className="text-sm font-bold text-text-primary">
          {formatMetricValue(currentValue, metric.unit)}
        </span>
      </td>
      <td className="py-3 px-4 text-right cursor-pointer" onClick={() => onNavigate(metric.id)}>
        <span className="text-sm text-text-secondary">
          {formatMetricValue(metric.target, metric.unit)}
        </span>
      </td>
      <td className="py-3 px-4 cursor-pointer" onClick={() => onNavigate(metric.id)}>
        <div className="flex items-center justify-center gap-1">
          {getTrendIcon(variation)}
          <span className={`text-sm font-semibold ${getTrendColor(variation)}`}>
            {Math.abs(variation).toFixed(1)}%
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenValueModal(metric);
            }}
            className="p-1.5 rounded-lg hover:bg-success hover:bg-opacity-10 transition-colors text-success"
            title="Lançar valor"
          >
            <Plus size={16} />
          </button>
          {metric.dataSourceLink && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(metric.dataSourceLink, '_blank', 'noopener,noreferrer');
              }}
              className="p-1.5 rounded-lg hover:bg-bg-primary transition-colors text-primary"
              title="Abrir fonte de dados"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const MetricList: React.FC<MetricListProps> = ({ metrics: initialMetrics }) => {
  const navigate = useNavigate();
  const { addMetricValue, updateMetricOrder } = useMetrics();
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);

  // Ordenar métricas por displayOrder ao carregar
  useEffect(() => {
    const sorted = [...initialMetrics].sort((a, b) => a.displayOrder - b.displayOrder);
    setMetrics(sorted);
  }, [initialMetrics]);

  // Função para navegar para a página de detalhes da métrica com URL absoluta
  const handleNavigateToMetric = (metricId: string) => {
    navigate(`/metrics/${metricId}`);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = metrics.findIndex((m) => m.id === active.id);
      const newIndex = metrics.findIndex((m) => m.id === over.id);

      const newMetrics = arrayMove(metrics, oldIndex, newIndex);
      setMetrics(newMetrics);

      // Atualizar displayOrder no banco
      try {
        await Promise.all(
          newMetrics.map((metric, index) =>
            updateMetricOrder(metric.id, index)
          )
        );
      } catch (error) {
        console.error('Error updating metric order:', error);
        // Reverter em caso de erro
        setMetrics(metrics);
      }
    }
  };

  const handleOpenValueModal = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsValueModalOpen(true);
  };

  const handleAddValue = async (values: any[]) => {
    if (!selectedMetric) return;

    try {
      for (const monthValue of values) {
        const [year, month] = monthValue.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 15);

        await addMetricValue(selectedMetric.id, {
          value: monthValue.value,
          date: date,
          note: monthValue.note,
        });
      }
      setIsValueModalOpen(false);
      setSelectedMetric(null);
    } catch (error) {
      console.error('Error adding values:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="w-10"></th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                Métrica
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                Área
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                Valor Atual
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                Meta
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-text-primary">
                Variação
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-text-primary w-24">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={metrics.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {metrics.map((metric) => (
                <SortableRow
                  key={metric.id}
                  metric={metric}
                  onNavigate={handleNavigateToMetric}
                  onOpenValueModal={handleOpenValueModal}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>

      {/* Modal de Lançamento de Valor */}
      {selectedMetric && (
        <Modal
          isOpen={isValueModalOpen}
          onClose={() => {
            setIsValueModalOpen(false);
            setSelectedMetric(null);
          }}
          title={`Lançar Novo Valor - ${selectedMetric.name}`}
          size="md"
        >
          <MetricValueForm
            onSubmit={handleAddValue}
            onCancel={() => {
              setIsValueModalOpen(false);
              setSelectedMetric(null);
            }}
            unit={selectedMetric.unit}
            existingValues={selectedMetric.values}
          />
        </Modal>
      )}
    </div>
  );
};
