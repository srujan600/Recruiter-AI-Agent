import React, { useState } from 'react';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenNewJob: () => void;
  onOpenAgent: () => void;
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onOpenNewJob,
  onOpenAgent,
  activeRole,
  onRoleChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-[#ffffff] border-b border-[#d3e4fe] flex items-center justify-between px-6 sticky top-0 z-20 shadow-2xs ml-[260px]">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search candidates, skills, jobs, or ATS scores..."
            className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#006c49] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Action Controls & User Role */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="bg-[#eff4ff] p-1 rounded-xl border border-[#d3e4fe] flex items-center text-xs">
          {['Recruiter', 'Hiring Manager', 'HR Admin'].map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-[11px] ${
                activeRole === role
                  ? 'bg-[#006c49] text-white shadow-2xs'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAgent}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#eff4ff] text-[#006c49] border border-[#d3e4fe] hover:bg-[#d3e4fe] rounded-xl text-xs font-bold transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          AI Agent
        </button>

        {/* Upload Resume Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#131b2e] text-white hover:bg-[#213145] rounded-xl text-xs font-semibold transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-sm">cloud_upload</span>
          Upload Resume
        </button>

        {/* New Job Button */}
        <button
          onClick={onOpenNewJob}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#006c49] text-white hover:bg-[#005236] rounded-xl text-xs font-semibold transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Job
        </button>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-[#f8f9ff] border border-[#c6c6cd] flex items-center justify-center text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] relative transition-colors"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#d3e4fe] rounded-2xl shadow-xl z-50 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                <h3 className="text-xs font-bold text-[#0b1c30]">Notifications</h3>
                <span className="text-[10px] text-[#006c49] font-semibold cursor-pointer">Mark all as read</span>
              </div>
              <div className="space-y-3 pt-3 max-h-64 overflow-y-auto custom-scrollbar">
                <div className="p-2.5 bg-[#eff4ff] rounded-xl border border-[#d3e4fe]">
                  <p className="text-xs font-bold text-[#0b1c30]">High Match Candidate</p>
                  <p className="text-[11px] text-[#45464d] mt-0.5">Alexander Chen scored 94% match for Senior Frontend Engineer.</p>
                  <span className="text-[10px] text-[#76777d] mt-1 block">10 minutes ago</span>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#eff4ff]">
                  <p className="text-xs font-bold text-[#0b1c30]">Assessment Completed</p>
                  <p className="text-[11px] text-[#45464d] mt-0.5">Alex Mercer scored 92/100 on Frontend Architecture test.</p>
                  <span className="text-[10px] text-[#76777d] mt-1 block">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
