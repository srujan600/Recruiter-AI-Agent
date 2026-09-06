import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchPipeline, updateCandidateStage, fetchJobs, apiCache } from '../../services/api';
import type { Application, PipelineStage, Job } from '../../types';
import { PipelineSkeleton, ErrorRetryCard } from '../common/Skeletons';

interface CandidatePipelineProps {
  onSelectCandidate: (candidateId: number) => void;
  onOpenMatcher: (candidateId: number, jobId: number) => void;
}

const STAGES: PipelineStage[] = [
  'Applied',
  'AI Screening',
  'Shortlisted',
  'Assessment',
  'Interview',
  'Offer',
  'Hired'
];

// Memoized Candidate Card to eliminate redundant renders across columns
interface CandidateCardProps {
  app: Application;
  onSelect: (candidateId: number) => void;
  onOpenMatcher: (candidateId: number, jobId: number) => void;
  onStageChange: (appId: number, newStage: PipelineStage) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = React.memo(({
  app,
  onSelect,
  onOpenMatcher,
  onStageChange
}) => {
  return (
    <div
      className="card-3d card-3d-hover p-4 space-y-3 cursor-pointer group transition-all"
      onClick={() => onSelect(app.candidate_id)}
    >
      {/* Match & ATS Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#007c54] to-[#006c49] text-white rounded-lg text-xs font-black shadow-xs">
          <span className="material-symbols-outlined text-xs animate-pulse">auto_awesome</span>
          <span>{app.match_score}% Match</span>
        </div>
        <span className="text-[10px] font-extrabold text-[#0b1c30] bg-[#eff4ff] px-2 py-0.5 rounded-md border border-[#d3e4fe]">
          ATS: {app.ats_score}%
        </span>
      </div>

      {/* Candidate Identity */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={app.candidate?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
            alt={app.candidate?.full_name || 'Candidate'}
            loading="lazy"
            className="w-11 h-11 rounded-full object-cover border-2 border-[#6cf8bb] shadow-sm"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-extrabold text-[#0b1c30] truncate group-hover:text-[#006c49] transition-colors">
            {app.candidate?.full_name || 'Candidate'}
          </h4>
          <p className="text-[11px] text-[#45464d] truncate font-medium">
            {app.candidate?.current_role || 'Senior Software Engineer'}
          </p>
        </div>
      </div>

      {/* Candidate Details */}
      <div className="flex items-center justify-between text-[11px] text-[#45464d] pt-2 border-t border-[#eff4ff] font-medium">
        <span>{app.candidate?.total_experience_years || 5} Yrs Exp</span>
        <span>{app.candidate?.notice_period_days || 15} Days Notice</span>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-2 pt-2 border-t border-[#eff4ff]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpenMatcher(app.candidate_id, app.job_id)}
          className="flex-1 btn-3d btn-3d-glass py-1.5 text-[#006c49] font-extrabold rounded-lg text-[11px] flex items-center justify-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xs">auto_awesome</span>
          Matcher
        </button>
        
        <select
          value={app.stage}
          onChange={(e) => onStageChange(app.id, e.target.value as PipelineStage)}
          className="bg-white border border-[#c6c6cd] rounded-lg px-2 py-1 text-[11px] font-bold text-[#0b1c30] focus:outline-none focus:border-[#006c49] cursor-pointer"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
});

CandidateCard.displayName = 'CandidateCard';

export const CandidatePipeline: React.FC<CandidatePipelineProps> = React.memo(({
  onSelectCandidate,
  onOpenMatcher
}) => {
  const cachedApps = apiCache.getCached<Application[]>('pipeline');
  const cachedJobs = apiCache.getCached<Job[]>('jobs');

  const [applications, setApplications] = useState<Application[]>(cachedApps || []);
  const [jobs, setJobs] = useState<Job[]>(cachedJobs || []);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(!cachedApps);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback((forceRefresh = false) => {
    if (!cachedApps || forceRefresh) setLoading(true);
    setError(null);
    Promise.all([fetchPipeline(selectedJobId, forceRefresh), fetchJobs(forceRefresh)])
      .then(([appsRes, jobsRes]) => {
        setApplications(appsRes);
        setJobs(jobsRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Pipeline error:', err);
        setError('Failed to load candidate pipeline. Please check connection.');
        setLoading(false);
      });
  }, [selectedJobId, cachedApps]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Optimistic UI updates on stage change
  const handleStageMove = useCallback(async (appId: number, newStage: PipelineStage) => {
    const previousApplications = applications;
    // 1. Optimistically update local state immediately (< 1ms)
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, stage: newStage } : app))
    );

    try {
      // 2. Perform background update
      await updateCandidateStage(appId, newStage);
    } catch (err) {
      console.error('Failed to update pipeline stage:', err);
      // Revert on failure
      setApplications(previousApplications);
      alert('Failed to update pipeline stage. Reverting change.');
    }
  }, [applications]);

  // Memoize applications grouped by stage so we don't re-filter on every render
  const stageGroups = useMemo(() => {
    const map = new Map<string, Application[]>();
    for (const stage of STAGES) {
      map.set(stage, []);
    }
    for (const app of applications) {
      if (map.has(app.stage)) {
        map.get(app.stage)!.push(app);
      }
    }
    return map;
  }, [applications]);

  if (error && applications.length === 0) {
    return <ErrorRetryCard message={error} onRetry={() => loadData(true)} />;
  }

  if (loading && applications.length === 0) {
    return <PipelineSkeleton />;
  }

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Pipeline Header Control Bar */}
      <div className="card-3d p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006c49] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined">view_kanban</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Spatial Candidate Pipeline</h1>
            <p className="text-xs text-[#45464d] mt-0.5">Manage candidates across 7 recruitment stages with AI match signals</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl px-4 py-2 text-xs font-extrabold text-[#0b1c30] focus:outline-none focus:border-[#006c49] shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer"
            >
              <option value="">All Job Positions</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadData(true)}
            className="btn-3d btn-3d-glass p-2.5 rounded-xl text-[#006c49] cursor-pointer"
            title="Refresh Pipeline"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar min-h-[680px] items-start">
        {STAGES.map((stage) => {
          const stageApps = stageGroups.get(stage) || [];
          return (
            <div
              key={stage}
              className="w-80 shrink-0 card-3d p-4 bg-[#f4f7fc]/90 border border-[#d3e4fe] flex flex-col max-h-[760px] depth-l1"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#d3e4fe] mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-[#0b1c30] uppercase tracking-wider">{stage}</h3>
                  <span className="px-2.5 py-0.5 bg-[#131b2e] text-white text-[11px] font-black rounded-full shadow-xs">
                    {stageApps.length}
                  </span>
                </div>
              </div>

              {/* Candidate Cards Column */}
              <div className="space-y-3.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {stageApps.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-[#c6c6cd] rounded-2xl text-xs text-[#76777d] bg-white/50">
                    No candidates in {stage}
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <CandidateCard
                      key={app.id}
                      app={app}
                      onSelect={onSelectCandidate}
                      onOpenMatcher={onOpenMatcher}
                      onStageChange={handleStageMove}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

CandidatePipeline.displayName = 'CandidatePipeline';
