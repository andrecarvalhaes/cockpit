import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { WarRoomTranscript, WarRoomFormData, WarRoomAnalysisResponse } from '../types/warRoom';
import { analyzeWarRoomTranscript } from '../services/aiService';

interface UseWarRoomParams {
  area: string;
  teamId?: string;
}

export function useWarRoom({ area, teamId }: UseWarRoomParams) {
  const [transcripts, setTranscripts] = useState<WarRoomTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar transcrições do banco de dados
  const fetchTranscripts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('me_war_room_transcripts')
        .select('*')
        .eq('area', area)
        .order('meeting_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedTranscripts: WarRoomTranscript[] = (data || []).map((item) => ({
        id: item.id,
        area: item.area,
        teamId: item.team_id,
        title: item.title,
        transcript: item.transcript,
        meetingDate: item.meeting_date ? new Date(item.meeting_date) : undefined,
        analysis: item.analysis,
        keyInsights: item.key_insights || [],
        actionItems: item.action_items || [],
        metricsDiscussed: item.metrics_discussed || [],
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      setTranscripts(formattedTranscripts);
    } catch (err) {
      console.error('Erro ao buscar transcrições:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar transcrições');
    } finally {
      setLoading(false);
    }
  }, [area, teamId]);

  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);

  // Adicionar nova transcrição e analisar com IA
  const addTranscript = async (data: WarRoomFormData): Promise<WarRoomAnalysisResponse> => {
    try {
      setAnalyzing(true);
      setError(null);

      // Primeiro, analisar com IA
      const analysis = await analyzeWarRoomTranscript(
        data.transcript,
        area,
        data.meetingDate
      );

      // Depois, salvar no banco de dados
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from('me_war_room_transcripts')
        .insert({
          area,
          team_id: teamId || null,
          title: data.title,
          transcript: data.transcript,
          meeting_date: data.meetingDate || null,
          analysis: analysis.analysis,
          key_insights: analysis.keyInsights,
          action_items: analysis.actionItems,
          metrics_discussed: analysis.metricsDiscussed,
          created_by: user?.id,
        });

      if (insertError) throw insertError;

      await fetchTranscripts();

      return analysis;
    } catch (err) {
      console.error('Erro ao adicionar transcrição:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar transcrição';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  // Deletar transcrição
  const deleteTranscript = async (transcriptId: string): Promise<void> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('me_war_room_transcripts')
        .delete()
        .eq('id', transcriptId);

      if (deleteError) throw deleteError;

      await fetchTranscripts();
    } catch (err) {
      console.error('Erro ao deletar transcrição:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar transcrição';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    transcripts,
    loading,
    analyzing,
    error,
    addTranscript,
    deleteTranscript,
    refreshTranscripts: fetchTranscripts,
  };
}
