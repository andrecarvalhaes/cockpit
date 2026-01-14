export type IshikawaCategory =
  | 'Método'
  | 'Material'
  | 'Máquina'
  | 'Mão de obra'
  | 'Medição'
  | 'Meio Ambiente';

export interface FiveWhysLevel {
  level: number; // 1-5
  question: string;
  answer: string;
}

export interface IshikawaCause {
  id: string;
  category: IshikawaCategory;
  cause: string;
  subcauses?: string[];
  isRootCause: boolean;
}

export type AnalysisType = '5whys' | 'ishikawa' | 'both';
export type AnalysisStatus = 'Em Andamento' | 'Concluída';

export interface RootCauseAnalysis {
  id: string;
  metricId: string;
  metricName: string;
  problem: string;
  type: AnalysisType;

  // 5 Porquês
  fiveWhys?: FiveWhysLevel[];
  rootCause?: string;

  // Ishikawa
  ishikawaCauses?: IshikawaCause[];

  // Metadata
  author: string;
  createdAt: Date;
  updatedAt: Date;

  // Vinculações
  linkedActionPlanIds?: string[];
  status: AnalysisStatus;
}

export interface RootCauseAnalysisFormData {
  metricId: string;
  metricName: string;
  problem: string;
  type: AnalysisType;
  fiveWhys?: FiveWhysLevel[];
  rootCause?: string;
  ishikawaCauses?: IshikawaCause[];
}
