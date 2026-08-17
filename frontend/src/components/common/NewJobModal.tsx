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
        required_skills: formData.required_skills.split(',').map((s) => s.trim()),
        preferred_skills: ['GraphQL', 'Next.js', 'Vite']
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white border border-[#d3e4fe] rounded-3xl p-6 max-w-lg w-full shadow-2xl z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c49]">work</span>
            <h2 className="text-base font-black text-[#0b1c30]">Create Job Requisition</h2>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#0b1c30]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0b1c30] mb-1">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0b1c30] mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0b1c30] mb-1">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0b1c30] mb-1">Min Salary ($)</label>
              <input
                type="number"
                value={formData.min_salary}
                onChange={(e) => setFormData({ ...formData, min_salary: Number(e.target.value) })}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0b1c30] mb-1">Max Salary ($)</label>
              <input
                type="number"
                value={formData.max_salary}
                onChange={(e) => setFormData({ ...formData, max_salary: Number(e.target.value) })}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0b1c30] mb-1">Required Skills (Comma-separated)</label>
            <input
              type="text"
              required
              value={formData.required_skills}
              onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
              className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-2.5 text-xs text-[#0b1c30]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c6c6cd] text-[#45464d] text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#006c49] hover:bg-[#005236] text-white text-xs font-bold rounded-xl shadow-2xs"
            >
              {submitting ? 'Creating Job...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
