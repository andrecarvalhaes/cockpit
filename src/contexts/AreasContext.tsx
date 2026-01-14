import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type MetricArea = string;

interface AreasContextType {
  areas: MetricArea[];
  addArea: (area: string) => void;
  removeArea: (area: string) => void;
  refreshAreas: () => Promise<void>;
}

export const AreasContext = createContext<AreasContextType | undefined>(undefined);

export const AreasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [areas, setAreas] = useState<MetricArea[]>([]);

  const refreshAreas = async () => {
    try {
      // Busca áreas únicas das métricas
      const { data, error } = await supabase
        .from('me_metrics')
        .select('area');

      if (error) throw error;

      if (data) {
        const uniqueAreas = [...new Set(data.map(item => item.area))].sort();
        setAreas(uniqueAreas);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  useEffect(() => {
    refreshAreas();
  }, []);

  const addArea = (area: string) => {
    const trimmedArea = area.trim();
    if (trimmedArea && !areas.includes(trimmedArea)) {
      setAreas((prev) => [...prev, trimmedArea].sort());
    }
  };

  const removeArea = (area: string) => {
    setAreas((prev) => prev.filter((a) => a !== area));
  };

  return (
    <AreasContext.Provider value={{ areas, addArea, removeArea, refreshAreas }}>
      {children}
    </AreasContext.Provider>
  );
};
