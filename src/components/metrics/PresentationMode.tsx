import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, MessageSquare, Target } from 'lucide-react';
import { Metric } from '../../types/metric';
import { MetricChart } from './MetricChart';
import { Button } from '../shared/Button';

interface PresentationModeProps {
  metrics: Metric[];
  onClose: () => void;
  onOpenComment: (metric: Metric) => void;
  onOpenActionPlan: (metric: Metric) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  metrics,
  onClose,
  onOpenComment,
  onOpenActionPlan,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMetric = metrics[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % metrics.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + metrics.length) % metrics.length);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!currentMetric) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">{currentMetric.name}</h2>
          <span className="text-gray-400 text-lg">
            {currentIndex + 1} / {metrics.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
          title="Sair (Esc)"
        >
          <X size={32} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl p-10">
          {/* Metric Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-3xl font-bold text-text-primary flex-1">
                {currentMetric.name}
              </h3>
              <div className="flex items-center gap-3 ml-6">
                <Button
                  variant="secondary"
                  onClick={() => onOpenComment(currentMetric)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageSquare size={20} className="mr-2" />
                  Comentário
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onOpenActionPlan(currentMetric)}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  <Target size={20} className="mr-2" />
                  Plano de Ação
                </Button>
              </div>
            </div>
            <p className="text-lg text-text-secondary mb-4">
              {currentMetric.description}
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="px-4 py-2 bg-primary bg-opacity-10 text-primary rounded-lg font-semibold">
                {currentMetric.area}
              </span>
              <span className="text-text-secondary">
                Meta: <span className="font-bold text-success">{currentMetric.target} {currentMetric.unit}</span>
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[500px]">
            <MetricChart metric={currentMetric} />
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-center p-6 border-t border-gray-700">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={goToPrevious}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <ChevronLeft size={20} className="mr-2" />
            Anterior
          </Button>
          <Button
            variant="secondary"
            onClick={goToNext}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            Próximo
            <ChevronRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
