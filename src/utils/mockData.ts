import { Metric, MetricValue } from '../types/metric';
import { ActionPlan } from '../types/actionPlan';
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

export const mockActionPlans: ActionPlan[] = [];
