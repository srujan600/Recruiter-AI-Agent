import React, { useEffect, useState } from 'react';
import { fetchInterviews, scheduleInterview, fetchPipeline } from '../../services/api';
import type { Interview, Application } from '../../types';

export const InterviewScheduler: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedAppId, setSelectedAppId] = useState<number>(1);
  const [title, setTitle] = useState('Technical Interview');
  const [type, setType] = useState('Technical Interview');
  const [interviewer, setInterviewer] = useState('Sarah Jenkins');
  const [scheduledAt, setScheduledAt] = useState('2026-08-25T14:00');
  const [duration, setDuration] = useState(45);
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij');

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchInterviews(), fetchPipeline()])
      .then(([invRes, appRes]) => {
        setInterviews(invRes);
        setApplications(appRes);
        if (appRes.length > 0) setSelectedAppId(appRes[0].id);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Interviews error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await scheduleInterview({
        application_id: Number(selectedAppId),
        title,
        interview_type: type,
        interviewer_name: interviewer,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: Number(duration),
        meeting_link: meetingLink
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Schedule interview error:', err);
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
            <span className="material-symbols-outlined">calendar_today</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Interview Scheduling & Meetings</h1>
            <p className="text-xs text-[#45464d] mt-0.5">Manage live candidate interview sessions and meeting links</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-3d btn-3d-emerald px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">add_alarm</span>
          Schedule New Interview
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#006c49] font-bold">Loading Interviews...</div>
      ) : (
        <div className="card-3d overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-[#0b1c30] font-extrabold">
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
                <tr key={inv.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="p-4 font-black text-[#0b1c30]">
                    {inv.title}
                    <span className="block text-[11px] font-semibold text-[#45464d] mt-0.5">{inv.interview_type}</span>
                  </td>
                  <td className="p-4 text-[#45464d] font-bold">{inv.interviewer_name}</td>
                  <td className="p-4 text-[#0b1c30] font-extrabold">
                    {new Date(inv.scheduled_at).toLocaleString()}
                    <span className="block text-[11px] font-semibold text-[#76777d] mt-0.5">{inv.duration_minutes} mins</span>
                  </td>
                  <td className="p-4">
                    {inv.meeting_link ? (
                      <a
                        href={inv.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-3d btn-3d-glass px-3 py-1.5 rounded-lg text-[#006c49] font-extrabold flex items-center gap-1 w-fit text-[11px]"
                      >
                        <span className="material-symbols-outlined text-xs">videocam</span>
                        Join Meeting
                      </a>
                    ) : (
                      <span className="text-[#76777d] font-medium">No link</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-[#6cf8bb] text-[#002113] text-[10px] font-black rounded-full uppercase shadow-2xs">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-3d bg-white max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#eff4ff] pb-4">
              <div className="flex items-center gap-2 text-[#006c49]">
                <span className="material-symbols-outlined">calendar_month</span>
                <h2 className="text-base font-black text-[#0b1c30]">Schedule Candidate Interview</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#45464d] hover:text-[#0b1c30] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-[#0b1c30]">Interview Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs font-bold text-[#0b1c30] inset-depth"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-[#0b1c30]">Interview Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs font-bold text-[#0b1c30] inset-depth"
                  >
                    <option value="Technical Interview">Technical Interview</option>
                    <option value="Behavioral Sync">Behavioral Sync</option>
                    <option value="System Design">System Design</option>
                    <option value="Hiring Manager Final">Hiring Manager Final</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-[#0b1c30]">Interviewer Name</label>
                  <input
                    type="text"
                    value={interviewer}
                    onChange={(e) => setInterviewer(e.target.value)}
                    required
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs font-bold text-[#0b1c30] inset-depth"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-[#0b1c30]">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs font-bold text-[#0b1c30] inset-depth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-[#0b1c30]">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl p-3 text-xs font-bold text-[#0b1c30] inset-depth"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-[#0b1c30]">Meeting URL Link</label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
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
                  {submitting ? 'Scheduling...' : 'Save & Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

