import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Metric } from '../../types/metric';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: Metric;
  onSave: (comment: string) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  metric,
  onSave,
}) => {
  const [comment, setComment] = useState('');

  const handleSave = () => {
    if (comment.trim()) {
      onSave(comment);
      setComment('');
      onClose();
    }
  };

  const handleCancel = () => {
    setComment('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={`Adicionar Comentário - ${metric.name}`}
      size="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Comentário / Observação
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={6}
            placeholder="Digite aqui suas observações sobre esta métrica..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!comment.trim()}
          >
            Salvar Comentário
          </Button>
        </div>
      </div>
    </Modal>
  );
};
