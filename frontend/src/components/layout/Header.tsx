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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#d3e4fe] flex items-center justify-between px-6 sticky top-0 z-20 depth-l1 ml-[260px]">
      {/* 3D Floating Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search candidates, skills, jobs, or ATS scores..."
            className="w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0b1c30] placeholder-[#76777d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] focus:outline-none focus:border-[#006c49] focus:bg-white focus:shadow-md transition-all"
          />
        </div>
      </div>

      {/* Action Controls & User Role */}
      <div className="flex items-center gap-3">
        {/* Role Switcher 3D Pill */}
        <div className="bg-[#eff4ff] p-1 rounded-xl border border-[#d3e4fe] flex items-center text-xs shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
          {['Recruiter', 'Hiring Manager', 'HR Admin'].map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] ${
                activeRole === role
                  ? 'btn-3d btn-3d-emerald shadow-sm'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* AI Assistant 3D Button */}
        <button
          onClick={onOpenAgent}
          className="btn-3d btn-3d-glass px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm text-[#006c49] animate-pulse">auto_awesome</span>
          <span>AI Agent</span>
        </button>

        {/* Upload Resume 3D Button */}
        <button
          onClick={onOpenUpload}
          className="btn-3d btn-3d-navy px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">cloud_upload</span>
          <span>Upload Resume</span>
        </button>

        {/* New Job 3D Button */}
        <button
          onClick={onOpenNewJob}
          className="btn-3d btn-3d-emerald px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>New Job</span>
        </button>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-[#f8f9ff] border border-[#c6c6cd] flex items-center justify-center text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] relative transition-colors shadow-2xs btn-3d"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white animate-ping" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white" />
          </button>

          {/* Spatial 3D Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-84 card-3d p-4 depth-l4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#006c49]">notifications_active</span>
                  <h3 className="text-xs font-extrabold text-[#0b1c30]">Live Notifications</h3>
                </div>
                <span className="text-[10px] text-[#006c49] font-bold cursor-pointer hover:underline">Mark all read</span>
              </div>

              <div className="space-y-2.5 pt-3 max-h-64 overflow-y-auto custom-scrollbar">
                <div className="p-3 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] rounded-xl border border-[#d3e4fe] shadow-2xs hover:border-[#006c49]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-[#0b1c30]">High Match Candidate</p>
                    <span className="px-2 py-0.5 bg-[#6cf8bb] text-[#002113] text-[9px] font-black rounded-full">
                      94% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-[#45464d] mt-1">Alexander Chen scored 94% match for Senior Frontend Engineer.</p>
                  <span className="text-[10px] text-[#76777d] mt-1.5 block font-medium">10 minutes ago</span>
                </div>

                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#eff4ff] shadow-2xs">
                  <p className="text-xs font-bold text-[#0b1c30]">Assessment Completed</p>
                  <p className="text-[11px] text-[#45464d] mt-1">Alex Mercer scored 92/100 on Frontend Architecture test.</p>
                  <span className="text-[10px] text-[#76777d] mt-1.5 block font-medium">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
