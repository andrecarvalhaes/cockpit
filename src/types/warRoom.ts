export interface WarRoomTranscript {
  id: string;
  area: string;
  teamId?: string;
  title: string;
  transcript: string;
  meetingDate?: Date;
  analysis?: string;
  keyInsights?: string[];
  actionItems?: ActionItem[];
  metricsDiscussed?: MetricDiscussion[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionItem {
  description: string;
  responsible?: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MetricDiscussion {
  metricName: string;
  currentValue?: number;
  targetValue?: number;
  observation: string;
}

export interface WarRoomFormData {
  title: string;
  transcript: string;
  meetingDate?: Date;
}

export interface WarRoomAnalysisResponse {
  analysis: string;
  keyInsights: string[];
  actionItems: ActionItem[];
  metricsDiscussed: MetricDiscussion[];
}
