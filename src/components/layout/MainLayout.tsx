import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`transition-all duration-300 ease-in-out p-8 ${
          isCollapsed ? 'ml-20' : 'ml-[250px]'
        }`}
      >
        {children}
      </main>
    </div>
  );
};
