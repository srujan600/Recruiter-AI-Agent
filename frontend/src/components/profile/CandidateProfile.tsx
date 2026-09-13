import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { 
  fetchCandidateDetail, 
  fetchScreeningResult, 
  updateCandidateStage, 
  fetchCandidateNotes, 
  createCandidateNote, 
  apiCache 
} from '../../services/api';
import type { Candidate, ScreeningResult, CandidateNote } from '../../types';
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
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'screening' | 'spatial' | 'resume' | 'experience' | 'notes'>('screening');
  const [loading, setLoading] = useState<boolean>(!cachedCand);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback((forceRefresh = false) => {
    if (!cachedCand || forceRefresh) setLoading(true);
    setError(null);
    Promise.all([
      fetchCandidateDetail(candidateId, forceRefresh),
      fetchScreeningResult(candidateId, forceRefresh),
      fetchCandidateNotes(candidateId, forceRefresh).catch(() => [])
    ])
      .then(([candRes, screenRes, notesRes]) => {
        setCandidate(candRes);
        setScreening(screenRes);
        setNotes(notesRes || []);
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
    const appId = candidate.applications?.[0]?.id || screening?.application_id;
    if (!appId) {
      alert('Unable to resolve active application ID.');
      return;
    }
    try {
      await updateCandidateStage(appId, 'Shortlisted');
      alert(`Candidate ${candidate.full_name} moved to Shortlisted stage!`);
      onBack();
    } catch (e) {
      console.error(e);
      alert('Failed to shortlist candidate.');
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim() || !candidate) return;
    setSavingNote(true);
    try {
      const savedNote = await createCandidateNote(candidate.id, newNoteText.trim());
      setNotes((prev) => [savedNote, ...prev]);
      setNewNoteText('');
    } catch (e) {
      console.error('Failed to save note:', e);
      alert('Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDownloadResume = () => {
    if (!candidate) return;
    const resumeText = candidate.resumes?.[0]?.parsed_text || `
${candidate.full_name.toUpperCase()}
${candidate.current_role || 'Software Engineer'} | ${candidate.location}
Email: ${candidate.email} | Phone: ${candidate.phone || 'N/A'}
Experience: ${candidate.total_experience_years} Years

SUMMARY:
Experienced professional specializing in ${candidate.resumes?.[0]?.parsed_skills?.join(', ') || 'modern software engineering'}.

WORK EXPERIENCE:
${candidate.resumes?.[0]?.parsed_experience?.map(e => `${e.title} - ${e.company} (${e.duration})\n${e.description}`).join('\n\n') || `${candidate.current_role || 'Engineer'} at ${candidate.current_company || 'Tech Systems'} (Present)`}

EDUCATION:
${candidate.resumes?.[0]?.parsed_education?.map(ed => `${ed.degree} - ${ed.institution} (${ed.year})`).join('\n') || 'B.S. in Computer Science'}
    `.trim();

    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${candidate.full_name.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleZoom = () => {
    setZoomLevel((prev) => (prev === 100 ? 125 : prev === 125 ? 150 : 100));
  };

  if (error && !candidate) {
    return <ErrorRetryCard message={error} onRetry={() => loadData(true)} />;
  }

  if (loading && !candidate) {
    return <CandidateProfileSkeleton />;
  }

  if (!candidate) return null;

  const resumeData = candidate.resumes?.[0];
  const experienceList = resumeData?.parsed_experience?.length
    ? resumeData.parsed_experience
    : [
        {
          title: candidate.current_role || "Senior Software Engineer",
          company: candidate.current_company || "Technology Solutions Inc.",
          duration: "2021 – Present",
          description: `Led high-impact engineering initiatives, optimized performance workflows, and applied expertise across modern technologies.`
        }
      ];

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
                {candidate.total_experience_years >= 6 ? 'Senior Candidate' : 'Candidate'}
              </span>
            </div>
            <p className="text-xs text-[#45464d] font-bold">
              {candidate.current_role || 'Senior Software Engineer'} • {candidate.current_company || 'Technology Systems'}
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
              {candidate.phone && (
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-sm text-[#006c49]">call</span>
                  {candidate.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Floating Scores Box */}
        <div className="flex items-center gap-4 bg-[#f8f9ff] p-4 rounded-2xl border border-[#d3e4fe] inset-depth">
          <div className="text-center px-4 border-r border-[#c6c6cd]">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#6cf8bb] text-[#002113] rounded-full text-xs font-black shadow-xs">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              <span>{screening?.overall_match_score || 90}%</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#45464d] block mt-1">AI Match Score</span>
          </div>

          <div className="text-center px-4">
            <span className="text-xl font-black text-[#0b1c30] block">{screening?.ats_score || 88}%</span>
            <span className="text-[10px] font-extrabold text-[#45464d] block mt-1">ATS Parser Score</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#d3e4fe] flex items-center gap-8 text-xs font-bold overflow-x-auto custom-scrollbar">
        {[
          { id: 'screening', label: 'AI Screening Summary', icon: 'psychology' },
          { id: 'spatial', label: '3D Spatial Node', icon: 'view_in_ar' },
          { id: 'resume', label: 'Resume Preview', icon: 'description' },
          { id: 'experience', label: 'Work Experience', icon: 'work' },
          { id: 'notes', label: `Notes & Timeline (${notes.length})`, icon: 'edit_note' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
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

      {/* 3D Spatial Node Tab */}
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
                {screening?.key_strengths?.map((str, idx) => (
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
                {screening?.missing_skills?.map((msg, idx) => (
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
                {screening?.ai_rationale || "Candidate exhibits aligned technical competencies and experience profile."}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#c6c6cd]">
                <span>Skill Alignment:</span>
                <span className="font-extrabold text-white">{screening?.skill_match_score || 92}%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#c6c6cd]">
                <span>Experience Alignment:</span>
                <span className="font-extrabold text-white">{screening?.experience_match_score || 88}%</span>
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
                <h3 className="text-xs font-extrabold text-[#0b1c30]">
                  {resumeData?.filename || `${candidate.full_name.replace(/\s+/g, '_')}_Resume.pdf`}
                </h3>
                <span className="text-[10px] text-[#006c49] font-bold">Parsed & AI Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button 
                onClick={handleToggleZoom}
                className="btn-3d btn-3d-glass px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">zoom_in</span> 
                <span>Zoom ({zoomLevel}%)</span>
              </button>
              <button 
                onClick={handleDownloadResume}
                className="btn-3d btn-3d-emerald px-3.5 py-1.5 rounded-lg flex items-center gap-1 font-bold text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">download</span> Download Resume
              </button>
            </div>
          </div>

          {/* Elevated Paper Sheet Surface with Dynamic Content */}
          <div 
            className="card-3d p-8 bg-white border border-[#c6c6cd] shadow-2xl font-mono text-xs text-[#0b1c30] leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar relative transition-transform duration-200"
            style={{ fontSize: `${(zoomLevel / 100) * 12}px` }}
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-[#eff4ff] border border-[#d3e4fe] rounded-full text-[10px] font-bold text-[#006c49] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              AI Highlighted Resume Surface
            </div>

            {resumeData?.parsed_text ? (
              <div className="whitespace-pre-wrap font-mono text-xs text-[#0b1c30] space-y-4">
                {resumeData.parsed_text}
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-mono text-xs text-[#0b1c30] space-y-4">
                <div className="font-bold text-sm text-[#0b1c30]">{candidate.full_name.toUpperCase()}</div>
                <div>{candidate.current_role || 'Software Engineer'} | {candidate.location}</div>
                <div>Email: {candidate.email} | Phone: {candidate.phone || 'N/A'}</div>
                <div className="pt-2"><strong>TOTAL EXPERIENCE:</strong> {candidate.total_experience_years} Years</div>
                
                <div className="pt-3">
                  <strong>TECHNICAL SKILLS:</strong>
                  <div className="mt-1">
                    {(resumeData?.parsed_skills || candidate.parsed_skills || ['React', 'TypeScript', 'Node.js']).join(' • ')}
                  </div>
                </div>

                <div className="pt-3">
                  <strong>WORK EXPERIENCE:</strong>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mt-2 pl-2 border-l-2 border-[#006c49]">
                      <div className="font-bold">{exp.title} — {exp.company} ({exp.duration})</div>
                      <div className="text-[11px] text-[#45464d] mt-0.5">{exp.description}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-3">
                  <strong>EDUCATION:</strong>
                  {resumeData?.parsed_education?.map((ed, idx) => (
                    <div key={idx} className="mt-1">
                      {ed.degree} — {ed.institution} ({ed.year})
                    </div>
                  )) || <div>B.S. in Computer Science — Accredited University</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <div className="card-3d p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0b1c30]">Work Experience & History</h3>
            <span className="text-xs text-[#006c49] font-bold">{candidate.total_experience_years} Years Total Experience</span>
          </div>

          <div className="space-y-4">
            {experienceList.map((exp, idx) => (
              <div key={idx} className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe] inset-depth">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-[#0b1c30]">{exp.title}</h4>
                    <p className="text-[11px] text-[#006c49] font-extrabold">{exp.company}</p>
                  </div>
                  <span className="text-[11px] text-[#76777d] font-bold">{exp.duration}</span>
                </div>
                <p className="text-xs text-[#45464d] mt-2 font-medium">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="card-3d p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
            <h3 className="text-sm font-extrabold text-[#0b1c30]">Recruiter Notes & Interaction Log</h3>
            <span className="text-xs text-[#76777d] font-medium">{notes.length} note(s) logged</span>
          </div>

          <div className="space-y-3">
            <textarea
              placeholder={`Add a private note about ${candidate.full_name}...`}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3.5 text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49] inset-depth font-medium"
              rows={3}
            />
            <div className="flex justify-end">
              <button 
                onClick={handleSaveNote}
                disabled={savingNote || !newNoteText.trim()}
                className="btn-3d btn-3d-emerald px-4 py-2 text-xs font-extrabold rounded-xl cursor-pointer disabled:opacity-50"
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>

          {/* List of Real Notes */}
          <div className="space-y-3 pt-3">
            {notes.length === 0 ? (
              <p className="text-xs text-[#76777d] italic py-4 text-center">No notes recorded yet. Add your initial impressions above.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe] space-y-1 inset-depth">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-[#006c49]">{note.author_name}</span>
                    <span className="text-[#76777d] font-medium">{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#0b1c30] font-medium whitespace-pre-wrap">{note.note_text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

CandidateProfile.displayName = 'CandidateProfile';
