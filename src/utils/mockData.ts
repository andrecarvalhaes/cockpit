import { Metric, MetricValue } from '../types/metric';
import { ActionPlan } from '../types/actionPlan';
import { RootCauseAnalysis } from '../types/rootCauseAnalysis';
import { subDays, subMonths } from 'date-fns';

const generateValues = (metricId: string, count: number, baseValue: number, variance: number): MetricValue[] => {
  const values: MetricValue[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const randomVariance = (Math.random() - 0.5) * variance;
    values.push({
      id: `value-${metricId}-${i}`,
      metricId,
      value: Math.max(0, baseValue + randomVariance),
      date: subDays(new Date(), i * 2),
    });
  }
  return values;
};

export const mockMetrics: Metric[] = [
  {
    id: '1',
    name: 'Engajamento Instagram',
    description: 'Taxa de engajamento total no Instagram (likes, comentários, compartilhamentos)',
    teamId: '2', // Marketing
    teamName: 'Marketing',
    area: 'Redes Sociais',
    unit: '%',
    target: 5.5,
    monthlyTargets: [
      { month: '2026-01', target: 5.0 },
      { month: '2026-02', target: 5.5 },
      { month: '2026-03', target: 6.0 },
    ],
    values: generateValues('1', 30, 4.8, 1.5),
    createdAt: subMonths(new Date(), 3),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Conversão Site',
    description: 'Taxa de conversão de visitantes em leads no site',
    teamId: '2', // Marketing
    teamName: 'Marketing',
    area: 'Site',
    unit: '%',
    target: 3.0,
    monthlyTargets: [],
    values: generateValues('2', 30, 2.1, 0.8),
    createdAt: subMonths(new Date(), 3),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Vendas Mensais',
    description: 'Total de vendas realizadas no mês',
    teamId: '1', // Comercial
    teamName: 'Comercial',
    area: 'Comercial',
    unit: 'unidades',
    target: 100,
    monthlyTargets: [
      { month: '2026-01', target: 90 },
      { month: '2026-02', target: 100 },
      { month: '2026-03', target: 110 },
      { month: '2026-04', target: 120 },
    ],
    values: generateValues('3', 30, 85, 20),
    createdAt: subMonths(new Date(), 6),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Ticket Médio',
    description: 'Valor médio das vendas realizadas',
    teamId: '1', // Comercial
    teamName: 'Comercial',
    area: 'Comercial',
    unit: 'R$',
    target: 1500,
    monthlyTargets: [],
    values: generateValues('4', 30, 1350, 300),
    createdAt: subMonths(new Date(), 6),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Leads Hunter',
    description: 'Novos leads gerados pela equipe Hunter',
    teamId: '1', // Comercial
    teamName: 'Comercial',
    area: 'Hunter',
    unit: 'unidades',
    target: 50,
    monthlyTargets: [],
    values: generateValues('5', 30, 42, 15),
    createdAt: subMonths(new Date(), 2),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Contratos Ativos',
    description: 'Total de contratos ativos vigentes',
    teamId: '1', // Comercial
    teamName: 'Comercial',
    area: 'Contratos',
    unit: 'unidades',
    target: 200,
    monthlyTargets: [],
    values: generateValues('6', 30, 187, 10),
    createdAt: subMonths(new Date(), 12),
    updatedAt: new Date(),
  },
  {
    id: '7',
    name: 'ROI Marketing',
    description: 'Retorno sobre investimento em campanhas de marketing',
    teamId: '2', // Marketing
    teamName: 'Marketing',
    area: 'Marketing',
    unit: '%',
    target: 250,
    monthlyTargets: [
      { month: '2026-01', target: 220 },
      { month: '2026-02', target: 240 },
      { month: '2026-03', target: 260 },
    ],
    values: generateValues('7', 30, 220, 50),
    createdAt: subMonths(new Date(), 4),
    updatedAt: new Date(),
  },
  {
    id: '8',
    name: 'Taxa de Churn',
    description: 'Percentual de clientes que cancelaram contratos',
    teamId: '3', // Operações
    teamName: 'Operações',
    area: 'Contratos',
    unit: '%',
    target: 2.0,
    monthlyTargets: [],
    values: generateValues('8', 30, 3.2, 1.0),
    createdAt: subMonths(new Date(), 6),
    updatedAt: new Date(),
  },
];

export const mockActionPlans: ActionPlan[] = [
  {
    id: '1',
    title: 'Recuperar Taxa de Conversão do Site',
    description: 'Implementar melhorias no site para aumentar a taxa de conversão de visitantes em leads. Focar em otimização de formulários, implementação de chat ao vivo e criação de landing pages específicas para cada campanha.',
    metricId: '2',
    metricName: 'Conversão Site',
    responsible: 'Equipe de Marketing Digital',
    expectedResult: 'Aumentar a taxa de conversão de 2.1% para 3.0% em 2 meses, resultando em aproximadamente 45% mais leads qualificados mensalmente.',
    completed: false,
    comments: [
      {
        id: 'c1',
        content: 'Já implementamos o chat ao vivo e vimos um aumento de 0.3% na conversão.',
        createdAt: new Date(2026, 0, 12),
      },
    ],
    createdAt: new Date(2026, 0, 5),
    updatedAt: new Date(2026, 0, 12),
  },
  {
    id: '2',
    title: 'Reduzir Taxa de Churn',
    description: 'Implementar programa de retenção de clientes com foco em melhorar o atendimento e criar incentivos para permanência. Inclui pesquisa de satisfação e treinamento da equipe de suporte.',
    metricId: '8',
    metricName: 'Taxa de Churn',
    responsible: 'Customer Success',
    expectedResult: 'Reduzir a taxa de churn de 3.2% para 2.0% ou menos, mantendo mais de 97% dos clientes mensalmente.',
    completed: false,
    comments: [],
    createdAt: new Date(2026, 0, 8),
    updatedAt: new Date(2026, 0, 13),
  },
  {
    id: '3',
    title: 'Aumentar Geração de Leads Hunter',
    description: 'Expandir estratégias de prospecção ativa com revisão do ICP, implementação de novas ferramentas e treinamento da equipe em técnicas modernas de cold call.',
    metricId: '5',
    metricName: 'Leads Hunter',
    responsible: 'Equipe Hunter',
    expectedResult: 'Atingir meta de 50 leads mensais, representando um aumento de aproximadamente 20% na geração atual.',
    completed: false,
    comments: [],
    createdAt: new Date(2026, 0, 10),
    updatedAt: new Date(2026, 0, 10),
  },
];

export const mockRootCauseAnalyses: RootCauseAnalysis[] = [
  {
    id: 'rca1',
    metricId: '2',
    metricName: 'Conversão Site',
    problem: 'Por que a taxa de conversão do site está abaixo da meta de 3%?',
    type: '5whys',
    fiveWhys: [
      {
        level: 1,
        question: 'Por quê?',
        answer: 'Porque muitos visitantes abandonam o processo de preenchimento do formulário',
      },
      {
        level: 2,
        question: 'Por quê?',
        answer: 'Porque o formulário solicita muitas informações de uma vez',
      },
      {
        level: 3,
        question: 'Por quê?',
        answer: 'Porque queremos coletar o máximo de dados possível para qualificação',
      },
      {
        level: 4,
        question: 'Por quê?',
        answer: 'Porque a equipe de vendas precisa dessas informações para fazer contato',
      },
      {
        level: 5,
        question: 'Por quê?',
        answer: 'Porque não implementamos um processo de qualificação progressiva que colete informações em etapas',
      },
    ],
    rootCause: 'Falta de processo de qualificação progressiva que colete informações em etapas',
    author: 'Sistema',
    status: 'Concluída',
    linkedActionPlanIds: ['1'],
    createdAt: new Date(2026, 0, 3),
    updatedAt: new Date(2026, 0, 5),
  },
  {
    id: 'rca2',
    metricId: '8',
    metricName: 'Taxa de Churn',
    problem: 'Por que a taxa de churn está acima da meta de 2%?',
    type: 'ishikawa',
    ishikawaCauses: [
      {
        id: 'ic1',
        category: 'Método',
        cause: 'Processo de onboarding muito rápido e superficial',
        isRootCause: false,
      },
      {
        id: 'ic2',
        category: 'Método',
        cause: 'Falta de acompanhamento regular pós-venda',
        isRootCause: true,
      },
      {
        id: 'ic3',
        category: 'Mão de obra',
        cause: 'Equipe de suporte com alta rotatividade',
        isRootCause: false,
      },
      {
        id: 'ic4',
        category: 'Mão de obra',
        cause: 'Falta de treinamento especializado em retenção',
        isRootCause: false,
      },
      {
        id: 'ic5',
        category: 'Medição',
        cause: 'Não rastreamos sinais de insatisfação precocemente',
        isRootCause: false,
      },
      {
        id: 'ic6',
        category: 'Material',
        cause: 'Documentação técnica desatualizada',
        isRootCause: false,
      },
    ],
    rootCause: 'Falta de acompanhamento regular pós-venda',
    author: 'Sistema',
    status: 'Em Andamento',
    linkedActionPlanIds: ['2'],
    createdAt: new Date(2026, 0, 7),
    updatedAt: new Date(2026, 0, 8),
  },
];
