import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface LigacaoCampanha {
  id: number;
  created_at: string;
  campanha_nome: string | null;
  operador: string | null;
  destino: string | null;
  status: string | null;
  duracao: number | null;
  conversa: number | null;
  data: string | null;
  tabulacao: string | null;
  data_tabulacao: string | null;
  obs_tabulacao: string | null;
  nome: string | null;
  cnpj: string | null;
  cidade: string | null;
  url_gravacao: string | null;
  tag: string | null;
}

export interface LigacaoManual {
  id: number;
  data: string | null;
  operador: string | null;
  destino: string | null;
  status: string | null;
  duracao: number | null;
  conversa: number | null;
  tabulacao: string | null;
  data_tabulacao: string | null;
  url_gravacao: string | null;
}

export interface LigacaoFilters {
  operadores?: string[];
  campanhas?: string[];
  dateStart?: string;
  dateEnd?: string;
}

export const useLigacoes = (filters?: LigacaoFilters) => {
  const [ligacoesCampanha, setLigacoesCampanha] = useState<LigacaoCampanha[]>([]);
  const [ligacoesManuais, setLigacoesManuais] = useState<LigacaoManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState({ campanha: 0, manual: 0 });

  const fetchLigacoes = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasManualFilter = filters?.campanhas?.includes('manual');
      const hasOtherCampaigns = filters?.campanhas?.some(c => c !== 'manual');

      // Limite para evitar queries muito pesadas
      const LIMIT = 50000;

      // Buscar ligações de campanha se não for apenas "manual"
      if (!filters?.campanhas || hasOtherCampaigns) {
        let queryCampanha = supabase
          .from('vm_ligacoes_campanha')
          .select('*', { count: 'exact' })
          .order('data', { ascending: false })
          .limit(LIMIT);

        if (filters?.operadores && filters.operadores.length > 0) {
          queryCampanha = queryCampanha.in('operador', filters.operadores);
        }

        if (filters?.campanhas && hasOtherCampaigns) {
          const campanhasFiltered = filters.campanhas.filter(c => c !== 'manual');
          queryCampanha = queryCampanha.in('campanha_nome', campanhasFiltered);
        }

        if (filters?.dateStart) {
          queryCampanha = queryCampanha.gte('data', filters.dateStart);
        }

        if (filters?.dateEnd) {
          queryCampanha = queryCampanha.lte('data', filters.dateEnd);
        }

        const { data: campanha, error: errorCampanha, count } = await queryCampanha;

        if (errorCampanha) throw errorCampanha;
        setLigacoesCampanha(campanha || []);
        setTotalCount(prev => ({ ...prev, campanha: count || 0 }));
      } else {
        setLigacoesCampanha([]);
        setTotalCount(prev => ({ ...prev, campanha: 0 }));
      }

      // Buscar ligações manuais se filtro incluir "manual" ou sem filtro de campanha
      if (!filters?.campanhas || hasManualFilter) {
        let queryManual = supabase
          .from('vm_ligacoes_manuais')
          .select('*', { count: 'exact' })
          .order('data', { ascending: false })
          .limit(LIMIT);

        if (filters?.operadores && filters.operadores.length > 0) {
          queryManual = queryManual.in('operador', filters.operadores);
        }

        if (filters?.dateStart) {
          queryManual = queryManual.gte('data', filters.dateStart);
        }

        if (filters?.dateEnd) {
          queryManual = queryManual.lte('data', filters.dateEnd);
        }

        const { data: manual, error: errorManual, count } = await queryManual;

        if (errorManual) throw errorManual;
        setLigacoesManuais(manual || []);
        setTotalCount(prev => ({ ...prev, manual: count || 0 }));
      } else {
        setLigacoesManuais([]);
        setTotalCount(prev => ({ ...prev, manual: 0 }));
      }
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao buscar ligações:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    ligacoesCampanha,
    ligacoesManuais,
    loading,
    error,
    totalCount,
    refetch: fetchLigacoes,
  };
};

// Hook para buscar operadores únicos
export const useOperadores = () => {
  const [operadores, setOperadores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperadores();
  }, []);

  const fetchOperadores = async () => {
    try {
      setLoading(true);

      // Buscar operadores de campanhas
      const { data: campanhaOps } = await supabase
        .from('vm_ligacoes_campanha')
        .select('operador')
        .not('operador', 'is', null);

      // Buscar operadores manuais
      const { data: manualOps } = await supabase
        .from('vm_ligacoes_manuais')
        .select('operador')
        .not('operador', 'is', null);

      // Combinar e remover duplicatas
      const allOps = [
        ...(campanhaOps?.map(o => o.operador) || []),
        ...(manualOps?.map(o => o.operador) || []),
      ];
      const uniqueOps = [...new Set(allOps)].sort();

      setOperadores(uniqueOps);
    } catch (err) {
      console.error('Erro ao buscar operadores:', err);
    } finally {
      setLoading(false);
    }
  };

  return { operadores, loading };
};

// Hook para buscar campanhas únicas
export const useCampanhas = () => {
  const [campanhas, setCampanhas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampanhas();
  }, []);

  const fetchCampanhas = async () => {
    try {
      setLoading(true);

      const { data } = await supabase
        .from('vm_ligacoes_campanha')
        .select('campanha_nome')
        .not('campanha_nome', 'is', null);

      const uniqueCampanhas = [...new Set(data?.map(c => c.campanha_nome) || [])].sort();

      setCampanhas(uniqueCampanhas);
    } catch (err) {
      console.error('Erro ao buscar campanhas:', err);
    } finally {
      setLoading(false);
    }
  };

  return { campanhas, loading };
};
