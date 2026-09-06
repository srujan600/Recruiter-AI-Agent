import React, { useState, useEffect, useRef } from 'react';
import { searchTalent, fetchNotifications } from '../../services/api';
import type { Candidate, Job } from '../../types';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenNewJob: () => void;
  onOpenAgent: () => void;
  activeRole: string;
  onRoleChange: (role: string) => void;
  onNavigate?: (tab: string, candidateId?: number) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  onOpenUpload,
  onOpenNewJob,
  onOpenAgent,
  activeRole,
  onRoleChange,
  onNavigate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(2);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ candidates: Candidate[]; jobs: Job[] }>({ candidates: [], jobs: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load notifications once with caching
  useEffect(() => {
    fetchNotifications()
      .then((res: any[]) => {
        if (Array.isArray(res) && res.length > 0) {
          setNotifications(res);
          setUnreadCount(res.filter((n) => !n.is_read).length);
        }
      })
      .catch(() => {});
  }, []);

  // Debounced search with AbortController
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ candidates: [], jobs: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const results = await searchTalent(searchQuery, controller.signal);
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error(e);
        }
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCandidate = (candidateId: number) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (onNavigate) onNavigate('profile', candidateId);
  };

  const handleSelectJob = () => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (onNavigate) onNavigate('jobs');
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#d3e4fe] flex items-center justify-between px-6 sticky top-0 z-20 depth-l1 ml-[260px]">
      {/* 3D Floating Instant Search Input */}
      <div ref={searchRef} className="flex items-center gap-4 flex-1 max-w-md relative">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-lg">
            {isSearching ? 'sync' : 'search'}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
            placeholder="Search candidates, skills, jobs, or ATS scores..."
            className={`w-full bg-[#f4f7fc] border border-[#c6c6cd] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0b1c30] placeholder-[#76777d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] focus:outline-none focus:border-[#006c49] focus:bg-white focus:shadow-md transition-all ${
              isSearching ? 'animate-pulse' : ''
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#0b1c30] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Live Instant Search Dropdown Results */}
        {showSearchDropdown && (searchResults.candidates.length > 0 || searchResults.jobs.length > 0) && (
          <div className="absolute top-12 left-0 right-0 card-3d p-3 depth-l4 z-50 max-h-96 overflow-y-auto custom-scrollbar bg-white/98 animate-in fade-in slide-in-from-top-2 duration-150">
            {searchResults.candidates.length > 0 && (
              <div className="mb-3">
                <div className="text-[10px] font-black text-[#006c49] uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">person</span>
                  Candidates ({searchResults.candidates.length})
                </div>
                <div className="space-y-1 mt-1">
                  {searchResults.candidates.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCandidate(c.id)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#eff4ff] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={c.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                          alt={c.full_name}
                          className="w-7 h-7 rounded-full object-cover border border-[#6cf8bb]"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-[#0b1c30] truncate">{c.full_name}</p>
                          <p className="text-[10px] text-[#45464d] truncate">{c.current_role} • {c.location}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#006c49] bg-[#eff4ff] border border-[#d3e4fe] px-2 py-0.5 rounded-md shrink-0">
                        {c.total_experience_years} Yrs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.jobs.length > 0 && (
              <div>
                <div className="text-[10px] font-black text-[#006c49] uppercase tracking-wider px-2 py-1 flex items-center gap-1 border-t border-[#eff4ff] pt-2">
                  <span className="material-symbols-outlined text-xs">work</span>
                  Jobs ({searchResults.jobs.length})
                </div>
                <div className="space-y-1 mt-1">
                  {searchResults.jobs.map((j) => (
                    <div
                      key={j.id}
                      onClick={handleSelectJob}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#eff4ff] cursor-pointer transition-colors"
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold text-[#0b1c30] truncate">{j.title}</p>
                        <p className="text-[10px] text-[#45464d] truncate">{j.department} • {j.location}</p>
                      </div>
                      <span className="text-[9px] font-black text-[#002113] bg-[#6cf8bb] px-2 py-0.5 rounded-full shrink-0 uppercase">
                        {j.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Controls & User Role */}
      <div className="flex items-center gap-3">
        {/* Role Switcher 3D Pill */}
        <div className="bg-[#eff4ff] p-1 rounded-xl border border-[#d3e4fe] flex items-center text-xs shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
          {['Recruiter', 'Hiring Manager', 'HR Admin'].map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] cursor-pointer ${
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
          className="btn-3d btn-3d-glass px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm text-[#006c49] animate-pulse">auto_awesome</span>
          <span>AI Agent</span>
        </button>

        {/* Upload Resume 3D Button */}
        <button
          onClick={onOpenUpload}
          className="btn-3d btn-3d-navy px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">cloud_upload</span>
          <span>Upload Resume</span>
        </button>

        {/* New Job 3D Button */}
        <button
          onClick={onOpenNewJob}
          className="btn-3d btn-3d-emerald px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>New Job</span>
        </button>

        {/* Notifications Icon */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-[#f8f9ff] border border-[#c6c6cd] flex items-center justify-center text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] relative transition-colors shadow-2xs btn-3d cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadCount > 0 && (
              <>
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white animate-ping" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white" />
              </>
            )}
          </button>

          {/* Spatial 3D Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-84 card-3d p-4 depth-l4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#006c49]">notifications_active</span>
                  <h3 className="text-xs font-extrabold text-[#0b1c30]">Live Notifications</h3>
                </div>
                <span
                  onClick={() => setUnreadCount(0)}
                  className="text-[10px] text-[#006c49] font-bold cursor-pointer hover:underline"
                >
                  Mark all read
                </span>
              </div>

              <div className="space-y-2.5 pt-3 max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] rounded-xl border border-[#d3e4fe] shadow-2xs hover:border-[#006c49]/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-[#0b1c30]">{n.title}</p>
                        <span className="px-2 py-0.5 bg-[#6cf8bb] text-[#002113] text-[9px] font-black rounded-full">
                          {n.notification_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#45464d] mt-1">{n.message}</p>
                      <span className="text-[10px] text-[#76777d] mt-1.5 block font-medium">
                        {new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] rounded-xl border border-[#d3e4fe] shadow-2xs">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-[#0b1c30]">High Match Candidate</p>
                        <span className="px-2 py-0.5 bg-[#6cf8bb] text-[#002113] text-[9px] font-black rounded-full">
                          94% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-[#45464d] mt-1">Alexander Chen scored 94% match for Senior Frontend Engineer.</p>
                      <span className="text-[10px] text-[#76777d] mt-1.5 block font-medium">10 minutes ago</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
