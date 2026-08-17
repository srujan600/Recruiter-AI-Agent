import React, { useEffect, useState } from 'react';
import { fetchAssessments } from '../../services/api';
import type { Assessment } from '../../types';

export const AssessmentManager: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments()
      .then((res) => {
        setAssessments(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Assessments load error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#d3e4fe] shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Technical & Behavioral Assessments</h1>
          <p className="text-xs text-[#45464d] mt-0.5">Track candidate test assignments, score cards, and evaluations</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#006c49] font-bold">Loading Assessments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((ass) => (
            <div key={ass.id} className="bg-white border border-[#d3e4fe] p-5 rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-[#eff4ff] text-[#006c49] text-[10px] font-bold rounded-full border border-[#d3e4fe] uppercase">
                  {ass.assessment_type}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                  ass.status === 'completed' ? 'bg-[#6cf8bb] text-[#002113]' : 'bg-[#ffdad6] text-[#93000a]'
                }`}>
                  {ass.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#0b1c30]">{ass.title}</h3>

              {ass.score !== undefined && ass.score !== null ? (
                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#eff4ff] flex items-center justify-between">
                  <span className="text-xs text-[#45464d] font-medium">Evaluation Score:</span>
                  <span className="text-base font-black text-[#006c49]">{ass.score} / {ass.max_score}</span>
                </div>
              ) : (
                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#eff4ff] text-xs text-[#76777d]">
                  Assessment pending candidate submission
                </div>
              )}

              {ass.summary && (
                <p className="text-xs text-[#45464d] italic bg-[#eff4ff] p-3 rounded-xl border border-[#d3e4fe]">
                  "{ass.summary}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
