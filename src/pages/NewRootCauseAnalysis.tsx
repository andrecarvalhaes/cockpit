import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/shared/Button';
import { Select } from '../components/shared/Select';
import { Input } from '../components/shared/Input';
import { AnalysisTypeSelector } from '../components/root-cause/AnalysisTypeSelector';
import { FiveWhysAnalysis } from '../components/root-cause/FiveWhysAnalysis';
import { IshikawaForm } from '../components/root-cause/IshikawaForm';
import { useRootCause } from '../hooks/useRootCause';
import { useMetrics } from '../hooks/useMetrics';
import {
  AnalysisType,
  FiveWhysLevel,
  IshikawaCause,
} from '../types/rootCauseAnalysis';

type Step = 1 | 2 | 3 | 4;

export const NewRootCauseAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addAnalysis } = useRootCause();
  const { metrics, getMetricById } = useMetrics();

  const prefilledMetricId = searchParams.get('metricId') || '';

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedMetricId, setSelectedMetricId] = useState(prefilledMetricId);
  const [problem, setProblem] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('5whys');
  const [fiveWhys, setFiveWhys] = useState<FiveWhysLevel[]>([]);
  const [rootCause, setRootCause] = useState('');
  const [ishikawaCauses, setIshikawaCauses] = useState<IshikawaCause[]>([]);

  useEffect(() => {
    if (prefilledMetricId) {
      const metric = getMetricById(prefilledMetricId);
      if (metric) {
        setProblem(`Por que ${metric.name} está abaixo da meta?`);
      }
    }
  }, [prefilledMetricId, getMetricById]);

  const metricOptions = [
    { value: '', label: 'Selecione uma métrica' },
    ...metrics.map((m) => ({ value: m.id, label: m.name })),
  ];

  const canProceedStep1 = selectedMetricId && problem.trim();
  const canProceedStep2 = analysisType;
  const canProceedStep3 =
    (analysisType === '5whys' && fiveWhys.length > 0) ||
    (analysisType === 'ishikawa' && ishikawaCauses.length > 0);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSaveFiveWhys = (levels: FiveWhysLevel[], root: string) => {
    setFiveWhys(levels);
    setRootCause(root);
    handleNext();
  };

  const handleSaveIshikawa = (causes: IshikawaCause[]) => {
    setIshikawaCauses(causes);
    const rootCauseFound = causes.find((c) => c.isRootCause);
    if (rootCauseFound) {
      setRootCause(rootCauseFound.cause);
    }
    handleNext();
  };

  const handleFinish = () => {
    const metric = getMetricById(selectedMetricId);

    const newAnalysis = addAnalysis({
      metricId: selectedMetricId,
      metricName: metric?.name || '',
      problem,
      type: analysisType,
      fiveWhys: analysisType === '5whys' ? fiveWhys : undefined,
      rootCause: rootCause || undefined,
      ishikawaCauses: analysisType === 'ishikawa' ? ishikawaCauses : undefined,
    });

    navigate(`/root-cause-analyses/${newAnalysis.id}`);
  };

  const steps = [
    { number: 1, label: 'Problema', description: 'Defina o problema' },
    { number: 2, label: 'Tipo', description: 'Escolha a metodologia' },
    { number: 3, label: 'Análise', description: 'Realize a análise' },
    { number: 4, label: 'Revisão', description: 'Confirme os dados' },
  ];

  return (
    <div>
      <Header
        title={
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/root-cause-analyses')}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <span>Nova Análise de Causa Raiz</span>
          </div>
        }
        subtitle={`Passo ${currentStep} de 4`}
      />

      <div className="p-10 max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      currentStep >= step.number
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-text-secondary'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <p className="text-xs font-semibold text-text-primary mt-2">
                    {step.label}
                  </p>
                  <p className="text-xs text-text-secondary">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white border border-border rounded-lg p-8">
          {/* Step 1: Problema */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
                  Defina o Problema
                </h2>
                <p className="text-text-secondary">
                  Selecione a métrica e descreva claramente o problema que será
                  investigado
                </p>
              </div>

              <Select
                label="Métrica Relacionada"
                options={metricOptions}
                value={selectedMetricId}
                onChange={(e) => {
                  setSelectedMetricId(e.target.value);
                  const metric = getMetricById(e.target.value);
                  if (metric && !problem) {
                    setProblem(`Por que ${metric.name} está abaixo da meta?`);
                  }
                }}
              />

              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Descrição do Problema
                </label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Descreva o problema que será investigado..."
                  className="w-full min-h-[120px] px-4 py-2 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Tipo */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
                  Escolha a Metodologia
                </h2>
                <p className="text-text-secondary">
                  Selecione o tipo de análise mais adequado para o problema
                </p>
              </div>

              <AnalysisTypeSelector
                value={analysisType}
                onChange={setAnalysisType}
              />
            </div>
          )}

          {/* Step 3: Análise */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
                  Realize a Análise
                </h2>
                <p className="text-text-secondary">
                  {analysisType === '5whys'
                    ? 'Responda os 5 porquês para chegar à causa raiz'
                    : 'Adicione causas nas 6 categorias do diagrama de Ishikawa'}
                </p>
              </div>

              {analysisType === '5whys' ? (
                <FiveWhysAnalysis
                  problem={problem}
                  initialData={fiveWhys}
                  onSave={handleSaveFiveWhys}
                />
              ) : (
                <IshikawaForm
                  initialCauses={ishikawaCauses}
                  onSave={handleSaveIshikawa}
                />
              )}
            </div>
          )}

          {/* Step 4: Revisão */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
                  Revise sua Análise
                </h2>
                <p className="text-text-secondary">
                  Confirme as informações antes de salvar a análise
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-bg-secondary rounded-lg p-4">
                  <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                    Métrica
                  </p>
                  <p className="text-text-primary font-medium">
                    {getMetricById(selectedMetricId)?.name}
                  </p>
                </div>

                <div className="bg-bg-secondary rounded-lg p-4">
                  <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                    Problema
                  </p>
                  <p className="text-text-primary">{problem}</p>
                </div>

                <div className="bg-bg-secondary rounded-lg p-4">
                  <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                    Tipo de Análise
                  </p>
                  <p className="text-text-primary font-medium">
                    {analysisType === '5whys' ? '5 Porquês' : 'Diagrama de Ishikawa'}
                  </p>
                </div>

                {rootCause && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-error uppercase mb-2">
                      Causa Raiz Identificada
                    </p>
                    <p className="text-text-primary">{rootCause}</p>
                  </div>
                )}

                {analysisType === '5whys' && (
                  <div className="bg-bg-secondary rounded-lg p-4">
                    <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                      Níveis Analisados
                    </p>
                    <p className="text-text-primary font-medium">
                      {fiveWhys.length} nível(is) de investigação
                    </p>
                  </div>
                )}

                {analysisType === 'ishikawa' && (
                  <div className="bg-bg-secondary rounded-lg p-4">
                    <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                      Causas Identificadas
                    </p>
                    <p className="text-text-primary font-medium">
                      {ishikawaCauses.length} causa(s) em{' '}
                      {new Set(ishikawaCauses.map((c) => c.category)).size}{' '}
                      categoria(s)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>

          {currentStep < 3 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !canProceedStep2)
              }
            >
              Próximo
              <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : currentStep === 3 ? (
            <p className="text-sm text-text-secondary">
              Clique em "Salvar Análise" acima para continuar
            </p>
          ) : (
            <Button
              variant="success"
              onClick={handleFinish}
              disabled={!canProceedStep3}
            >
              <CheckCircle2 size={16} className="mr-2" />
              Finalizar Análise
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
