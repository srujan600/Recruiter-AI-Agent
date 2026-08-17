import React, { useEffect, useState } from 'react';
import { fetchInterviews } from '../../services/api';
import type { Interview } from '../../types';

export const InterviewScheduler: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews()
      .then((res) => {
        setInterviews(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Interviews error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#d3e4fe] shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Interview Scheduling & Meetings</h1>
          <p className="text-xs text-[#45464d] mt-0.5">Manage live interview sessions with candidates and interviewers</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#006c49] font-bold">Loading Interviews...</div>
      ) : (
        <div className="bg-white border border-[#d3e4fe] rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-[#0b1c30] font-bold">
              <tr>
                <th className="p-4 border-b border-[#d3e4fe]">Title & Type</th>
                <th className="p-4 border-b border-[#d3e4fe]">Interviewer</th>
                <th className="p-4 border-b border-[#d3e4fe]">Date & Time</th>
                <th className="p-4 border-b border-[#d3e4fe]">Meeting Link</th>
                <th className="p-4 border-b border-[#d3e4fe]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {interviews.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#f8f9ff]">
                  <td className="p-4 font-bold text-[#0b1c30]">
                    {inv.title}
                    <span className="block text-[11px] font-normal text-[#45464d]">{inv.interview_type}</span>
                  </td>
                  <td className="p-4 text-[#45464d] font-semibold">{inv.interviewer_name}</td>
                  <td className="p-4 text-[#0b1c30] font-bold">
                    {new Date(inv.scheduled_at).toLocaleString()}
                    <span className="block text-[11px] font-normal text-[#76777d]">{inv.duration_minutes} mins</span>
                  </td>
                  <td className="p-4">
                    {inv.meeting_link ? (
                      <a
                        href={inv.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#006c49] font-bold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">videocam</span>
                        Join Meeting
                      </a>
                    ) : (
                      <span className="text-[#76777d]">No link</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-[#6cf8bb] text-[#002113] text-[10px] font-bold rounded-full uppercase">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
