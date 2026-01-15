import React, { useState, useEffect, useRef } from 'react';
import {
  format,
  endOfToday,
  endOfYesterday,
  endOfWeek,
  endOfMonth,
  endOfQuarter,
  addMonths,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  isWithinInterval,
  isValid,
  subMonths,
  subWeeks,
  subQuarters,
  startOfToday,
  startOfYesterday,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  endOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (range: { startDate: string; endDate: string }) => void;
  label?: string;
}

const presets = [
  { label: 'Hoje', getRange: () => ({ startDate: startOfToday(), endDate: endOfToday() }) },
  { label: 'Ontem', getRange: () => ({ startDate: startOfYesterday(), endDate: endOfYesterday() }) },
  { label: 'Esta semana', getRange: () => ({ startDate: startOfWeek(new Date(), { locale: ptBR }), endDate: endOfToday() }) },
  { label: 'Este mês', getRange: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }) },
  { label: 'Este trimestre', getRange: () => ({ startDate: startOfQuarter(new Date()), endDate: endOfQuarter(new Date()) }) },
  { label: 'Última semana', getRange: () => ({ startDate: startOfWeek(subWeeks(new Date(), 1), { locale: ptBR }), endDate: endOfWeek(subWeeks(new Date(), 1), { locale: ptBR }) }) },
  { label: 'Último mês', getRange: () => ({ startDate: startOfMonth(subMonths(new Date(), 1)), endDate: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: 'Último trimestre', getRange: () => ({ startDate: startOfQuarter(subQuarters(new Date(), 1)), endDate: endOfQuarter(subQuarters(new Date(), 1)) }) }
];

interface CalendarProps {
  month: Date;
  range: { start: Date | null; end: Date | null };
  onDayClick: (day: Date) => void;
}

const CalendarComponent: React.FC<CalendarProps> = ({ month, range, onDayClick }) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="date-range-calendar">
      <div className="date-range-calendar-grid">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <div key={i} className="date-range-weekday">{d}</div>
        ))}
        {days.map(day => {
          const isOtherMonth = day.getMonth() !== month.getMonth();
          const isSelectedStart = range.start && isSameDay(day, range.start);
          const isSelectedEnd = range.end && isSameDay(day, range.end);
          const isInRange = range.start && range.end && isWithinInterval(day, { start: range.start, end: range.end });
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toString()}
              type="button"
              className={`date-range-day ${isOtherMonth ? 'other-month' : ''} ${isSelectedStart ? 'selected-start' : ''} ${isSelectedEnd ? 'selected-end' : ''} ${isInRange ? 'in-range' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => onDayClick(day)}
              disabled={isOtherMonth}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      if (isValid(start) && isValid(end)) {
        setRange({ start, end });
        setCurrentMonth(end);
      }
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const handleApply = () => {
    if (range.start && range.end) {
      onDateChange({
        startDate: format(range.start, 'yyyy-MM-dd'),
        endDate: format(range.end, 'yyyy-MM-dd')
      });
    }
    setIsOpen(false);
  };

  const handlePresetClick = (preset: typeof presets[0]) => {
    const { startDate, endDate } = preset.getRange();
    setRange({ start: startDate, end: endDate });
  };

  const handleDayClick = (day: Date) => {
    if (!range.start || (range.start && range.end)) {
      setRange({ start: day, end: null });
    } else {
      if (isAfter(day, range.start)) {
        setRange({ ...range, end: endOfDay(day) });
      } else {
        setRange({ start: day, end: range.start });
      }
    }
  };

  const formattedRange = () => {
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      if (isValid(start) && isValid(end)) {
        return `${format(start, 'dd MMM yyyy', { locale: ptBR })} - ${format(end, 'dd MMM yyyy', { locale: ptBR })}`;
      }
    }
    return 'Selecione um período';
  };

  return (
    <div className="flex flex-col gap-1" ref={pickerRef}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="date-range-picker-container">
        <button
          type="button"
          className="date-range-picker-input"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm">{formattedRange()}</span>
          <Calendar size={18} className="text-text-secondary" />
        </button>
        {isOpen && (
          <div className="date-range-picker-popover">
            <div className="date-range-layout">
              <div className="date-range-presets">
                <ul className="date-range-presets-list">
                  {presets.map(p => (
                    <li key={p.label}>
                      <button type="button" onClick={() => handlePresetClick(p)}>
                        {p.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="date-range-calendar-section">
                <div className="date-range-calendar-header">
                  <button type="button" onClick={handlePrevMonth} aria-label="Mês anterior">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex-1 flex justify-around">
                    <span className="text-sm font-semibold capitalize">
                      {format(subMonths(currentMonth, 1), 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <span className="text-sm font-semibold capitalize">
                      {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  <button type="button" onClick={handleNextMonth} aria-label="Próximo mês">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="date-range-calendars">
                  <CalendarComponent month={subMonths(currentMonth, 1)} range={range} onDayClick={handleDayClick} />
                  <CalendarComponent month={currentMonth} range={range} onDayClick={handleDayClick} />
                </div>
                <div className="date-range-actions">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-text-primary bg-white border border-border rounded-lg hover:bg-bg-submenu transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleApply}
                    disabled={!range.start || !range.end}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
