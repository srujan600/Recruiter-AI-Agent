import React, { useState } from 'react';
import { createJob } from '../../services/api';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    min_salary: 130000,
    max_salary: 170000,
    notice_period_days: 30,
    required_skills: 'React, TypeScript, Tailwind CSS',
    preferred_skills: 'GraphQL, Next.js, Vite, System Design',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createJob({
        ...formData,
        required_skills: formData.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
        preferred_skills: formData.preferred_skills.split(',').map((s) => s.trim()).filter(Boolean)
      });
      setSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to create job.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Floating Spatial Modal Layer */}
      <div className="relative bg-white/95 backdrop-blur-xl border border-[#d3e4fe] rounded-3xl p-6 max-w-lg w-full shadow-2xl z-10 space-y-4 depth-l4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006c49] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-base">work</span>
            </div>
            <h2 className="text-base font-black text-[#0b1c30]">Create Job Requisition</h2>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#0b1c30] p-1 cursor-pointer">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-extrabold text-[#0b1c30] mb-1">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49] inset-depth font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-[#0b1c30] mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30] inset-depth font-medium"
              />
            </div>
            <div>
              <label className="block font-extrabold text-[#0b1c30] mb-1">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30] inset-depth font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-[#0b1c30] mb-1">Min Salary Band ($)</label>
              <input
                type="number"
                value={formData.min_salary}
                onChange={(e) => setFormData({ ...formData, min_salary: Number(e.target.value) })}
                className="w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30] inset-depth font-medium"
              />
            </div>
            <div>
              <label className="block font-extrabold text-[#0b1c30] mb-1">Max Salary Band ($)</label>
              <input
                type="number"
                value={formData.max_salary}
                onChange={(e) => setFormData({ ...formData, max_salary: Number(e.target.value) })}
                className="w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30] inset-depth font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-[#0b1c30] mb-1">Required Skills (Comma-separated)</label>
            <input
              type="text"
              required
              placeholder="e.g. React, TypeScript, Tailwind CSS"
              value={formData.required_skills}
              onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
              className="w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30] inset-depth font-medium"
            />
          </div>

          <div>
            <label className="block font-extrabold text-[#0b1c30] mb-1">Preferred Skills (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. GraphQL, Next.js, Vite, WebSockets"
              value={formData.preferred_skills}
              onChange={(e) => setFormData({ ...formData, preferred_skills: e.target.value })}
              className="w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30] inset-depth font-medium"
            />
          </div>

          <div>
            <label className="block font-extrabold text-[#0b1c30] mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief summary of job role requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30] inset-depth font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-3d btn-3d-glass px-4 py-2 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-3d btn-3d-emerald px-4 py-2 text-xs font-extrabold rounded-xl cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating Job...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
