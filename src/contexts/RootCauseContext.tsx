import React, { createContext, useState, useEffect } from 'react';
import {
  RootCauseAnalysis,
  RootCauseAnalysisFormData,
} from '../types/rootCauseAnalysis';
import { mockRootCauseAnalyses } from '../utils/mockData';

interface RootCauseContextType {
  analyses: RootCauseAnalysis[];
  addAnalysis: (data: RootCauseAnalysisFormData) => RootCauseAnalysis;
  updateAnalysis: (id: string, data: Partial<RootCauseAnalysis>) => void;
  deleteAnalysis: (id: string) => void;
  getAnalysisById: (id: string) => RootCauseAnalysis | undefined;
  getAnalysesByMetric: (metricId: string) => RootCauseAnalysis[];
  linkActionPlan: (analysisId: string, actionPlanId: string) => void;
  unlinkActionPlan: (analysisId: string, actionPlanId: string) => void;
  toggleStatus: (id: string) => void;
}

export const RootCauseContext = createContext<RootCauseContextType | undefined>(
  undefined
);

export const RootCauseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [analyses, setAnalyses] = useState<RootCauseAnalysis[]>(() => {
    const saved = localStorage.getItem('rootCauseAnalyses');
    if (saved) {
      const parsedAnalyses = JSON.parse(saved);
      return parsedAnalyses.map((analysis: any) => ({
        ...analysis,
        createdAt: new Date(analysis.createdAt),
        updatedAt: new Date(analysis.updatedAt),
      }));
    }
    return mockRootCauseAnalyses;
  });

  useEffect(() => {
    localStorage.setItem('rootCauseAnalyses', JSON.stringify(analyses));
  }, [analyses]);

  const addAnalysis = (data: RootCauseAnalysisFormData): RootCauseAnalysis => {
    const newAnalysis: RootCauseAnalysis = {
      id: Date.now().toString(),
      ...data,
      author: 'Sistema',
      status: 'Em Andamento',
      linkedActionPlanIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAnalyses((prev) => [...prev, newAnalysis]);
    return newAnalysis;
  };

  const updateAnalysis = (id: string, data: Partial<RootCauseAnalysis>) => {
    setAnalyses((prev) =>
      prev.map((analysis) =>
        analysis.id === id
          ? { ...analysis, ...data, updatedAt: new Date() }
          : analysis
      )
    );
  };

  const deleteAnalysis = (id: string) => {
    setAnalyses((prev) => prev.filter((analysis) => analysis.id !== id));
  };

  const getAnalysisById = (id: string) => {
    return analyses.find((analysis) => analysis.id === id);
  };

  const getAnalysesByMetric = (metricId: string) => {
    return analyses.filter((analysis) => analysis.metricId === metricId);
  };

  const linkActionPlan = (analysisId: string, actionPlanId: string) => {
    setAnalyses((prev) =>
      prev.map((analysis) =>
        analysis.id === analysisId
          ? {
              ...analysis,
              linkedActionPlanIds: [
                ...(analysis.linkedActionPlanIds || []),
                actionPlanId,
              ],
              updatedAt: new Date(),
            }
          : analysis
      )
    );
  };

  const unlinkActionPlan = (analysisId: string, actionPlanId: string) => {
    setAnalyses((prev) =>
      prev.map((analysis) =>
        analysis.id === analysisId
          ? {
              ...analysis,
              linkedActionPlanIds: (analysis.linkedActionPlanIds || []).filter(
                (id) => id !== actionPlanId
              ),
              updatedAt: new Date(),
            }
          : analysis
      )
    );
  };

  const toggleStatus = (id: string) => {
    setAnalyses((prev) =>
      prev.map((analysis) =>
        analysis.id === id
          ? {
              ...analysis,
              status:
                analysis.status === 'Em Andamento' ? 'Concluída' : 'Em Andamento',
              updatedAt: new Date(),
            }
          : analysis
      )
    );
  };

  return (
    <RootCauseContext.Provider
      value={{
        analyses,
        addAnalysis,
        updateAnalysis,
        deleteAnalysis,
        getAnalysisById,
        getAnalysesByMetric,
        linkActionPlan,
        unlinkActionPlan,
        toggleStatus,
      }}
    >
      {children}
    </RootCauseContext.Provider>
  );
};
