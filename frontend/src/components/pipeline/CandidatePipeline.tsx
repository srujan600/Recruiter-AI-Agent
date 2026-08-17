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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#d3e4fe] shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Candidate Pipeline</h1>
          <p className="text-xs text-[#45464d] mt-0.5">Manage candidates across recruitment stages</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl px-4 py-2 text-xs font-bold text-[#0b1c30] focus:outline-none focus:border-[#006c49]"
            >
              <option value="">All Job Positions</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            className="p-2 text-[#006c49] hover:bg-[#eff4ff] rounded-xl border border-[#d3e4fe] transition-colors"
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
        <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar min-h-[650px] items-start">
          {STAGES.map((stage) => {
            const stageApps = applications.filter((a) => a.stage === stage);
            return (
              <div
                key={stage}
                className="w-80 shrink-0 bg-[#eff4ff] border border-[#d3e4fe] rounded-2xl p-4 flex flex-col max-h-[750px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#d3e4fe] mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">{stage}</h3>
                    <span className="px-2 py-0.5 bg-[#131b2e] text-white text-[11px] font-bold rounded-full">
                      {stageApps.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {stageApps.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-[#c6c6cd] rounded-xl text-xs text-[#76777d]">
                      No candidates in {stage}
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white border border-[#d3e4fe] hover:border-[#006c49] p-4 rounded-xl shadow-2xs space-y-3 transition-all cursor-pointer group"
                        onClick={() => onSelectCandidate(app.candidate_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#6cf8bb] text-[#002113] rounded-lg text-xs font-black">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            <span>{app.match_score}% Match</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#45464d] bg-[#f8f9ff] px-2 py-0.5 rounded-md border border-[#c6c6cd]">
                            ATS: {app.ats_score}%
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={app.candidate.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                            alt={app.candidate.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-[#d3e4fe]"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-[#0b1c30] truncate group-hover:text-[#006c49]">
                              {app.candidate.full_name}
                            </h4>
                            <p className="text-[11px] text-[#45464d] truncate">
                              {app.candidate.current_role || 'Senior Software Engineer'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#45464d] pt-1 border-t border-[#eff4ff]">
                          <span>{app.candidate.total_experience_years} Yrs Exp</span>
                          <span>{app.candidate.notice_period_days} Days Notice</span>
                        </div>

                        <div
                          className="flex items-center gap-2 pt-2 border-t border-[#eff4ff]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onOpenMatcher(app.candidate_id, app.job_id)}
                            className="flex-1 py-1.5 bg-[#eff4ff] hover:bg-[#d3e4fe] text-[#006c49] font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                            Matcher
                          </button>
                          
                          <select
                            value={app.stage}
                            onChange={(e) => handleStageMove(app.id, e.target.value as PipelineStage)}
                            className="bg-white border border-[#c6c6cd] rounded-lg px-2 py-1.5 text-[11px] font-bold text-[#0b1c30] focus:outline-none focus:border-[#006c49]"
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
