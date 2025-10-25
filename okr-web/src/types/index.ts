// API Response Types
export interface Objective {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  team_id?: string;
  workspace_id?: string;
  quarter: string;
  status: string;
  progress: number;
  weight?: number;
  type?: string; // NEW: COMPANY, DEPARTMENT, TEAM, KPI
  parent_id?: string; // NEW: for KPIs
  groups: string[];
  labels?: string[];
  stakeholders?: string[];
  start_date?: string;
  end_date?: string;
  last_check_in_date?: string;
  comments_count: number;
  key_results?: KeyResult[]; // NEW: loaded from backend
  kpis?: Objective[]; // NEW: loaded from backend (objectives with type=KPI)
  created_date: string;
  last_modified_date: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  metric_type: string;
  unit?: string;
  target_value: number;
  current_value: number;
  weight: number; // NEW
  created_date: string;
  last_modified_date: string;
}

export interface CheckIn {
  id: string;
  key_result_id: string;
  value: number;
  note: string;
  created_date: string;
  last_modified_date: string;
}

export interface Comment {
  id: string;
  objective_id?: string;
  key_result_id?: string;
  content: string;
  author_id: string;
  created_date: string;
  last_modified_date: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  status: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
}

// Dashboard Types
export interface DashboardSummary {
  total_objectives: number;
  average_progress: number;
  status_distribution: Record<string, number>;
}

export interface TopPerformer {
  id: string;
  title: string;
  progress: number;
  status: string;
  owner_id: string;
  team_id: string;
}

export interface RecentCheckIn {
  id: string;
  key_result_id: string;
  value: number;
  note: string;
  created_date: string;
  created_by: string;
}

// Form Types
export interface CreateObjectiveForm {
  title: string;
  description: string;
  quarter: string;
  team_id?: string;
  type?: 'COMPANY' | 'DEPARTMENT' | 'TEAM' | 'KPI';
  groups?: string[];
  labels?: string[];
  stakeholders?: string[];
  start_date?: string;
  end_date?: string;
}

export interface CreateKeyResultForm {
  title: string;
  metric_type: string;
  unit: string;
  target_value: number;
  current_value: number;
}

export interface CheckInForm {
  value: number;
  note?: string;
}

export interface CreateCommentForm {
  content: string;
  objective_id?: string;
  key_result_id?: string;
}

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  status: string;
  settings?: string;
  created_date?: string;
  last_modified_date?: string;
  member_count: number;
  objective_count: number;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  status: string;
  member_count: number;
  objective_count: number;
  team_count: number;
  last_activity?: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  role: string;
  status: string;
  joined_date?: string;
}

export interface CreateWorkspaceForm {
  name: string;
  description?: string;
  settings?: string;
}

export interface UpdateWorkspaceForm {
  name?: string;
  description?: string;
  settings?: string;
}

export interface InviteUserForm {
  user_email: string;
  role?: string;
}

