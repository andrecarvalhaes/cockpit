export interface ActionPlanComment {
  id: string;
  content: string;
  createdAt: Date;
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  metricId?: string;
  metricName?: string;
  area?: string;
  responsible: string;
  expectedResult: string;
  completed: boolean;
  comments: ActionPlanComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionPlanFormData {
  title: string;
  description: string;
  metricId?: string;
  area?: string;
  responsible: string;
  expectedResult: string;
}
