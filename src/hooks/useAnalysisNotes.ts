import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AnalysisNote, AnalysisSummary, AISummaryResponse } from '../types/analysisNote';
import { summarizeAnalysisNotes } from '../services/aiService';

interface UseAnalysisNotesParams {
  area: string;
  teamId?: string;
}

export function useAnalysisNotes({ area, teamId }: UseAnalysisNotesParams) {
  const [notes, setNotes] = useState<AnalysisNote[]>([]);
  const [summaries, setSummaries] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar notas do banco de dados
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('me_metric_analysis_notes')
        .select('*')
        .eq('area', area)
        .order('created_at', { ascending: false });

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedNotes: AnalysisNote[] = (data || []).map((item) => ({
        id: item.id,
        area: item.area,
        teamId: item.team_id,
        note: item.note,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      setNotes(formattedNotes);
    } catch (err) {
      console.error('Erro ao buscar notas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar notas');
    } finally {
      setLoading(false);
    }
  }, [area, teamId]);

  // Buscar resumos do banco de dados
  const fetchSummaries = useCallback(async () => {
    try {
      let query = supabase
        .from('me_metric_analysis_summaries')
        .select('*')
        .eq('area', area)
        .order('created_at', { ascending: false })
        .limit(5);

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedSummaries: AnalysisSummary[] = (data || []).map((item) => ({
        id: item.id,
        area: item.area,
        teamId: item.team_id,
        summary: item.summary,
        suggestedActions: item.suggested_actions || [],
        notesUsedCount: item.notes_used_count,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
      }));

      setSummaries(formattedSummaries);
    } catch (err) {
      console.error('Erro ao buscar resumos:', err);
    }
  }, [area, teamId]);

  useEffect(() => {
    fetchNotes();
    fetchSummaries();
  }, [fetchNotes, fetchSummaries]);

  // Adicionar nova nota
  const addNote = async (note: string): Promise<void> => {
    try {
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from('me_metric_analysis_notes')
        .insert({
          area,
          team_id: teamId || null,
          note,
          created_by: user?.id,
        });

      if (insertError) throw insertError;

      await fetchNotes();
    } catch (err) {
      console.error('Erro ao adicionar nota:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar nota';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Deletar nota
  const deleteNote = async (noteId: string): Promise<void> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('me_metric_analysis_notes')
        .delete()
        .eq('id', noteId);

      if (deleteError) throw deleteError;

      await fetchNotes();
    } catch (err) {
      console.error('Erro ao deletar nota:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar nota';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Gerar resumo com IA
  const generateSummary = async (): Promise<AISummaryResponse> => {
    if (notes.length === 0) {
      throw new Error('Adicione pelo menos uma nota antes de gerar o resumo');
    }

    try {
      setGenerating(true);
      setError(null);

      const noteTexts = notes.map((n) => n.note);
      const aiResponse = await summarizeAnalysisNotes(noteTexts, area);

      // Salvar resumo no banco de dados
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from('me_metric_analysis_summaries')
        .insert({
          area,
          team_id: teamId || null,
          summary: aiResponse.summary,
          suggested_actions: aiResponse.suggestedActions,
          notes_used_count: notes.length,
          created_by: user?.id,
        });

      if (insertError) throw insertError;

      await fetchSummaries();

      return aiResponse;
    } catch (err) {
      console.error('Erro ao gerar resumo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar resumo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return {
    notes,
    summaries,
    loading,
    generating,
    error,
    addNote,
    deleteNote,
    generateSummary,
    refreshNotes: fetchNotes,
    refreshSummaries: fetchSummaries,
  };
}
