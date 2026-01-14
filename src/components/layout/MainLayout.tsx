import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`transition-all duration-300 ease-in-out p-8 ${
          isCollapsed ? 'ml-20' : 'ml-[250px]'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};
