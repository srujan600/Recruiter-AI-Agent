import React, { useEffect, useState, useCallback } from 'react';
import { compareCandidateMatch, fetchCandidates, fetchJobs, updateCandidateStage, apiCache } from '../../services/api';
import type { Candidate, Job } from '../../types';
import { AIMatchScoreRing3D } from '../common/AIMatchScoreRing3D';
import { CandidateProfileSkeleton, ErrorRetryCard } from '../common/Skeletons';

interface AICandidateMatcherProps {
  initialCandidateId?: number;
  initialJobId?: number;
  onNavigate: (tab: string, candidateId?: number) => void;
}

export const AICandidateMatcher: React.FC<AICandidateMatcherProps> = React.memo(({
  initialCandidateId,
  initialJobId,
  onNavigate
}) => {
  const cachedCandidates = apiCache.getCached<Candidate[]>('candidates') || [];
  const cachedJobs = apiCache.getCached<Job[]>('jobs') || [];

  const [candidates, setCandidates] = useState<Candidate[]>(cachedCandidates);
  const [jobs, setJobs] = useState<Job[]>(cachedJobs);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(initialCandidateId || 1);
  const [selectedJobId, setSelectedJobId] = useState<number>(initialJobId || 1);

  const cacheKey = `matcher_${selectedCandidateId}_${selectedJobId}`;
  const cachedMatch = apiCache.getCached<any>(cacheKey);

  const [matchData, setMatchData] = useState<any>(cachedMatch || null);
  const [loading, setLoading] = useState<boolean>(!cachedMatch);
  const [error, setError] = useState<string | null>(null);

  // Load initial dropdowns if not in cache
  useEffect(() => {
    if (candidates.length === 0 || jobs.length === 0) {
      Promise.all([fetchCandidates(), fetchJobs()])
        .then(([candRes, jobsRes]) => {
          setCandidates(candRes);
          setJobs(jobsRes);
          if (!initialCandidateId && candRes.length > 0) setSelectedCandidateId(candRes[0].id);
          if (!initialJobId && jobsRes.length > 0) setSelectedJobId(jobsRes[0].id);
        })
        .catch((err) => console.error('Matcher candidates/jobs load error:', err));
    }
  }, [candidates.length, jobs.length, initialCandidateId, initialJobId]);

  const runComparison = useCallback((forceRefresh = false) => {
    const currentCached = apiCache.getCached<any>(`matcher_${selectedCandidateId}_${selectedJobId}`);
    if (!currentCached || forceRefresh) {
      setLoading(true);
    }
    setError(null);
    compareCandidateMatch(selectedCandidateId, selectedJobId, forceRefresh)
      .then((res) => {
        setMatchData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Comparison error:', err);
        setError('Failed to evaluate candidate match.');
        setLoading(false);
      });
  }, [selectedCandidateId, selectedJobId]);

  useEffect(() => {
    if (selectedCandidateId && selectedJobId) {
      runComparison();
    }
  }, [selectedCandidateId, selectedJobId, runComparison]);

  const handleShortlist = async () => {
    if (!matchData?.candidate) return;
    try {
      await updateCandidateStage(matchData.candidate.id, 'Shortlisted');
      onNavigate('pipeline');
    } catch (e) {
      console.error(e);
      alert('Failed to shortlist candidate.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-200">
      {/* Matcher Header Controls */}
      <div className="card-3d p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006c49] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">AI Spatial Candidate Matcher</h1>
            <p className="text-xs text-[#45464d] mt-0.5">Deep multi-criteria alignment and matrix evaluation</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f4f7fc] border border-[#c6c6cd] px-3.5 py-2 rounded-xl inset-depth">
            <span className="text-[11px] font-extrabold text-[#45464d]">Candidate:</span>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[#0b1c30] focus:outline-none cursor-pointer"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#f4f7fc] border border-[#c6c6cd] px-3.5 py-2 rounded-xl inset-depth">
            <span className="text-[11px] font-extrabold text-[#45464d]">Target Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[#0b1c30] focus:outline-none cursor-pointer"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => runComparison(true)}
            className="btn-3d btn-3d-emerald px-4 py-2 text-xs font-extrabold rounded-xl cursor-pointer"
          >
            Re-Analyze
          </button>
        </div>
      </div>

      {error && !matchData ? (
        <ErrorRetryCard message={error} onRetry={() => runComparison(true)} />
      ) : loading && !matchData ? (
        <CandidateProfileSkeleton />
      ) : matchData ? (
        <>
          {/* 3D Circular Match Score Component */}
          <AIMatchScoreRing3D score={matchData.overall_match_score} />

          {/* Candidate Action Sub-bar */}
          <div className="card-3d p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0b1c30]">{matchData.candidate.full_name}</h2>
              <p className="text-xs text-[#45464d] mt-0.5">
                Target Position: <strong className="text-[#006c49]">{matchData.job.title}</strong> ({matchData.job.location})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('profile', matchData.candidate.id)}
                className="btn-3d btn-3d-glass px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                View Full Profile
              </button>
              <button
                onClick={handleShortlist}
                className="btn-3d btn-3d-emerald px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Shortlist Candidate →
              </button>
            </div>
          </div>

          {/* Main Matrix Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-3d p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c49] text-xl">psychology</span>
                <h3 className="text-sm font-extrabold text-[#0b1c30]">AI Match Rationale</h3>
              </div>
              <p className="text-xs text-[#45464d] leading-relaxed bg-[#f8f9ff] p-4 rounded-xl border border-[#d3e4fe] inset-depth font-medium">
                {matchData.ai_rationale}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-extrabold text-[#0b1c30] mb-3">Requirement vs. Candidate Alignment Table</h4>
                <div className="border border-[#d3e4fe] rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#eff4ff] text-[#0b1c30] font-bold">
                      <tr>
                        <th className="p-3.5 border-b border-[#d3e4fe]">Requirement</th>
                        <th className="p-3.5 border-b border-[#d3e4fe]">Candidate Profile Value</th>
                        <th className="p-3.5 border-b border-[#d3e4fe]">Match Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eff4ff]">
                      {matchData.requirement_breakdown_table?.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#f8f9ff] transition-colors">
                          <td className="p-3.5 font-bold text-[#0b1c30]">{row.requirement}</td>
                          <td className="p-3.5 text-[#45464d] font-medium">{row.candidate_value}</td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black shadow-2xs ${
                              row.is_matched
                                ? 'bg-[#6cf8bb] text-[#002113]'
                                : 'bg-[#ffdad6] text-[#93000a]'
                            }`}>
                              <span className="material-symbols-outlined text-xs">
                                {row.is_matched ? 'check_circle' : 'warning'}
                              </span>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Logistical Metrics */}
            <div className="space-y-6">
              <div className="card-3d p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c49]">inventory_2</span>
                  <h3 className="text-sm font-extrabold text-[#0b1c30]">Logistical Compatibility</h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe] inset-depth space-y-1">
                    <span className="text-[#45464d] block font-bold text-[11px]">Salary Expectation vs Budget</span>
                    <span className="text-base font-black text-[#0b1c30] block">
                      ${matchData.logistics.expected_salary?.toLocaleString()} / yr
                    </span>
                    <span className="text-[10px] text-[#006c49] font-extrabold block">
                      Within budget max of ${matchData.logistics.budget_max?.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe] inset-depth space-y-1">
                    <span className="text-[#45464d] block font-bold text-[11px]">Notice Period & Start Timeline</span>
                    <span className="text-base font-black text-[#0b1c30] block">
                      {matchData.logistics.notice_period_days} Days Notice
                    </span>
                    <span className="text-[10px] text-[#006c49] font-extrabold block">
                      Target Start: {matchData.logistics.target_start_date}
                    </span>
                  </div>

                  <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe] inset-depth space-y-1">
                    <span className="text-[#45464d] block font-bold text-[11px]">Location & Work Model</span>
                    <span className="text-base font-black text-[#0b1c30] block">
                      {matchData.logistics.location_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
});

AICandidateMatcher.displayName = 'AICandidateMatcher';
