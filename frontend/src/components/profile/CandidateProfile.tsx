import React, { useEffect, useState } from 'react';
import { fetchCandidateDetail, fetchScreeningResult } from '../../services/api';
import type { Candidate, ScreeningResult } from '../../types';

interface CandidateProfileProps {
  candidateId: number;
  onBack: () => void;
  onOpenMatcher: (candidateId: number, jobId: number) => void;
}

export const CandidateProfile: React.FC<CandidateProfileProps> = ({
  candidateId,
  onBack,
  onOpenMatcher
}) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [screening, setScreening] = useState<ScreeningResult | null>(null);
  const [activeTab, setActiveTab] = useState<'screening' | 'resume' | 'experience' | 'notes'>('screening');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCandidateDetail(candidateId), fetchScreeningResult(candidateId)])
      .then(([candRes, screenRes]) => {
        setCandidate(candRes);
        setScreening(screenRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Candidate profile load error:', err);
        setLoading(false);
      });
  }, [candidateId]);

  if (loading || !candidate) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[500px]">
        <div className="flex items-center gap-3 text-[#006c49]">
          <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
          <span className="font-bold text-sm">Loading Candidate Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#006c49] hover:underline"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Pipeline
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenMatcher(candidate.id, 1)}
            className="px-3.5 py-2 bg-[#eff4ff] hover:bg-[#d3e4fe] text-[#006c49] border border-[#d3e4fe] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Open AI Matcher
          </button>
          <button className="px-3.5 py-2 bg-[#006c49] hover:bg-[#005236] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors">
            Shortlist Candidate
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={candidate.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
            alt={candidate.full_name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#6cf8bb] shadow-xs"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#0b1c30] tracking-tight">{candidate.full_name}</h1>
              <span className="px-2.5 py-0.5 bg-[#eff4ff] text-[#006c49] font-bold text-xs rounded-full border border-[#d3e4fe]">
                Senior Candidate
              </span>
            </div>
            <p className="text-xs text-[#45464d] mt-1 font-medium">
              {candidate.current_role || 'Senior Frontend Engineer'} • {candidate.current_company || 'TechFlow Systems'}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#76777d] mt-2">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {candidate.location}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">mail</span>
                {candidate.email}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">call</span>
                {candidate.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#f8f9ff] p-4 rounded-2xl border border-[#d3e4fe]">
          <div className="text-center px-4 border-r border-[#c6c6cd]">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#6cf8bb] text-[#002113] rounded-full text-xs font-black">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              <span>{screening?.overall_match_score || 94}%</span>
            </div>
            <span className="text-[10px] font-bold text-[#45464d] block mt-1">AI Match Score</span>
          </div>

          <div className="text-center px-4">
            <span className="text-xl font-black text-[#0b1c30] block">{screening?.ats_score || 92}%</span>
            <span className="text-[10px] font-bold text-[#45464d] block mt-1">ATS Parser Score</span>
          </div>
        </div>
      </div>

      <div className="border-b border-[#d3e4fe] flex items-center gap-8 text-xs font-bold">
        {[
          { id: 'screening', label: 'AI Screening Summary', icon: 'psychology' },
          { id: 'resume', label: 'Resume Preview', icon: 'description' },
          { id: 'experience', label: 'Work Experience', icon: 'work' },
          { id: 'notes', label: 'Notes & Timeline', icon: 'edit_note' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-[#006c49] text-[#006c49]'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'screening' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c49]">check_circle</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">Key Technical Strengths</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#0b1c30]">
                {screening?.key_strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#eff4ff] p-3 rounded-xl border border-[#d3e4fe]">
                    <span className="material-symbols-outlined text-[#006c49] text-base shrink-0 mt-0.5">verified</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">Missing Skills & Preferred Gaps</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#0b1c30]">
                {screening?.missing_skills.map((msg, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#ffdad6] p-3 rounded-xl border border-[#ba1a1a]/30">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-base shrink-0 mt-0.5">info</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#131b2e] text-white rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#6cf8bb]">
                <span className="material-symbols-outlined">auto_awesome</span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider">AI Match Rationale</h3>
              </div>
              <p className="text-xs text-[#c6c6cd] mt-3 leading-relaxed">
                {screening?.ai_rationale}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#c6c6cd]">
                <span>Skill Alignment:</span>
                <span className="font-bold text-white">{screening?.skill_match_score}%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#c6c6cd]">
                <span>Experience Alignment:</span>
                <span className="font-bold text-white">{screening?.experience_match_score}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resume' && (
        <div className="bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
            <h3 className="text-sm font-bold text-[#0b1c30]">Parsed Resume Document</h3>
            <span className="text-xs font-semibold text-[#006c49]">PDF Verified</span>
          </div>
          <div className="bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-6 font-mono text-xs text-[#0b1c30] whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
            {`ALEXANDER CHEN
Senior Frontend Engineer | San Francisco, CA
alexander.chen@example.com | +1 (555) 234-5678

SUMMARY:
Results-driven Senior Frontend Engineer with 6.5+ years of experience building high-performance web applications using React, TypeScript, and modern design systems.

WORK EXPERIENCE:
Senior Frontend Engineer — TechFlow Systems (2021 - Present)
- Led frontend platform architecture, optimizing Core Web Vitals score from 68 to 94.
- Engineered reusable React component library adopted across 14 internal engineering teams.
- Mentored junior engineers and conducted technical system design interviews.

Frontend Developer — DataPulse Inc. (2018 - 2021)
- Developed real-time analytics dashboard interfaces using TypeScript and Tailwind CSS.
- Integrated WebSocket feeds for live transaction data visualization.

EDUCATION:
B.S. in Computer Science — University of California, Berkeley (2018)`}
          </div>
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs space-y-6">
          <h3 className="text-sm font-bold text-[#0b1c30]">Work Experience & History</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe]">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-[#0b1c30]">Senior Frontend Engineer</h4>
                  <p className="text-[11px] text-[#006c49] font-semibold">TechFlow Systems</p>
                </div>
                <span className="text-[11px] text-[#76777d]">2021 – Present</span>
              </div>
              <p className="text-xs text-[#45464d] mt-2">
                Led frontend architecture using React, TypeScript, and Tailwind CSS. Reduced bundle size by 35%.
              </p>
            </div>

            <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe]">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-[#0b1c30]">Frontend Developer</h4>
                  <p className="text-[11px] text-[#006c49] font-semibold">DataPulse Inc.</p>
                </div>
                <span className="text-[11px] text-[#76777d]">2018 – 2021</span>
              </div>
              <p className="text-xs text-[#45464d] mt-2">
                Developed responsive web dashboards and optimized real-time data feeds.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#0b1c30]">Recruiter Notes</h3>
          <textarea
            placeholder="Add a private note about Alexander Chen..."
            className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49]"
            rows={4}
          ></textarea>
          <button className="px-4 py-2 bg-[#006c49] text-white text-xs font-bold rounded-xl shadow-2xs">
            Save Note
          </button>
        </div>
      )}
    </div>
  );
};
