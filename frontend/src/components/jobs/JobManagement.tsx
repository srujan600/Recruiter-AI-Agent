import React, { useEffect, useState, useCallback } from 'react';
import { fetchJobs, updateJobStatus, apiCache } from '../../services/api';
import type { Job } from '../../types';
import { JobsSkeleton, ErrorRetryCard } from '../common/Skeletons';

interface JobManagementProps {
  onOpenNewJob: () => void;
  onNavigate: (tab: string, candidateId?: number, jobId?: number) => void;
}

interface JobCardProps {
  job: Job;
  onNavigate: (tab: string, candidateId?: number, jobId?: number) => void;
  onUpdateStatus: (jobId: number, status: string) => void;
}

const JobCard: React.FC<JobCardProps> = React.memo(({ job, onNavigate, onUpdateStatus }) => (
  <div className="card-3d card-3d-hover p-5 space-y-4 flex flex-col justify-between transition-all">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-0.5 text-[10px] font-black rounded-full uppercase shadow-xs ${
          job.status === 'active'
            ? 'bg-[#6cf8bb] text-[#002113]'
            : job.status === 'closed'
            ? 'bg-[#ffdad6] text-[#ba1a1a]'
            : 'bg-[#eff4ff] text-[#45464d]'
        }`}>
          {job.status}
        </span>
        <span className="text-[11px] font-extrabold text-[#45464d]">{job.department}</span>
      </div>

      <div>
        <h3 className="text-base font-black text-[#0b1c30]">{job.title}</h3>
        <p className="text-xs text-[#45464d] mt-0.5 font-medium">{job.location} • {job.job_type}</p>
      </div>

      <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#eff4ff] inset-depth space-y-1.5 text-xs">
        <div className="flex justify-between text-[#45464d]">
          <span>Salary Band:</span>
          <strong className="text-[#0b1c30] font-extrabold">${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}</strong>
        </div>
        <div className="flex justify-between text-[#45464d]">
          <span>Experience Level:</span>
          <strong className="text-[#0b1c30] font-extrabold">{job.experience_level}</strong>
        </div>
        <div className="flex justify-between text-[#45464d]">
          <span>Notice Period:</span>
          <strong className="text-[#0b1c30] font-extrabold">{job.notice_period_days} Days Max</strong>
        </div>
      </div>

      <div>
        <span className="text-[11px] font-extrabold text-[#45464d] block mb-1.5">Required Skills:</span>
        <div className="flex flex-wrap gap-1.5">
          {job.required_skills?.map((s, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-[#eff4ff] text-[#006c49] border border-[#d3e4fe] text-[10px] font-extrabold rounded-md">
              {s}
            </span>
          ))}
        </div>
      </div>

      {job.preferred_skills && job.preferred_skills.length > 0 && (
        <div>
          <span className="text-[11px] font-extrabold text-[#76777d] block mb-1.5">Preferred Skills:</span>
          <div className="flex flex-wrap gap-1.5">
            {job.preferred_skills.map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-[#f8f9ff] text-[#45464d] border border-[#c6c6cd] text-[10px] font-bold rounded-md">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="pt-4 border-t border-[#eff4ff] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#76777d]">
          <strong className="text-[#0b1c30] font-black">{job.applicant_count || 0}</strong> Applicants
        </span>
        <button
          onClick={() => onNavigate('pipeline', undefined, job.id)}
          className="text-xs font-extrabold text-[#006c49] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View Pipeline</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>

      {/* Action controls to close/archive/reactivate */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {job.status === 'active' ? (
          <>
            <button
              onClick={() => onUpdateStatus(job.id, 'closed')}
              className="text-[10px] font-bold text-[#ba1a1a] hover:underline btn-3d btn-3d-glass px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Close Job
            </button>
            <button
              onClick={() => onUpdateStatus(job.id, 'archived')}
              className="text-[10px] font-bold text-[#76777d] hover:underline btn-3d btn-3d-glass px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Archive
            </button>
          </>
        ) : (
          <button
            onClick={() => onUpdateStatus(job.id, 'active')}
            className="text-[10px] font-bold text-[#006c49] hover:underline btn-3d btn-3d-glass px-2.5 py-1 rounded-lg cursor-pointer"
          >
            Reopen Requisition
          </button>
        )}
      </div>
    </div>
  </div>
));

JobCard.displayName = 'JobCard';

export const JobManagement: React.FC<JobManagementProps> = React.memo(({ onOpenNewJob, onNavigate }) => {
  const cachedJobs = apiCache.getCached<Job[]>('jobs');
  const [jobs, setJobs] = useState<Job[]>(cachedJobs || []);
  const [loading, setLoading] = useState<boolean>(!cachedJobs);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback((forceRefresh = false) => {
    if (!cachedJobs || forceRefresh) setLoading(true);
    setError(null);
    fetchJobs(forceRefresh)
      .then((res) => {
        setJobs(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Job load error:', err);
        setError('Failed to load job requisitions.');
        setLoading(false);
      });
  }, [cachedJobs]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleUpdateStatus = async (jobId: number, status: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: status as any } : j));
    try {
      await updateJobStatus(jobId, status);
      loadJobs(true);
    } catch (e) {
      console.error('Failed to update job status:', e);
      loadJobs(true);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="card-3d p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006c49] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined">work</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Job Openings & Requisitions</h1>
            <p className="text-xs text-[#45464d] mt-0.5">Manage active hiring requisitions, pipeline targets, and status lifecycles</p>
          </div>
        </div>

        <button
          onClick={onOpenNewJob}
          className="btn-3d btn-3d-emerald px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create New Job Requisition
        </button>
      </div>

      {error && jobs.length === 0 ? (
        <ErrorRetryCard message={error} onRetry={() => loadJobs(true)} />
      ) : loading && jobs.length === 0 ? (
        <JobsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onNavigate={onNavigate}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
});

JobManagement.displayName = 'JobManagement';
