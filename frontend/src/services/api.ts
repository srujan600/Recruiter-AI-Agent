import type { Job, Candidate, Application, PipelineStage, ScreeningResult, Interview, Assessment, AnalyticsData } from '../types';
import { apiCache } from './cache';

// Use relative API path to take advantage of Vite's proxy and eliminate CORS preflights when available
const API_BASE = (typeof window !== 'undefined' && window.location.port === '3000') 
  ? '/api/v1' 
  : 'http://127.0.0.1:8000/api/v1';

export { apiCache };

export async function fetchJobs(forceRefresh = false): Promise<Job[]> {
  return apiCache.fetchWithCache('jobs', async () => {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  }, { forceRefresh, ttl: 45000 });
}

export async function createJob(jobData: Partial<Job>): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData)
  });
  if (!res.ok) throw new Error('Failed to create job');
  const created = await res.json();
  // Invalidate jobs and dashboard analytics cache
  apiCache.invalidate('jobs');
  apiCache.invalidate('analytics');
  return created;
}

export async function fetchCandidates(q?: string, forceRefresh = false): Promise<Candidate[]> {
  const cacheKey = q ? `candidates?q=${q}` : 'candidates';
  return apiCache.fetchWithCache(cacheKey, async () => {
    const url = q ? `${API_BASE}/candidates?q=${encodeURIComponent(q)}` : `${API_BASE}/candidates`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  }, { forceRefresh, ttl: 60000 });
}

export async function fetchCandidateDetail(candidateId: number, forceRefresh = false): Promise<Candidate> {
  return apiCache.fetchWithCache(`candidate_${candidateId}`, async () => {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}`);
    if (!res.ok) throw new Error('Failed to fetch candidate details');
    return res.json();
  }, { forceRefresh, ttl: 120000 });
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
  const result = await res.json();
  // Invalidate affected data caches
  apiCache.invalidate('candidates');
  apiCache.invalidate('pipeline');
  apiCache.invalidate('analytics');
  return result;
}

export async function fetchPipeline(jobId?: number, forceRefresh = false): Promise<Application[]> {
  const cacheKey = jobId ? `pipeline?job_id=${jobId}` : 'pipeline';
  return apiCache.fetchWithCache(cacheKey, async () => {
    const url = jobId ? `${API_BASE}/pipeline?job_id=${jobId}` : `${API_BASE}/pipeline`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch candidate pipeline');
    return res.json();
  }, { forceRefresh, ttl: 45000 });
}

export async function updateCandidateStage(applicationId: number, stage: PipelineStage): Promise<Application> {
  // Optimistically update current pipeline cache entry if present
  const currentApps = apiCache.getCached<Application[]>('pipeline');
  if (currentApps) {
    const updated = currentApps.map((a) => (a.id === applicationId ? { ...a, stage } : a));
    apiCache.setCached('pipeline', updated);
  }

  const res = await fetch(`${API_BASE}/pipeline/${applicationId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage })
  });
  if (!res.ok) {
    // Invalidate to rollback on error
    apiCache.invalidate('pipeline');
    throw new Error('Failed to update stage');
  }
  const result = await res.json();
  apiCache.invalidate('analytics');
  return result;
}

export async function fetchScreeningResult(candidateId: number, forceRefresh = false): Promise<ScreeningResult> {
  return apiCache.fetchWithCache(`screening_${candidateId}`, async () => {
    const res = await fetch(`${API_BASE}/screening/${candidateId}`);
    if (!res.ok) throw new Error('Failed to fetch screening results');
    return res.json();
  }, { forceRefresh, ttl: 120000 });
}

export async function compareCandidateMatch(candidateId: number, jobId: number, forceRefresh = false) {
  const cacheKey = `matcher_${candidateId}_${jobId}`;
  return apiCache.fetchWithCache(cacheKey, async () => {
    const res = await fetch(`${API_BASE}/matching/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, job_id: jobId })
    });
    if (!res.ok) throw new Error('Failed to fetch candidate matching analysis');
    return res.json();
  }, { forceRefresh, ttl: 120000 });
}

export async function fetchInterviews(forceRefresh = false): Promise<Interview[]> {
  return apiCache.fetchWithCache('interviews', async () => {
    const res = await fetch(`${API_BASE}/interviews`);
    if (!res.ok) throw new Error('Failed to fetch interviews');
    return res.json();
  }, { forceRefresh, ttl: 60000 });
}

export async function scheduleInterview(data: Partial<Interview>): Promise<Interview> {
  const res = await fetch(`${API_BASE}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to schedule interview');
  const created = await res.json();
  apiCache.invalidate('interviews');
  apiCache.invalidate('pipeline');
  apiCache.invalidate('analytics');
  return created;
}

export async function fetchAssessments(forceRefresh = false): Promise<Assessment[]> {
  return apiCache.fetchWithCache('assessments', async () => {
    const res = await fetch(`${API_BASE}/assessments`);
    if (!res.ok) throw new Error('Failed to fetch assessments');
    return res.json();
  }, { forceRefresh, ttl: 60000 });
}

export async function assignAssessment(data: Partial<Assessment>): Promise<Assessment> {
  const res = await fetch(`${API_BASE}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to assign assessment');
  const created = await res.json();
  apiCache.invalidate('assessments');
  apiCache.invalidate('pipeline');
  apiCache.invalidate('analytics');
  return created;
}

export async function fetchDashboardAnalytics(forceRefresh = false): Promise<AnalyticsData> {
  return apiCache.fetchWithCache('analytics', async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }, { forceRefresh, ttl: 45000 });
}

export async function sendAgentQuery(message: string, contextJobId?: number) {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context_job_id: contextJobId })
  });
  if (!res.ok) throw new Error('Failed to reach Recruiter AI Assistant');
  const data = await res.json();
  // If agent shortlisted or scheduled, invalidate pipeline & interviews
  if (data.action_type) {
    apiCache.invalidate('pipeline');
    apiCache.invalidate('interviews');
    apiCache.invalidate('analytics');
  }
  return data;
}

export async function fetchNotifications(forceRefresh = false) {
  return apiCache.fetchWithCache('notifications', async () => {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  }, { forceRefresh, ttl: 30000 });
}

export async function searchTalent(query: string, signal?: AbortSignal): Promise<{ candidates: Candidate[]; jobs: Job[] }> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return { candidates: [], jobs: [] };

  const [allCandidates, allJobs] = await Promise.all([
    fetchCandidates(undefined, false),
    fetchJobs(false)
  ]);

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const matchedCandidates = allCandidates.filter(c => 
    c.full_name.toLowerCase().includes(trimmed) ||
    c.current_role?.toLowerCase().includes(trimmed) ||
    c.location?.toLowerCase().includes(trimmed) ||
    c.email.toLowerCase().includes(trimmed)
  ).slice(0, 5);

  const matchedJobs = allJobs.filter(j =>
    j.title.toLowerCase().includes(trimmed) ||
    j.department.toLowerCase().includes(trimmed) ||
    j.required_skills?.some(s => s.toLowerCase().includes(trimmed))
  ).slice(0, 4);

  return { candidates: matchedCandidates, jobs: matchedJobs };
}
