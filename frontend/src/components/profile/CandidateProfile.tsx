import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { fetchCandidateDetail, fetchScreeningResult, updateCandidateStage, apiCache } from '../../services/api';
import type { Candidate, ScreeningResult } from '../../types';
import { CandidateProfileSkeleton, ErrorRetryCard } from '../common/Skeletons';

// Lazy-load Three.js & Fiber 3D spatial node only when spatial tab is selected
const CandidateSpatialNodePreview = React.lazy(
  () => import('../candidate/CandidateSpatialNodePreview')
);

interface CandidateProfileProps {
  candidateId: number;
  onBack: () => void;
  onOpenMatcher: (candidateId: number, jobId: number) => void;
}

export const CandidateProfile: React.FC<CandidateProfileProps> = React.memo(({
  candidateId,
  onBack,
  onOpenMatcher
}) => {
  const cachedCand = apiCache.getCached<Candidate>(`candidate_${candidateId}`);
  const cachedScreening = apiCache.getCached<ScreeningResult>(`screening_${candidateId}`);

  const [candidate, setCandidate] = useState<Candidate | null>(cachedCand || null);
  const [screening, setScreening] = useState<ScreeningResult | null>(cachedScreening || null);
  const [activeTab, setActiveTab] = useState<'screening' | 'spatial' | 'resume' | 'experience' | 'notes'>('screening');
  const [loading, setLoading] = useState<boolean>(!cachedCand);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback((forceRefresh = false) => {
    if (!cachedCand || forceRefresh) setLoading(true);
    setError(null);
    Promise.all([
      fetchCandidateDetail(candidateId, forceRefresh),
      fetchScreeningResult(candidateId, forceRefresh)
    ])
      .then(([candRes, screenRes]) => {
        setCandidate(candRes);
        setScreening(screenRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Candidate profile load error:', err);
        setError('Failed to load candidate profile details.');
        setLoading(false);
      });
  }, [candidateId, cachedCand]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShortlist = async () => {
    if (!candidate) return;
    try {
      await updateCandidateStage(candidate.id, 'Shortlisted');
      alert(`Candidate ${candidate.full_name} moved to Shortlisted stage!`);
      onBack();
    } catch (e) {
      console.error(e);
      alert('Failed to shortlist candidate.');
    }
  };

  if (error && !candidate) {
    return <ErrorRetryCard message={error} onRetry={() => loadData(true)} />;
  }

  if (loading && !candidate) {
    return <CandidateProfileSkeleton />;
  }

  if (!candidate) return null;

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-200">
      {/* Back Link & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#006c49] hover:underline btn-3d btn-3d-glass px-3 py-1.5 rounded-xl cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Pipeline</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('spatial')}
            className={`btn-3d px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'spatial' 
                ? 'bg-[#131b2e] text-[#6cf8bb] border border-[#6cf8bb]' 
                : 'btn-3d-glass text-[#006c49]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">view_in_ar</span>
            3D Spatial Node
          </button>
          <button
            onClick={() => onOpenMatcher(candidate.id, 1)}
            className="btn-3d btn-3d-glass px-4 py-2 text-xs font-extrabold text-[#006c49] flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Open AI Matcher
          </button>
          <button
            onClick={handleShortlist}
            className="btn-3d btn-3d-emerald px-4 py-2 text-xs font-extrabold cursor-pointer"
          >
            Shortlist Candidate
          </button>
        </div>
      </div>

      {/* 3D Elevated Candidate Hero Card */}
      <div className="card-3d p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={candidate.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
              alt={candidate.full_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#6cf8bb] shadow-md"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#6cf8bb] border-2 border-white rounded-full" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#0b1c30] tracking-tight">{candidate.full_name}</h1>
              <span className="px-2.5 py-0.5 bg-[#eff4ff] text-[#006c49] font-extrabold text-xs rounded-full border border-[#d3e4fe]">
                Senior Candidate
              </span>
            </div>
            <p className="text-xs text-[#45464d] font-bold">
              {candidate.current_role || 'Senior Frontend Engineer'} • {candidate.current_company || 'TechFlow Systems'}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#76777d] pt-1">
              <span className="flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-sm text-[#006c49]">location_on</span>
                {candidate.location}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-sm text-[#006c49]">mail</span>
                {candidate.email}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-sm text-[#006c49]">call</span>
                {candidate.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Scores Box */}
        <div className="flex items-center gap-4 bg-[#f8f9ff] p-4 rounded-2xl border border-[#d3e4fe] inset-depth">
          <div className="text-center px-4 border-r border-[#c6c6cd]">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#6cf8bb] text-[#002113] rounded-full text-xs font-black shadow-xs">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              <span>{screening?.overall_match_score || 94}%</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#45464d] block mt-1">AI Match Score</span>
          </div>

          <div className="text-center px-4">
            <span className="text-xl font-black text-[#0b1c30] block">{screening?.ats_score || 92}%</span>
            <span className="text-[10px] font-extrabold text-[#45464d] block mt-1">ATS Parser Score</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#d3e4fe] flex items-center gap-8 text-xs font-bold">
        {[
          { id: 'screening', label: 'AI Screening Summary', icon: 'psychology' },
          { id: 'spatial', label: '3D Spatial Node', icon: 'view_in_ar' },
          { id: 'resume', label: 'Resume Preview', icon: 'description' },
          { id: 'experience', label: 'Work Experience', icon: 'work' },
          { id: 'notes', label: 'Notes & Timeline', icon: 'edit_note' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-b-2 border-[#006c49] text-[#006c49] font-extrabold'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3D Spatial Node Tab (Lazy Loaded with Suspense) */}
      {activeTab === 'spatial' && (
        <Suspense
          fallback={
            <div className="card-3d p-16 text-center text-xs text-[#006c49] font-bold flex items-center justify-center gap-3">
              <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
              <span>Loading 3D Spatial Node Canvas & Shaders...</span>
            </div>
          }
        >
          <CandidateSpatialNodePreview
            candidate={candidate}
            screening={screening}
            onOpenMatcher={() => onOpenMatcher(candidate.id, 1)}
          />
        </Suspense>
      )}

      {/* Screening Tab */}
      {activeTab === 'screening' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-3d p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c49]">check_circle</span>
                <h3 className="text-sm font-extrabold text-[#0b1c30]">Key Technical Strengths</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#0b1c30]">
                {screening?.key_strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#eff4ff] p-3 rounded-xl border border-[#d3e4fe] font-semibold">
                    <span className="material-symbols-outlined text-[#006c49] text-base shrink-0 mt-0.5">verified</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-3d p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
                <h3 className="text-sm font-extrabold text-[#0b1c30]">Missing Skills & Preferred Gaps</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#0b1c30]">
                {screening?.missing_skills.map((msg, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#ffdad6] p-3 rounded-xl border border-[#ba1a1a]/30 font-semibold">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-base shrink-0 mt-0.5">info</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card-3d p-6 bg-gradient-to-br from-[#131b2e] to-[#1b263e] text-white shadow-xl space-y-4 flex flex-col justify-between border border-[#6cf8bb]/30">
            <div>
              <div className="flex items-center gap-2 text-[#6cf8bb]">
                <span className="material-symbols-outlined text-xl animate-pulse">auto_awesome</span>
                <h3 className="text-xs font-black uppercase tracking-wider">AI Match Rationale</h3>
              </div>
              <p className="text-xs text-[#c6c6cd] mt-3 leading-relaxed font-medium">
                {screening?.ai_rationale}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#c6c6cd]">
                <span>Skill Alignment:</span>
                <span className="font-extrabold text-white">{screening?.skill_match_score}%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#c6c6cd]">
                <span>Experience Alignment:</span>
                <span className="font-extrabold text-white">{screening?.experience_match_score}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Elevated Resume Viewer Surface */}
      {activeTab === 'resume' && (
        <div className="space-y-4">
          {/* Floating Document Toolbar */}
          <div className="card-3d p-4 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#006c49] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-sm">description</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#0b1c30]">{candidate.full_name}_Resume_2026.pdf</h3>
                <span className="text-[10px] text-[#006c49] font-bold">Parsed & AI Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button className="btn-3d btn-3d-glass px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold cursor-pointer">
                <span className="material-symbols-outlined text-xs">zoom_in</span> Zoom
              </button>
              <button className="btn-3d btn-3d-emerald px-3.5 py-1.5 rounded-lg flex items-center gap-1 font-bold text-white cursor-pointer">
                <span className="material-symbols-outlined text-xs">download</span> Download PDF
              </button>
            </div>
          </div>

          {/* Elevated Paper Sheet Surface */}
          <div className="card-3d p-8 bg-white border border-[#c6c6cd] shadow-2xl font-mono text-xs text-[#0b1c30] leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-4 right-4 px-3 py-1 bg-[#eff4ff] border border-[#d3e4fe] rounded-full text-[10px] font-bold text-[#006c49] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              AI Highlighted Resume Surface
            </div>

            <div className="whitespace-pre-wrap font-mono text-xs text-[#0b1c30] space-y-4">
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
        </div>
      )}

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <div className="card-3d p-6 space-y-6">
          <h3 className="text-sm font-extrabold text-[#0b1c30]">Work Experience & History</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe] inset-depth">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-[#0b1c30]">Senior Frontend Engineer</h4>
                  <p className="text-[11px] text-[#006c49] font-extrabold">TechFlow Systems</p>
                </div>
                <span className="text-[11px] text-[#76777d] font-bold">2021 – Present</span>
              </div>
              <p className="text-xs text-[#45464d] mt-2 font-medium">
                Led frontend architecture using React, TypeScript, and Tailwind CSS. Reduced bundle size by 35%.
              </p>
            </div>

            <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe] inset-depth">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-[#0b1c30]">Frontend Developer</h4>
                  <p className="text-[11px] text-[#006c49] font-extrabold">DataPulse Inc.</p>
                </div>
                <span className="text-[11px] text-[#76777d] font-bold">2018 – 2021</span>
              </div>
              <p className="text-xs text-[#45464d] mt-2 font-medium">
                Developed responsive web dashboards and optimized real-time data feeds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="card-3d p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-[#0b1c30]">Recruiter Notes</h3>
          <textarea
            placeholder="Add a private note about Alexander Chen..."
            className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3.5 text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49] inset-depth font-medium"
            rows={4}
          />
          <button className="btn-3d btn-3d-emerald px-4 py-2 text-xs font-extrabold rounded-xl cursor-pointer">
            Save Note
          </button>
        </div>
      )}
    </div>
  );
});

CandidateProfile.displayName = 'CandidateProfile';
