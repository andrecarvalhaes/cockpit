import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const getSelectedLabels = () => {
    return value
      .map(v => options.find(o => o.value === v)?.label)
      .filter(Boolean);
  };

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-[42px] px-4 rounded-lg border border-border bg-white text-text-primary focus-ring transition-all duration-200 flex items-center justify-between gap-2"
        >
          <div className="flex-1 text-left truncate">
            {value.length === 0 ? (
              <span className="text-text-secondary text-sm">{placeholder}</span>
            ) : (
              <span className="text-sm font-medium text-text-primary">
                {value.length} {value.length === 1 ? 'selecionado' : 'selecionados'}
              </span>
            )}
          </div>
          <ChevronDown
            size={16}
            className={`flex-shrink-0 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={`w-full px-4 py-2 text-left hover:bg-bg-submenu transition-colors flex items-center gap-2 ${
                  value.includes(option.value) ? 'bg-primary bg-opacity-5' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => {}}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
