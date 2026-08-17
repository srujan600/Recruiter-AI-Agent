import React, { useEffect, useState } from 'react';
import { fetchJobs } from '../../services/api';
import type { Job } from '../../types';

interface JobManagementProps {
  onOpenNewJob: () => void;
  onNavigate: (tab: string) => void;
}

export const JobManagement: React.FC<JobManagementProps> = ({ onOpenNewJob, onNavigate }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then((res) => {
        setJobs(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Job load error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#d3e4fe] shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Job Openings & Requirements</h1>
          <p className="text-xs text-[#45464d] mt-0.5">Manage active hiring requisitions and target skillsets</p>
        </div>

        <button
          onClick={onOpenNewJob}
          className="px-4 py-2.5 bg-[#006c49] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#005236] flex items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create New Job Requisition
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#006c49] font-bold">Loading Jobs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-[#d3e4fe] hover:border-[#006c49] rounded-2xl p-5 shadow-2xs space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-[#6cf8bb] text-[#002113] text-[10px] font-black rounded-full uppercase">
                    {job.status}
                  </span>
                  <span className="text-[11px] font-bold text-[#45464d]">{job.department}</span>
                </div>

                <div>
                  <h3 className="text-base font-black text-[#0b1c30]">{job.title}</h3>
                  <p className="text-xs text-[#45464d] mt-0.5">{job.location} • {job.job_type}</p>
                </div>

                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#eff4ff] space-y-1 text-xs">
                  <div className="flex justify-between text-[#45464d]">
                    <span>Salary Band:</span>
                    <strong className="text-[#0b1c30]">${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-[#45464d]">
                    <span>Experience Level:</span>
                    <strong className="text-[#0b1c30]">{job.experience_level}</strong>
                  </div>
                  <div className="flex justify-between text-[#45464d]">
                    <span>Notice Period:</span>
                    <strong className="text-[#0b1c30]">{job.notice_period_days} Days Max</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#45464d] block mb-1.5">Required Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#eff4ff] text-[#006c49] border border-[#d3e4fe] text-[10px] font-bold rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#eff4ff] flex items-center justify-between">
                <span className="text-xs text-[#76777d]">
                  <strong className="text-[#0b1c30]">{job.applicant_count || 0}</strong> Applicants
                </span>
                <button
                  onClick={() => onNavigate('pipeline')}
                  className="text-xs font-bold text-[#006c49] hover:underline"
                >
                  View Pipeline →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
