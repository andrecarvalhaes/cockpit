import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Users, Sparkles, Calendar, FileText, Trash2, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useWarRoom } from '../../hooks/useWarRoom';
import { WarRoomAnalysisResponse, WarRoomTranscript } from '../../types/warRoom';

interface WarRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: string;
  teamId?: string;
}

export const WarRoomModal: React.FC<WarRoomModalProps> = ({
  isOpen,
  onClose,
  area,
  teamId,
}) => {
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [analysis, setAnalysis] = useState<WarRoomAnalysisResponse | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<WarRoomTranscript | null>(null);
  const [view, setView] = useState<'form' | 'analysis' | 'history'>('form');

  const {
    transcripts,
    loading,
    analyzing,
    error,
    addTranscript,
    deleteTranscript,
  } = useWarRoom({ area, teamId });

  const handleSubmit = async () => {
    if (!title.trim() || !transcript.trim()) {
      return;
    }

    try {
      const result = await addTranscript({
        title: title.trim(),
        transcript: transcript.trim(),
        meetingDate: meetingDate ? new Date(meetingDate) : undefined,
      });

      setAnalysis(result);
      setView('analysis');

      // Limpar formulário
      setTitle('');
      setTranscript('');
      setMeetingDate('');
    } catch (err) {
      // Erro já é tratado no hook
    }
  };

  const handleViewTranscript = (t: WarRoomTranscript) => {
    setSelectedTranscript(t);
    if (t.analysis) {
      setAnalysis({
        analysis: t.analysis,
        keyInsights: t.keyInsights || [],
        actionItems: t.actionItems || [],
        metricsDiscussed: t.metricsDiscussed || [],
      });
      setView('analysis');
    }
  };

  const handleDeleteTranscript = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta transcrição?')) return;

    try {
      await deleteTranscript(id);
      if (selectedTranscript?.id === id) {
        setSelectedTranscript(null);
        setAnalysis(null);
        setView('form');
      }
    } catch (err) {
      // Erro já é tratado no hook
    }
  };

  const handleNewTranscript = () => {
    setView('form');
    setSelectedTranscript(null);
    setAnalysis(null);
    setTitle('');
    setTranscript('');
    setMeetingDate('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-text-secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Users size={24} className="text-primary" />
          <span>War Room - {area}</span>
        </div>
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Navegação de abas */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setView('form')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              view === 'form'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            Nova Transcrição
          </button>
          {analysis && (
            <button
              onClick={() => setView('analysis')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                view === 'analysis'
                  ? 'text-primary border-primary'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              Análise
            </button>
          )}
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              view === 'history'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            Histórico ({transcripts.length})
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Formulário de nova transcrição */}
        {view === 'form' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Título da Reunião *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: War Room Semanal - Métricas de Marketing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Data da Reunião
              </label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Transcrição da Reunião *
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
                rows={12}
                placeholder="Cole aqui a transcrição completa da reunião de War Room...&#10;&#10;A IA irá analisar e extrair:&#10;• Resumo executivo&#10;• Insights principais&#10;• Itens de ação com responsáveis&#10;• Métricas discutidas"
              />
              <p className="text-xs text-text-secondary mt-2">
                Dica: Quanto mais detalhada a transcrição, melhor será a análise da IA
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!title.trim() || !transcript.trim() || analyzing}
              >
                <Sparkles size={18} className="mr-2" />
                {analyzing ? 'Analisando...' : 'Analisar com IA'}
              </Button>
            </div>
          </div>
        )}

        {/* Visualização da análise */}
        {view === 'analysis' && analysis && (
          <div className="space-y-6">
            {/* Resumo executivo */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={24} className="text-primary" />
                <h3 className="text-lg font-heading font-bold text-text-primary">
                  Resumo Executivo
                </h3>
              </div>
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                {analysis.analysis}
              </p>
            </div>

            {/* Insights principais */}
            {analysis.keyInsights && analysis.keyInsights.length > 0 && (
              <div className="bg-white border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-primary" />
                  <h3 className="text-base font-semibold text-text-primary">
                    Insights Principais
                  </h3>
                </div>
                <ul className="space-y-2">
                  {analysis.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span className="text-text-primary text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Itens de ação */}
            {analysis.actionItems && analysis.actionItems.length > 0 && (
              <div className="bg-white border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-success" />
                  <h3 className="text-base font-semibold text-text-primary">
                    Itens de Ação
                  </h3>
                </div>
                <div className="space-y-3">
                  {analysis.actionItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-bg-secondary rounded-lg p-4 border-l-4"
                      style={{
                        borderLeftColor:
                          item.priority === 'high'
                            ? '#EF4444'
                            : item.priority === 'medium'
                            ? '#F59E0B'
                            : '#10B981',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-text-primary font-medium flex-1">
                          {item.description}
                        </p>
                        <span className={`text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                          {getPriorityLabel(item.priority)}
                        </span>
                      </div>
                      {(item.responsible || item.deadline) && (
                        <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                          {item.responsible && <span>👤 {item.responsible}</span>}
                          {item.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> {item.deadline}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Métricas discutidas */}
            {analysis.metricsDiscussed && analysis.metricsDiscussed.length > 0 && (
              <div className="bg-white border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={20} className="text-primary" />
                  <h3 className="text-base font-semibold text-text-primary">
                    Métricas Discutidas
                  </h3>
                </div>
                <div className="space-y-3">
                  {analysis.metricsDiscussed.map((metric, index) => (
                    <div key={index} className="bg-bg-secondary rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-text-primary">{metric.metricName}</h4>
                        {metric.currentValue !== undefined && metric.targetValue !== undefined && (
                          <div className="text-sm">
                            <span className="text-text-primary font-medium">
                              {metric.currentValue}
                            </span>
                            <span className="text-text-secondary mx-1">/</span>
                            <span className="text-text-secondary">{metric.targetValue}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">{metric.observation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={handleNewTranscript}>
                Nova Transcrição
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}

        {/* Histórico */}
        {view === 'history' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-text-secondary">
                Carregando histórico...
              </div>
            ) : transcripts.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto mb-3 text-text-secondary opacity-30" />
                <p className="text-text-secondary">Nenhuma transcrição de War Room ainda.</p>
                <p className="text-sm text-text-secondary mt-1">
                  Crie a primeira transcrição para começar.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {transcripts.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => handleViewTranscript(t)}
                        className="flex-1 text-left"
                      >
                        <h4 className="font-semibold text-text-primary hover:text-primary transition-colors">
                          {t.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                          {t.meetingDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(t.meetingDate)}
                            </span>
                          )}
                          <span>{t.keyInsights?.length || 0} insights</span>
                          <span>{t.actionItems?.length || 0} ações</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteTranscript(t.id)}
                        className="text-text-secondary hover:text-error transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
