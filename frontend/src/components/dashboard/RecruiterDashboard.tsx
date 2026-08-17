import React, { useEffect, useState } from 'react';
import { fetchDashboardAnalytics } from '../../services/api';
import type { AnalyticsData } from '../../types';

interface RecruiterDashboardProps {
  onNavigate: (tab: string, candidateId?: number) => void;
  onOpenUpload: () => void;
  onOpenAgent: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  onNavigate,
  onOpenUpload,
  onOpenAgent
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Analytics load error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex items-center gap-3 text-[#006c49]">
          <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
          <span className="font-bold text-sm">Loading Recruiter Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto">
      <div className="bg-gradient-to-r from-[#131b2e] to-[#213145] rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-[#6cf8bb]">
            <span className="material-symbols-outlined text-sm">event</span>
            Today: Monday, August 17, 2026
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Good Morning, Sarah.</h1>
          <p className="text-xs text-[#c6c6cd] max-w-xl">
            You have <strong className="text-white">4 top-matched candidates</strong> waiting in AI Screening and 1 technical interview scheduled today.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={onOpenAgent}
            className="px-4 py-2.5 bg-[#006c49] hover:bg-[#005236] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Launch AI Recruiter
          </button>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center gap-2 backdrop-blur-md transition-all"
          >
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            Upload Resumes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#d3e4fe] p-5 rounded-2xl shadow-2xs hover:border-[#006c49] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#45464d]">Active Job Openings</span>
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#006c49]">
              <span className="material-symbols-outlined text-lg">work</span>
            </div>
          </div>
          <p className="text-3xl font-black text-[#0b1c30] mt-3">{data?.active_jobs || 3}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[#006c49] font-bold">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            <span>2 positions fully screened</span>
          </div>
        </div>

        <div className="bg-white border border-[#d3e4fe] p-5 rounded-2xl shadow-2xs hover:border-[#006c49] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#45464d]">Candidates Screened</span>
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#006c49]">
              <span className="material-symbols-outlined text-lg">group</span>
            </div>
          </div>
          <p className="text-3xl font-black text-[#0b1c30] mt-3">{data?.candidates_screened || 5}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[#006c49] font-bold">
            <span className="material-symbols-outlined text-xs">auto_awesome</span>
            <span>100% parsed & ranked</span>
          </div>
        </div>

        <div className="bg-white border border-[#d3e4fe] p-5 rounded-2xl shadow-2xs hover:border-[#006c49] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#45464d]">Avg Time-to-Hire</span>
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#006c49]">
              <span className="material-symbols-outlined text-lg">schedule</span>
            </div>
          </div>
          <p className="text-3xl font-black text-[#0b1c30] mt-3">{data?.avg_time_to_hire_days || 18.4} Days</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[#006c49] font-bold">
            <span className="material-symbols-outlined text-xs">bolt</span>
            <span>3.2 days faster than benchmark</span>
          </div>
        </div>

        <div className="bg-white border border-[#d3e4fe] p-5 rounded-2xl shadow-2xs hover:border-[#006c49] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#45464d]">Offer Acceptance Rate</span>
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#006c49]">
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </div>
          </div>
          <p className="text-3xl font-black text-[#0b1c30] mt-3">{data?.offer_acceptance_rate_pct || 91.5}%</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[#006c49] font-bold">
            <span className="material-symbols-outlined text-xs">verified</span>
            <span>High candidate satisfaction</span>
          </div>
        </div>
      </div>

      {data?.process_bottleneck?.detected && (
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-[#93000a] uppercase tracking-wider">Process Bottleneck Detected</h3>
              <p className="text-sm font-bold text-[#0b1c30] mt-0.5">
                AI Screening Queue: {data.process_bottleneck.count} Candidates Waiting
              </p>
              <p className="text-xs text-[#45464d] mt-1">
                Candidates applied for Senior Frontend Engineer are awaiting AI match scoring. Run batch screening now.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('pipeline')}
            className="px-4 py-2 bg-[#93000a] text-white hover:bg-[#ba1a1a] text-xs font-bold rounded-xl shadow-2xs transition-colors shrink-0"
          >
            Go to Pipeline →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0b1c30]">Hiring Pipeline Overview</h2>
              <p className="text-xs text-[#45464d]">Live breakdown across active candidate stages</p>
            </div>
            <button
              onClick={() => onNavigate('pipeline')}
              className="text-xs font-bold text-[#006c49] hover:underline flex items-center gap-1"
            >
              View Kanban Board →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {data?.hiring_funnel?.map((item) => (
              <div key={item.stage} className="bg-[#f8f9ff] border border-[#d3e4fe] p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-[#45464d] block truncate">{item.stage}</span>
                <span className="text-xl font-extrabold text-[#0b1c30] block mt-1">{item.count}</span>
                <span className="text-[10px] text-[#006c49] font-bold">Candidates</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#d3e4fe] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <h2 className="text-base font-bold text-[#0b1c30]">Recent Activity</h2>
            <span className="text-xs text-[#76777d]">Live updates</span>
          </div>

          <div className="space-y-4">
            {data?.recent_activity?.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs border-b border-[#eff4ff] pb-3 last:border-0">
                <div className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#006c49] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-sm">notifications</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0b1c30]">{act.title}</p>
                  <p className="text-[#45464d] text-[11px] mt-0.5">{act.description}</p>
                  <span className="text-[10px] text-[#76777d] mt-1 block">{act.time}</span>
                </div>
                <span className="px-2 py-0.5 bg-[#d3e4fe] text-[#0b1c30] font-bold text-[10px] rounded-full">
                  {act.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
