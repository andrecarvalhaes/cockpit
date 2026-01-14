import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <header className="bg-white border-b border-border py-6 px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            {title}
          </h1>
          <p className="text-sm text-text-secondary mt-1 capitalize">
            {subtitle || today}
          </p>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
};
