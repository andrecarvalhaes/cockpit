import React, { useState, useEffect } from 'react';
import { MultiSelect } from '../shared/MultiSelect';
import { DateRangePicker } from '../shared/DateRangePicker';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface MarketingFiltersState {
  dateStart: string;
  dateEnd: string;
  compareWithPrevious: boolean;
  compareWithGoal: boolean;
  channels: string[];
  origins: string[];
}

interface MarketingFiltersProps {
  filters: MarketingFiltersState;
  onFiltersChange: (filters: MarketingFiltersState) => void;
  onApplyFilters: () => void;
}

export const MarketingFilters: React.FC<MarketingFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
}) => {
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Buscar canais e origens disponíveis
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);

        // Buscar canais únicos (utm_source de BD_Conversoes_RD + ld_ko_source de BD_RDOportunidades)
        const [channelsRD, channelsMQL] = await Promise.all([
          supabase
            .from('BD_Conversoes_RD')
            .select('utm_source')
            .not('utm_source', 'is', null),
          supabase
            .from('BD_RDOportunidades')
            .select('ld_ko_source')
            .not('ld_ko_source', 'is', null)
        ]);

        const channelsSet = new Set<string>();
        channelsRD.data?.forEach(item => item.utm_source && channelsSet.add(item.utm_source));
        channelsMQL.data?.forEach(item => item.ld_ko_source && channelsSet.add(item.ld_ko_source));
        setAvailableChannels(Array.from(channelsSet).sort());

        // Buscar origens únicas (sub_origem de BD_Conversoes_RD + ld_ko_sub_origem de BD_RDOportunidades)
        const [originsRD, originsMQL] = await Promise.all([
          supabase
            .from('BD_Conversoes_RD')
            .select('sub_origem')
            .not('sub_origem', 'is', null),
          supabase
            .from('BD_RDOportunidades')
            .select('ld_ko_sub_origem')
            .not('ld_ko_sub_origem', 'is', null)
        ]);

        const originsSet = new Set<string>();
        originsRD.data?.forEach(item => item.sub_origem && originsSet.add(item.sub_origem));
        originsMQL.data?.forEach(item => item.ld_ko_sub_origem && originsSet.add(item.ld_ko_sub_origem));
        setAvailableOrigins(Array.from(originsSet).sort());
      } catch (error) {
        console.error('Erro ao buscar opções de filtro:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleDateChange = (range: { startDate: string; endDate: string }) => {
    onFiltersChange({
      ...filters,
      dateStart: range.startDate,
      dateEnd: range.endDate,
    });
  };

  const handleComparisonChange = (mode: 'none' | 'previous' | 'goal') => {
    onFiltersChange({
      ...filters,
      compareWithPrevious: mode === 'previous',
      compareWithGoal: mode === 'goal',
    });
  };

  const handleChannelChange = (value: string[]) => {
    onFiltersChange({
      ...filters,
      channels: value,
    });
  };

  const handleOriginChange = (value: string[]) => {
    onFiltersChange({
      ...filters,
      origins: value,
    });
  };

  const toggleAllChannels = () => {
    if (filters.channels.length === availableChannels.length) {
      // Se todos estão selecionados, desmarcar todos
      handleChannelChange([]);
    } else {
      // Caso contrário, selecionar todos
      handleChannelChange(availableChannels);
    }
  };

  const toggleAllOrigins = () => {
    if (filters.origins.length === availableOrigins.length) {
      // Se todos estão selecionados, desmarcar todos
      handleOriginChange([]);
    } else {
      // Caso contrário, selecionar todos
      handleOriginChange(availableOrigins);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Período - DateRangePicker */}
        <DateRangePicker
          label="Período"
          startDate={filters.dateStart}
          endDate={filters.dateEnd}
          onDateChange={handleDateChange}
        />

        {/* Canal - MultiSelect */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">Canal</label>
            <button
              onClick={toggleAllChannels}
              className="text-xs text-primary hover:text-primary-dark font-medium"
              type="button"
            >
              {filters.channels.length === availableChannels.length ? 'Limpar todos' : 'Selecionar todos'}
            </button>
          </div>
          <MultiSelect
            value={filters.channels}
            onChange={handleChannelChange}
            options={availableChannels.map(channel => ({ value: channel, label: channel }))}
            placeholder="Todos os canais"
          />
        </div>

        {/* Origem - MultiSelect */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">Origem</label>
            <button
              onClick={toggleAllOrigins}
              className="text-xs text-primary hover:text-primary-dark font-medium"
              type="button"
            >
              {filters.origins.length === availableOrigins.length ? 'Limpar todos' : 'Selecionar todos'}
            </button>
          </div>
          <MultiSelect
            value={filters.origins}
            onChange={handleOriginChange}
            options={availableOrigins.map(origin => ({ value: origin, label: origin }))}
            placeholder="Todas as origens"
          />
        </div>

        {/* Opções de Comparação */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-primary">
            Opções
          </label>
          <div className="flex flex-col gap-2 px-4 py-3 bg-white border border-border rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="comparison"
                checked={!filters.compareWithPrevious && !filters.compareWithGoal}
                onChange={() => handleComparisonChange('none')}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Sem comparação</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="comparison"
                checked={filters.compareWithPrevious}
                onChange={() => handleComparisonChange('previous')}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Comparar com período anterior</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="comparison"
                checked={filters.compareWithGoal}
                onChange={() => handleComparisonChange('goal')}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Comparar com a meta</span>
            </label>
          </div>
        </div>
      </div>

      {/* Botão Filtrar */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onApplyFilters}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          <Search size={18} />
          Filtrar
        </button>
      </div>
    </div>
  );
};
