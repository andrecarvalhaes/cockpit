export type MetricArea =
  | 'Marketing'
  | 'Comercial'
  | 'Hunter'
  | 'Contratos'
  | 'Redes Sociais'
  | 'Site';

export interface MonthlyTarget {
  month: string; // formato "YYYY-MM" ex: "2026-01"
  target: number;
}

export interface MetricValue {
  id: string;
  metricId: string;
  value: number;
  date: Date;
  note?: string;
}

export interface Metric {
  id: string;
  name: string;
  description: string;
  teamId: string;
  teamName?: string;
  area: MetricArea;
  unit: string; // '%', 'R$', 'unidades', etc.
  target: number;
  monthlyTargets: MonthlyTarget[];
  values: MetricValue[];
  displayOrder: number;
  dataSourceLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricFormData {
  name: string;
  description: string;
  teamId: string;
  area: MetricArea;
  unit: string;
  target: number;
  monthlyTargets?: MonthlyTarget[];
  displayOrder?: number;
  dataSourceLink?: string;
}

export interface MetricValueFormData {
  value: number;
  date: Date;
  note?: string;
}
