import React, { createContext, useState, useEffect } from 'react';
import { Team } from '../types/team';
import { supabase } from '../lib/supabase';

interface TeamsContextType {
  teams: Team[];
  addTeam: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTeam: (id: string, team: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  getTeamById: (id: string) => Team | undefined;
  refreshTeams: () => Promise<void>;
}

export const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);

  const refreshTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('me_teams')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setTeams(data.map(team => ({
          id: team.id,
          name: team.name,
          description: team.description,
          createdAt: new Date(team.created_at),
          updatedAt: new Date(team.updated_at),
        })));
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  useEffect(() => {
    refreshTeams();
  }, []);

  const addTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('me_teams')
        .insert([{
          name: teamData.name,
          description: teamData.description,
        }])
        .select();

      if (error) throw error;

      if (data) {
        await refreshTeams();
      }
    } catch (error) {
      console.error('Error adding team:', error);
      throw error;
    }
  };

  const updateTeam = async (id: string, teamData: Partial<Team>) => {
    try {
      const { error } = await supabase
        .from('me_teams')
        .update({
          name: teamData.name,
          description: teamData.description,
        })
        .eq('id', id);

      if (error) throw error;

      await refreshTeams();
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('me_teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refreshTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  };

  const getTeamById = (id: string) => {
    return teams.find((team) => team.id === id);
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        addTeam,
        updateTeam,
        deleteTeam,
        getTeamById,
        refreshTeams,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};
