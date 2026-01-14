import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-lg shadow-card-hover w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          {typeof title === 'string' ? (
            <h2 className="text-xl font-heading font-bold text-text-primary">
              {title}
            </h2>
          ) : (
            <div className="text-xl font-heading font-bold text-text-primary flex-1">
              {title}
            </div>
          )}
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors ml-4 flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
