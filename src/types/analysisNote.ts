export interface AnalysisNote {
  id: string;
  area: string;
  teamId?: string;
  note: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisSummary {
  id: string;
  area: string;
  teamId?: string;
  summary: string;
  suggestedActions: string[];
  notesUsedCount: number;
  createdBy?: string;
  createdAt: Date;
}

export interface AnalysisNoteFormData {
  note: string;
}

export interface AISummaryResponse {
  summary: string;
  suggestedActions: string[];
}
