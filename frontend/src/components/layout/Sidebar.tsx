import React from 'react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAgent: () => void;
  onPrefetch?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ currentTab, onTabChange, onOpenAgent, onPrefetch }) => {
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
    <aside className="w-[260px] bg-white/95 backdrop-blur-md border-r border-[#d3e4fe] flex flex-col h-screen fixed left-0 top-0 z-30 depth-l2">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#eff4ff] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008f61] via-[#006c49] to-[#004d34] flex items-center justify-center text-white shadow-md border border-[#6cf8bb]/40">
            <span className="material-symbols-outlined icon-filled text-2xl drop-shadow-xs">psychology</span>
          </div>
          <div>
            <h1 className="font-black text-lg text-[#0b1c30] tracking-tight leading-none">TalentOS</h1>
            <span className="text-[10px] font-extrabold text-[#006c49] uppercase tracking-wider block mt-1">Recruiter AI Platform</span>
          </div>
        </div>
      </div>

      {/* AI Assistant Quick Trigger Banner */}
      <div className="p-3.5 mx-3 my-3 bg-gradient-to-br from-[#eff4ff] to-[#e5eeff] rounded-2xl border border-[#d3e4fe] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-[#006c49]/10 border border-[#006c49]/20 text-[#006c49]">
            <span className="material-symbols-outlined text-base animate-pulse">auto_awesome</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#0b1c30]">AI Recruiter Agent</p>
            <p className="text-[10px] font-semibold text-[#006c49] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] animate-ping" />
              Always Ready
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAgent}
          className="btn-3d btn-3d-emerald px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer"
        >
          Ask AI
        </button>
      </div>

      {/* Navigation Links with Hover Prefetching */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => onPrefetch?.(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#131b2e] to-[#1b263e] text-white shadow-md border border-white/10'
                  : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] hover:translate-x-0.5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${isActive ? 'text-[#6cf8bb] drop-shadow-xs' : item.highlight ? 'text-[#006c49]' : 'text-[#76777d]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${isActive ? 'bg-[#6cf8bb] text-[#002113]' : 'bg-[#d3e4fe] text-[#0b1c30]'}`}>
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
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
              alt="Sarah Jenkins"
              loading="lazy"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#6cf8bb] shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#6cf8bb] border-2 border-white rounded-full" />
          </div>
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
});

Sidebar.displayName = 'Sidebar';
