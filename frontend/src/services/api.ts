import type { Job, Candidate, Application, PipelineStage, ScreeningResult, Interview, Assessment, AnalyticsData } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function createJob(jobData: Partial<Job>): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData)
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function fetchCandidates(): Promise<Candidate[]> {
  const res = await fetch(`${API_BASE}/candidates`);
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return res.json();
}

export async function fetchCandidateDetail(candidateId: number): Promise<Candidate> {
  const res = await fetch(`${API_BASE}/candidates/${candidateId}`);
  if (!res.ok) throw new Error('Failed to fetch candidate details');
  return res.json();
}

export async function uploadCandidateResume(file: File, jobId?: number) {
  const formData = new FormData();
  formData.append('file', file);
  if (jobId) formData.append('job_id', jobId.toString());

  const res = await fetch(`${API_BASE}/candidates/upload_resume`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload resume');
  return res.json();
}

export async function fetchPipeline(jobId?: number): Promise<Application[]> {
  const url = jobId ? `${API_BASE}/pipeline?job_id=${jobId}` : `${API_BASE}/pipeline`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch candidate pipeline');
  return res.json();
}

export async function updateCandidateStage(applicationId: number, stage: PipelineStage): Promise<Application> {
  const res = await fetch(`${API_BASE}/pipeline/${applicationId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage })
  });
  if (!res.ok) throw new Error('Failed to update stage');
  return res.json();
}

export async function fetchScreeningResult(candidateId: number): Promise<ScreeningResult> {
  const res = await fetch(`${API_BASE}/screening/${candidateId}`);
  if (!res.ok) throw new Error('Failed to fetch screening results');
  return res.json();
}

export async function compareCandidateMatch(candidateId: number, jobId: number) {
  const res = await fetch(`${API_BASE}/matching/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate_id: candidateId, job_id: jobId })
  });
  if (!res.ok) throw new Error('Failed to fetch candidate matching analysis');
  return res.json();
}

export async function fetchInterviews(): Promise<Interview[]> {
  const res = await fetch(`${API_BASE}/interviews`);
  if (!res.ok) throw new Error('Failed to fetch interviews');
  return res.json();
}

export async function scheduleInterview(data: Partial<Interview>): Promise<Interview> {
  const res = await fetch(`${API_BASE}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to schedule interview');
  return res.json();
}

export async function fetchAssessments(): Promise<Assessment[]> {
  const res = await fetch(`${API_BASE}/assessments`);
  if (!res.ok) throw new Error('Failed to fetch assessments');
  return res.json();
}

export async function assignAssessment(data: Partial<Assessment>): Promise<Assessment> {
  const res = await fetch(`${API_BASE}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to assign assessment');
  return res.json();
}

export async function fetchDashboardAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function sendAgentQuery(message: string, contextJobId?: number) {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context_job_id: contextJobId })
  });
  if (!res.ok) throw new Error('Failed to reach Recruiter AI Assistant');
  return res.json();
}

export async function fetchNotifications() {
  const res = await fetch(`${API_BASE}/notifications`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}
