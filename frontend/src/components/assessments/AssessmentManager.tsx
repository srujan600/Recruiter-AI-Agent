import React, { useEffect, useState } from 'react';
import { fetchAssessments, assignAssessment, fetchPipeline } from '../../services/api';
import type { Assessment, Application } from '../../types';

export const AssessmentManager: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedAppId, setSelectedAppId] = useState<number>(1);
  const [title, setTitle] = useState('Fullstack Engineering Task');
  const [type, setType] = useState('technical');
  const [maxScore, setMaxScore] = useState(100);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchAssessments(), fetchPipeline()])
      .then(([assRes, appRes]) => {
        setAssessments(assRes);
        setApplications(appRes);
        if (appRes.length > 0) setSelectedAppId(appRes[0].id);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Assessments load error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await assignAssessment({
        application_id: Number(selectedAppId),
        title,
        assessment_type: type,
        max_score: Number(maxScore)
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Assign assessment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="card-3d p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006c49] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined">assignment</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Technical & Behavioral Assessments</h1>
            <p className="text-xs text-[#45464d] mt-0.5">Track candidate test assignments, score cards, and evaluations</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-3d btn-3d-emerald px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">post_add</span>
          Assign New Assessment
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#006c49] font-bold">Loading Assessments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((ass) => (
            <div key={ass.id} className="card-3d card-3d-hover p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-[#eff4ff] text-[#006c49] text-[10px] font-black rounded-full border border-[#d3e4fe] uppercase">
                  {ass.assessment_type}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full shadow-2xs ${
                  ass.status === 'completed' ? 'bg-[#6cf8bb] text-[#002113]' : 'bg-[#ffdad6] text-[#93000a]'
                }`}>
                  {ass.status}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-[#0b1c30]">{ass.title}</h3>

              {ass.score !== undefined && ass.score !== null ? (
                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#eff4ff] inset-depth flex items-center justify-between">
                  <span className="text-xs text-[#45464d] font-bold">Evaluation Score:</span>
                  <span className="text-base font-black text-[#006c49]">{ass.score} / {ass.max_score}</span>
                </div>
              ) : (
                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#eff4ff] inset-depth text-xs text-[#76777d] font-medium">
                  Assessment pending candidate submission
                </div>
              )}

              {ass.summary && (
                <p className="text-xs text-[#45464d] italic bg-[#eff4ff] p-3 rounded-xl border border-[#d3e4fe] font-medium">
                  "{ass.summary}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assign Assessment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-3d bg-white max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#eff4ff] pb-4">
              <div className="flex items-center gap-2 text-[#006c49]">
                <span className="material-symbols-outlined">assignment_add</span>
                <h2 className="text-base font-black text-[#0b1c30]">Assign Candidate Assessment</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#45464d] hover:text-[#0b1c30] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-[#0b1c30]">Select Candidate Application</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(Number(e.target.value))}
                  className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs font-bold text-[#0b1c30] inset-depth"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.candidate.full_name} — {app.job_title || 'Position'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-[#0b1c30]">Assessment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs font-bold text-[#0b1c30] inset-depth"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-[#0b1c30]">Assessment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs font-bold text-[#0b1c30] inset-depth"
                  >
                    <option value="technical">Technical Coding</option>
                    <option value="behavioral">Behavioral Case</option>
                    <option value="system_design">System Architecture</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-[#0b1c30]">Max Score</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    required
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs font-bold text-[#0b1c30] inset-depth"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-3d btn-3d-glass px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-3d btn-3d-emerald px-5 py-2 rounded-xl text-xs font-extrabold"
                >
                  {submitting ? 'Assigning...' : 'Assign Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

