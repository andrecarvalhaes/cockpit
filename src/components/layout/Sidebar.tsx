import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Users,
  User as UserIcon,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useAreas } from '../../hooks/useAreas';
import { useTeams } from '../../hooks/useTeams';
import { useMetrics } from '../../hooks/useMetrics';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { areas } = useAreas();
  const { teams } = useTeams();
  const { metrics } = useMetrics();
  const { permissions } = useAuth();
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(false);
  const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(false);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Função para obter áreas únicas de um time ordenadas
  const getTeamAreas = (teamId: string) => {
    const teamMetrics = metrics.filter(m => m.teamId === teamId);
    const uniqueAreas = [...new Set(teamMetrics.map(m => m.area))];
    // Ordena áreas: números primeiro (do menor para o maior), depois strings alfabeticamente
    return uniqueAreas.sort((a, b) => {
      // Extrai números do início da string
      const numA = a.match(/^\d+/)?.[0];
      const numB = b.match(/^\d+/)?.[0];

      // Se ambos têm números, compara numericamente
      if (numA && numB) {
        return parseInt(numA) - parseInt(numB);
      }

      // Se apenas um tem número, o com número vem primeiro
      if (numA) return -1;
      if (numB) return 1;

      // Se nenhum tem número, ordena alfabeticamente
      return a.localeCompare(b);
    });
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isAreaActive = (area: string) => {
    return location.pathname === `/metrics/area/${area}`;
  };

  const isTeamActive = (teamId: string) => {
    return location.pathname === `/metrics/team/${teamId}`;
  };

  const { addArea } = useAreas();

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      addArea(newAreaName.trim());
      setNewAreaName('');
      setIsAddingArea(false);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-border transition-all duration-300 ease-in-out z-40 overflow-y-auto custom-scrollbar ${
        isCollapsed ? 'w-20' : 'w-[250px]'
      }`}
    >
      <div className="flex flex-col min-h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-border flex-shrink-0">
          {isCollapsed ? (
            <img
              src="https://i.imgur.com/ZzmZnq8.png"
              alt="ClubPetro"
              className="h-10"
            />
          ) : (
            <img
              src="https://i.imgur.com/Pw5rL2k.png"
              alt="ClubPetro"
              className="w-40"
            />
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {/* Dashboard */}
          {permissions.canAccessDashboard && (
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/')
                  ? 'bg-primary text-white'
                  : 'text-text-primary hover:bg-bg-submenu'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? 'Dashboard' : ''}
            >
              <LayoutDashboard size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-base font-medium">Dashboard</span>
              )}
            </Link>
          )}

          {/* Times com Dropdown */}
          {permissions.canAccessTeams && (
            <div>
              <button
                onClick={() => !isCollapsed && setIsTeamsExpanded(!isTeamsExpanded)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname.startsWith('/metrics/team')
                    ? 'bg-primary text-white'
                    : 'text-text-primary hover:bg-bg-submenu'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? 'Times' : ''}
              >
                <Users size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="text-base font-medium flex-1 text-left">Times</span>
                    {isTeamsExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </>
                )}
              </button>

              {/* Submenus de Times com Áreas */}
              {!isCollapsed && isTeamsExpanded && (
                <div className="mt-2 ml-4 space-y-1 border-l-2 border-border pl-2">
                  {teams.map((team) => (
                    <div key={team.id}>
                      {/* Time */}
                      <button
                        onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 text-text-secondary hover:text-text-primary hover:bg-bg-submenu"
                      >
                        <span className="flex-1 text-left font-medium">{team.name}</span>
                        {expandedTeam === team.id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>

                      {/* Áreas do Time */}
                      {expandedTeam === team.id && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
                          {getTeamAreas(team.id).map((area) => (
                            <Link
                              key={area}
                              to={`/metrics/team/${team.id}/area/${area}`}
                              className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                                location.pathname === `/metrics/team/${team.id}/area/${area}`
                                  ? 'text-primary font-semibold bg-primary bg-opacity-10'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-submenu'
                              }`}
                            >
                              {area}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Planos de Ação */}
          {permissions.canAccessActionPlans && (
            <Link
              to="/action-plans"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/action-plans')
                  ? 'bg-primary text-white'
                  : 'text-text-primary hover:bg-bg-submenu'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? 'Planos de Ação' : ''}
            >
              <Target size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-base font-medium">Planos de Ação</span>
              )}
            </Link>
          )}

          {/* Performance */}
          {(permissions.canAccessHunter || permissions.canAccessDesign || permissions.canAccessMarketing) && (
            <div>
              <button
                onClick={() => !isCollapsed && setIsPerformanceExpanded(!isPerformanceExpanded)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname.startsWith('/individual') || location.pathname.startsWith('/design') || location.pathname.startsWith('/marketing')
                    ? 'bg-primary text-white'
                    : 'text-text-primary hover:bg-bg-submenu'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? 'Performance' : ''}
              >
                <UserIcon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="text-base font-medium flex-1 text-left">Performance</span>
                    {isPerformanceExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </>
                )}
              </button>

            {/* Submenus de Performance */}
            {!isCollapsed && isPerformanceExpanded && (
              <div className="mt-2 ml-4 space-y-1 border-l-2 border-border pl-2">
                {/* Hunter - Ativo */}
                {permissions.canAccessHunter && (
                  <Link
                    to="/individual"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      location.pathname === '/individual'
                        ? 'text-primary font-semibold bg-primary bg-opacity-10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-submenu'
                    }`}
                  >
                    <span>Hunter</span>
                  </Link>
                )}

                {/* Closer - Trancado */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-text-secondary opacity-50 cursor-not-allowed">
                  <span>Closer</span>
                  <Lock size={12} className="ml-auto" />
                </div>

                {/* Design - Ativo */}
                {permissions.canAccessDesign && (
                  <Link
                    to="/design"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      location.pathname === '/design'
                        ? 'text-primary font-semibold bg-primary bg-opacity-10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-submenu'
                    }`}
                  >
                    <span>Design</span>
                  </Link>
                )}

                {/* Marketing - Ativo */}
                {permissions.canAccessMarketing && (
                  <Link
                    to="/marketing"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      location.pathname === '/marketing'
                        ? 'text-primary font-semibold bg-primary bg-opacity-10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-submenu'
                    }`}
                  >
                    <span>Marketing</span>
                  </Link>
                )}
              </div>
            )}
            </div>
          )}
        </nav>

        {/* Rodapé */}
        <div className="border-t border-border flex-shrink-0">
          {!isCollapsed && (
            <div className="p-4">
              {/* Botão Voltar ao VendeMais */}
              <a
                href="https://vendemais.clubpetro.com/"
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-primary hover:bg-bg-submenu rounded-lg transition-colors border border-border"
              >
                <ArrowLeft size={16} />
                <span>Voltar ao VendeMais</span>
              </a>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center h-12 w-full border-t border-border text-text-secondary hover:text-text-primary hover:bg-bg-submenu transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
    </aside>
  );
};
