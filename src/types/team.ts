export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamFormData {
  name: string;
  description?: string;
}
