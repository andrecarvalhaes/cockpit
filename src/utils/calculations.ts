import { MetricValue, Metric } from '../types/metric';
import { startOfDay, endOfDay, subDays, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, format } from 'date-fns';

export const calculateVariation = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const getLatestValue = (values: MetricValue[]): MetricValue | null => {
  if (values.length === 0) return null;
  return values.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
};

export const getPreviousValue = (values: MetricValue[]): MetricValue | null => {
  if (values.length < 2) return null;
  const sorted = values.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sorted[1];
};

export const filterValuesByPeriod = (
  values: MetricValue[],
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom',
  customStart?: Date,
  customEnd?: Date
): MetricValue[] => {
  const now = new Date();
  let start: Date;
  let end: Date = endOfDay(now);

  switch (period) {
    case 'today':
      start = startOfDay(now);
      break;
    case 'week':
      start = subDays(now, 7);
      break;
    case 'month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'quarter':
      start = startOfQuarter(now);
      end = endOfQuarter(now);
      break;
    case 'year':
      start = startOfYear(now);
      end = endOfYear(now);
      break;
    case 'custom':
      if (!customStart || !customEnd) return values;
      start = customStart;
      end = customEnd;
      break;
    default:
      return values;
  }

  return values.filter((value) => {
    const date = new Date(value.date);
    return date >= start && date <= end;
  });
};

export const calculateTrend = (values: MetricValue[]): 'up' | 'down' | 'stable' => {
  if (values.length < 2) return 'stable';

  const sorted = values.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recent = sorted.slice(-5); // Last 5 values

  let increases = 0;
  let decreases = 0;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i].value > recent[i - 1].value) increases++;
    if (recent[i].value < recent[i - 1].value) decreases++;
  }

  if (increases > decreases) return 'up';
  if (decreases > increases) return 'down';
  return 'stable';
};

export const getTargetForDate = (metric: Metric, date: Date): number => {
  const monthKey = format(date, 'yyyy-MM');
  const monthlyTarget = metric.monthlyTargets?.find((mt) => mt.month === monthKey);
  return monthlyTarget ? monthlyTarget.target : metric.target;
};
