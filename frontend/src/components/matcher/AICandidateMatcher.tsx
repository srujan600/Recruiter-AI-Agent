import React, { useEffect, useState } from 'react';
import { compareCandidateMatch, fetchCandidates, fetchJobs } from '../../services/api';
import type { Candidate, Job } from '../../types';

interface AICandidateMatcherProps {
  initialCandidateId?: number;
  initialJobId?: number;
  onNavigate: (tab: string, candidateId?: number) => void;
}

export const AICandidateMatcher: React.FC<AICandidateMatcherProps> = ({
  initialCandidateId,
  initialJobId,
  onNavigate
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(initialCandidateId || 1);
  const [selectedJobId, setSelectedJobId] = useState<number>(initialJobId || 1);
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCandidates(), fetchJobs()])
      .then(([candRes, jobsRes]) => {
        setCandidates(candRes);
        setJobs(jobsRes);
        if (!initialCandidateId && candRes.length > 0) setSelectedCandidateId(candRes[0].id);
        if (!initialJobId && jobsRes.length > 0) setSelectedJobId(jobsRes[0].id);
      })
      .catch((err) => console.error('Matcher candidates/jobs load error:', err));
  }, []);

  const runComparison = () => {
    setLoading(true);
    compareCandidateMatch(selectedCandidateId, selectedJobId)
      .then((res) => {
        setMatchData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Comparison error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedCandidateId && selectedJobId) {
      runComparison();
    }
  }, [selectedCandidateId, selectedJobId]);

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto">
      <div className="bg-white border border-[#d3e4fe] p-5 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c49]">auto_awesome</span>
            <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">AI Candidate Matcher</h1>
          </div>
          <p className="text-xs text-[#45464d] mt-0.5">Deep multi-criteria alignment evaluation</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f8f9ff] border border-[#c6c6cd] px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-bold text-[#45464d]">Candidate:</span>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[#0b1c30] focus:outline-none"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#f8f9ff] border border-[#c6c6cd] px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-bold text-[#45464d]">Target Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[#0b1c30] focus:outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={runComparison}
            className="px-4 py-2 bg-[#006c49] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#005236] transition-colors"
          >
            Re-Analyze
          </button>
        </div>
      </div>

      {loading || !matchData ? (
        <div className="p-12 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-[#006c49]">
            <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
            <span className="font-bold text-sm">Evaluating AI Candidate Match Matrix...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-[#131b2e] to-[#213145] rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6cf8bb] text-[#002113] rounded-full text-xs font-black">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>{matchData.overall_match_score}% Match Rating</span>
              </div>
              <h2 className="text-2xl font-black text-white">{matchData.candidate.full_name}</h2>
              <p className="text-xs text-[#c6c6cd]">
                Target Position: <strong className="text-white">{matchData.job.title}</strong> ({matchData.job.location})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('profile', matchData.candidate.id)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md transition-all"
              >
                View Full Profile
              </button>
              <button
                onClick={() => onNavigate('pipeline')}
                className="px-4 py-2.5 bg-[#006c49] hover:bg-[#005236] text-white font-bold rounded-xl text-xs shadow-2xs transition-all"
              >
                Shortlist Candidate →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c49]">psychology</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">AI Match Rationale</h3>
              </div>
              <p className="text-xs text-[#45464d] leading-relaxed bg-[#f8f9ff] p-4 rounded-xl border border-[#d3e4fe]">
                {matchData.ai_rationale}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#0b1c30] mb-3">Requirement vs. Candidate Breakdown</h4>
                <div className="border border-[#d3e4fe] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#eff4ff] text-[#0b1c30] font-bold">
                      <tr>
                        <th className="p-3 border-b border-[#d3e4fe]">Requirement</th>
                        <th className="p-3 border-b border-[#d3e4fe]">Candidate Value</th>
                        <th className="p-3 border-b border-[#d3e4fe]">Match Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eff4ff]">
                      {matchData.requirement_breakdown_table.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#f8f9ff]">
                          <td className="p-3 font-medium text-[#0b1c30]">{row.requirement}</td>
                          <td className="p-3 text-[#45464d]">{row.candidate_value}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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

            <div className="space-y-6">
              <div className="bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c49]">inventory_2</span>
                  <h3 className="text-sm font-bold text-[#0b1c30]">Logistical Compatibility</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe]">
                    <span className="text-[#45464d] block font-semibold">Salary Expectations vs Budget</span>
                    <span className="text-sm font-bold text-[#0b1c30] mt-0.5 block">
                      ${matchData.logistics.expected_salary.toLocaleString()} / yr
                    </span>
                    <span className="text-[10px] text-[#006c49] font-bold mt-1 block">
                      Within budget max of ${matchData.logistics.budget_max.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe]">
                    <span className="text-[#45464d] block font-semibold">Notice Period & Start Timeline</span>
                    <span className="text-sm font-bold text-[#0b1c30] mt-0.5 block">
                      {matchData.logistics.notice_period_days} Days Notice
                    </span>
                    <span className="text-[10px] text-[#006c49] font-bold mt-1 block">
                      Timeline: {matchData.logistics.target_start_date}
                    </span>
                  </div>

                  <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe]">
                    <span className="text-[#45464d] block font-semibold">Location & Work Model</span>
                    <span className="text-sm font-bold text-[#0b1c30] mt-0.5 block">
                      {matchData.logistics.location_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
