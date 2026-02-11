import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { StickyNote, Trash2, Sparkles, Clock, Lightbulb } from 'lucide-react';
import { useAnalysisNotes } from '../../hooks/useAnalysisNotes';
import { AISummaryResponse } from '../../types/analysisNote';

interface AnalysisNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: string;
  teamId?: string;
}

export const AnalysisNotesModal: React.FC<AnalysisNotesModalProps> = ({
  isOpen,
  onClose,
  area,
  teamId,
}) => {
  const [newNote, setNewNote] = useState('');
  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const {
    notes,
    summaries,
    loading,
    generating,
    error,
    addNote,
    deleteNote,
    generateSummary,
  } = useAnalysisNotes({ area, teamId });

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await addNote(newNote.trim());
      setNewNote('');
    } catch (err) {
      // Erro já é tratado no hook
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Deseja realmente excluir esta nota?')) return;

    try {
      await deleteNote(noteId);
    } catch (err) {
      // Erro já é tratado no hook
    }
  };

  const handleGenerateSummary = async () => {
    try {
      const summary = await generateSummary();
      setAiSummary(summary);
      setShowSummary(true);
    } catch (err) {
      // Erro já é tratado no hook
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <StickyNote size={24} className="text-primary" />
          <span>Notas de Análise - {area}</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Formulário de nova nota */}
        <div className="bg-bg-secondary rounded-lg p-4">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Adicionar Nova Nota
          </label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
            placeholder="Digite suas observações e insights sobre as métricas..."
          />
          <div className="mt-3 flex justify-end">
            <Button
              variant="primary"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
            >
              <StickyNote size={18} className="mr-2" />
              Adicionar Nota
            </Button>
          </div>
        </div>

        {/* Lista de notas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Notas Coletadas ({notes.length})
            </h3>
            {notes.length > 0 && (
              <Button
                variant="primary"
                onClick={handleGenerateSummary}
                disabled={generating}
              >
                <Sparkles size={18} className="mr-2" />
                {generating ? 'Gerando...' : 'Resumir com IA'}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-text-secondary">
              Carregando notas...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <StickyNote size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nenhuma nota adicionada ainda.</p>
              <p className="text-sm mt-1">
                Comece adicionando suas observações sobre as métricas.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-text-primary text-sm whitespace-pre-wrap">
                        {note.note}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                        <Clock size={12} />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-text-secondary hover:text-error transition-colors flex-shrink-0"
                      title="Excluir nota"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo gerado pela IA */}
        {showSummary && aiSummary && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={24} className="text-primary" />
              <h3 className="text-lg font-heading font-bold text-text-primary">
                Resumo Gerado pela IA
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">
                  Análise
                </h4>
                <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                  {aiSummary.summary}
                </p>
              </div>

              {aiSummary.suggestedActions && aiSummary.suggestedActions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={18} className="text-primary" />
                    <h4 className="text-sm font-semibold text-text-primary">
                      Ações Sugeridas
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {aiSummary.suggestedActions.map((action, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-text-primary text-sm"
                      >
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumos anteriores */}
        {summaries.length > 0 && !showSummary && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              Resumos Anteriores
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {summaries.map((summary) => (
                <button
                  key={summary.id}
                  onClick={() => {
                    setAiSummary({
                      summary: summary.summary,
                      suggestedActions: summary.suggestedActions,
                    });
                    setShowSummary(true);
                  }}
                  className="w-full text-left bg-white border border-border rounded-lg p-3 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {formatDate(summary.createdAt)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {summary.notesUsedCount} nota(s)
                    </span>
                  </div>
                  <p className="text-sm text-text-primary mt-1 line-clamp-2">
                    {summary.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
