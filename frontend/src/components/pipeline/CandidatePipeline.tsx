import React, { useEffect, useState } from 'react';
import { fetchPipeline, updateCandidateStage, fetchJobs } from '../../services/api';
import type { Application, PipelineStage, Job } from '../../types';

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

export const CandidatePipeline: React.FC<CandidatePipelineProps> = ({
  onSelectCandidate,
  onOpenMatcher
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchPipeline(selectedJobId), fetchJobs()])
      .then(([appsRes, jobsRes]) => {
        setApplications(appsRes);
        setJobs(jobsRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Pipeline error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedJobId]);

  const handleStageMove = async (appId: number, newStage: PipelineStage) => {
    try {
      const updated = await updateCandidateStage(appId, newStage);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, stage: updated.stage } : app))
      );
    } catch (err) {
      alert('Failed to update pipeline stage.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
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
            onClick={loadData}
            className="btn-3d btn-3d-glass p-2.5 rounded-xl text-[#006c49]"
            title="Refresh Pipeline"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-[#006c49]">
            <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
            <span className="font-bold text-sm">Loading Candidate Pipeline...</span>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar min-h-[680px] items-start">
          {STAGES.map((stage) => {
            const stageApps = applications.filter((a) => a.stage === stage);
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
                      <div
                        key={app.id}
                        className="card-3d card-3d-hover p-4 space-y-3 cursor-pointer group"
                        onClick={() => onSelectCandidate(app.candidate_id)}
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
                              src={app.candidate.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                              alt={app.candidate.full_name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-[#6cf8bb] shadow-sm"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-extrabold text-[#0b1c30] truncate group-hover:text-[#006c49] transition-colors">
                              {app.candidate.full_name}
                            </h4>
                            <p className="text-[11px] text-[#45464d] truncate font-medium">
                              {app.candidate.current_role || 'Senior Software Engineer'}
                            </p>
                          </div>
                        </div>

                        {/* Candidate Details */}
                        <div className="flex items-center justify-between text-[11px] text-[#45464d] pt-2 border-t border-[#eff4ff] font-medium">
                          <span>{app.candidate.total_experience_years} Yrs Exp</span>
                          <span>{app.candidate.notice_period_days} Days Notice</span>
                        </div>

                        {/* Actions */}
                        <div
                          className="flex items-center gap-2 pt-2 border-t border-[#eff4ff]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onOpenMatcher(app.candidate_id, app.job_id)}
                            className="flex-1 btn-3d btn-3d-glass py-1.5 text-[#006c49] font-extrabold rounded-lg text-[11px] flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                            Matcher
                          </button>
                          
                          <select
                            value={app.stage}
                            onChange={(e) => handleStageMove(app.id, e.target.value as PipelineStage)}
                            className="bg-white border border-[#c6c6cd] rounded-lg px-2 py-1 text-[11px] font-bold text-[#0b1c30] focus:outline-none focus:border-[#006c49] cursor-pointer"
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
