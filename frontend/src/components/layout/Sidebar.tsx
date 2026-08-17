import React from 'react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAgent: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onOpenAgent }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'pipeline', label: 'Candidate Pipeline', icon: 'view_kanban', badge: '7 Stages' },
    { id: 'matcher', label: 'AI Candidate Matcher', icon: 'auto_awesome', highlight: true },
    { id: 'jobs', label: 'Job Management', icon: 'work' },
    { id: 'interviews', label: 'Interview Schedule', icon: 'calendar_today' },
    { id: 'assessments', label: 'Assessments', icon: 'assignment' },
    { id: 'analytics', label: 'Hiring Analytics', icon: 'analytics' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <aside className="w-[260px] bg-[#ffffff] border-r border-[#d3e4fe] flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#eff4ff] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#006c49] flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined icon-filled text-xl">psychology</span>
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-[#0b1c30] tracking-tight leading-none">TalentOS</h1>
            <span className="text-[11px] font-semibold text-[#006c49] uppercase tracking-wider">Recruiter AI Platform</span>
          </div>
        </div>
      </div>

      {/* AI Assistant Quick Trigger Banner */}
      <div className="p-3.5 mx-3 my-3 bg-[#eff4ff] rounded-xl border border-[#d3e4fe] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006c49] animate-pulse">auto_awesome</span>
          <div>
            <p className="text-xs font-bold text-[#0b1c30]">AI Recruiter Agent</p>            <p className="text-[11px] text-[#45464d]">Always Ready</p>
          </div>
        </div>
        <button
          onClick={onOpenAgent}
          className="px-2.5 py-1 bg-[#006c49] text-white text-xs font-semibold rounded-lg hover:bg-[#005236] transition-colors shadow-2xs"
        >
          Ask AI
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#131b2e] text-white font-semibold shadow-xs'
                  : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${isActive ? 'text-[#6cf8bb]' : item.highlight ? 'text-[#006c49]' : 'text-[#76777d]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#6cf8bb] text-[#002113]' : 'bg-[#d3e4fe] text-[#0b1c30]'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Card */}
      <div className="p-4 border-t border-[#eff4ff] bg-[#f8f9ff]">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
            alt="Sarah Jenkins"
            className="w-10 h-10 rounded-full object-cover border-2 border-[#6cf8bb]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#0b1c30] truncate">Sarah Jenkins</p>
            <p className="text-[11px] text-[#45464d] truncate">Lead Technical Recruiter</p>
          </div>
          <span className="material-symbols-outlined text-[#76777d] text-lg hover:text-[#0b1c30] cursor-pointer">
            more_vert
          </span>
        </div>
      </div>
    </aside>
  );
};
