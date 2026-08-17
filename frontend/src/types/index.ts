export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  job_type: string;
  experience_level: string;
  min_salary: number;
  max_salary: number;
  notice_period_days: number;
  status: 'active' | 'draft' | 'closed' | 'archived';
  description?: string;
  required_skills: string[];
  preferred_skills: string[];
  hiring_manager_name: string;
  recruiter_name: string;
  created_at: string;
  applicant_count?: number;
}

export interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  location: string;
  current_company?: string;
  current_role?: string;
  total_experience_years: number;
  notice_period_days: number;
  expected_salary: number;
  current_salary: number;
  avatar_url?: string;
  created_at: string;
}

export type PipelineStage = 
  | 'Applied'
  | 'AI Screening'
  | 'Shortlisted'
  | 'Assessment'
  | 'Interview'
  | 'Offer'
  | 'Hired'
  | 'Rejected';

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  stage: PipelineStage;
  match_score: number;
  ats_score: number;
  applied_at: string;
  candidate: Candidate;
  job_title?: string;
}

export interface ScreeningResult {
  id: number;
  application_id: number;
  overall_match_score: number;
  ats_score: number;
  skill_match_score: number;
  experience_match_score: number;
  education_match_score: number;
  requirement_match_score: number;
  key_strengths: string[];
  missing_skills: string[];
  ai_rationale: string;
  created_at: string;
}

export interface Interview {
  id: number;
  application_id: number;
  title: string;
  interview_type: string;
  interviewer_name: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  created_at: string;
}

export interface Assessment {
  id: number;
  application_id: number;
  title: string;
  assessment_type: string;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  max_score: number;
  completed_at?: string;
  summary?: string;
}

export interface AnalyticsData {
  active_jobs: number;
  candidates_screened: number;
  avg_time_to_hire_days: number;
  offer_acceptance_rate_pct: number;
  scheduled_interviews: number;
  process_bottleneck: {
    detected: boolean;
    stage: string;
    count: number;
    message: string;
  };
  hiring_funnel: { stage: string; count: number }[];
  recent_activity: {
    id: number;
    title: string;
    description: string;
    time: string;
    badge: string;
  }[];
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action_type?: string;
  action_payload?: any;
  timestamp: string;
}
