import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (date: Date): string => {
  return format(date, "MM/yyyy", { locale: ptBR });
};

export const formatDateFull = (date: Date): string => {
  return format(date, "dd/MM/yyyy", { locale: ptBR });
};

export const formatDateTime = (date: Date): string => {
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export const formatMonthYear = (date: Date): string => {
  return format(date, "MMM/yyyy", { locale: ptBR });
};

export const formatMetricValue = (value: number, unit: string): string => {
  if (unit === 'R$') return formatCurrency(value);
  if (unit === '%') return formatPercent(value);
  if (unit === 'unidades') return formatNumber(value);
  return `${formatNumber(value)} ${unit}`;
};
