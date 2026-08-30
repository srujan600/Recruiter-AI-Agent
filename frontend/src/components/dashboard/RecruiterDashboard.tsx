import React, { useEffect, useState } from 'react';
import { fetchDashboardAnalytics } from '../../services/api';
import type { AnalyticsData } from '../../types';
import { SpatialAIOrb } from '../common/SpatialAIOrb';

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
      {/* 3D Spatial Hero Command Center Banner */}
      <div className="relative rounded-3xl p-7 text-white shadow-xl overflow-hidden bg-gradient-to-r from-[#131b2e] via-[#1b263e] to-[#0b1c30] border border-[#6cf8bb]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Background Radial Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#006c49]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 w-64 h-64 bg-[#6cf8bb]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-[#6cf8bb] shadow-2xs">
            <span className="material-symbols-outlined text-sm">event</span>
            <span>Today: Monday, August 17, 2026</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Good Morning, Sarah.
          </h1>
          <p className="text-xs text-[#c6c6cd] max-w-xl leading-relaxed">
            You have <strong className="text-[#6cf8bb]">4 top-matched candidates</strong> awaiting AI Screening review and 1 technical interview scheduled today.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <SpatialAIOrb size="md" active={true} />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenAgent}
              className="btn-3d btn-3d-emerald px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Launch AI Recruiter
            </button>
            <button
              onClick={onOpenUpload}
              className="btn-3d btn-3d-glass px-4 py-2.5 rounded-xl text-xs font-bold text-white border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">cloud_upload</span>
              Upload Resumes
            </button>
          </div>
        </div>
      </div>

      {/* 3D KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-3d card-3d-hover p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#45464d]">Active Job Openings</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eff4ff] to-[#d3e4fe] border border-[#6cf8bb]/40 flex items-center justify-center text-[#006c49] shadow-2xs">
              <span className="material-symbols-outlined text-xl">work</span>
            </div>
          </div>
          <p className="text-3xl font-black text-[#0b1c30] tracking-tight">{data?.active_jobs || 3}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#006c49] font-bold bg-[#eff4ff] px-2.5 py-1 rounded-lg w-fit border border-[#d3e4fe]">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            <span>2 positions fully screened</span>
          </div>
        </div>

        <div className="card-3d card-3d-hover p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#45464d]">Candidates Screened</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eff4ff] to-[#d3e4fe] border border-[#6cf8bb]/40 flex items-center justify-center text-[#006c49] shadow-2xs">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
          </div>
          <p className="text-3xl font-black text-[#0b1c30] tracking-tight">{data?.candidates_screened || 5}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#006c49] font-bold bg-[#eff4ff] px-2.5 py-1 rounded-lg w-fit border border-[#d3e4fe]">
            <span className="material-symbols-outlined text-xs">auto_awesome</span>
            <span>100% parsed & ranked</span>
          </div>
        </div>

        <div className="card-3d card-3d-hover p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#45464d]">Avg Time-to-Hire</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eff4ff] to-[#d3e4fe] border border-[#6cf8bb]/40 flex items-center justify-center text-[#006c49] shadow-2xs">
              <span className="material-symbols-outlined text-xl">schedule</span>
            </div>
          </div>
          <p className="text-3xl font-black text-[#0b1c30] tracking-tight">{data?.avg_time_to_hire_days || 18.4} Days</p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#006c49] font-bold bg-[#eff4ff] px-2.5 py-1 rounded-lg w-fit border border-[#d3e4fe]">
            <span className="material-symbols-outlined text-xs">bolt</span>
            <span>3.2 days faster benchmark</span>
          </div>
        </div>

        <div className="card-3d card-3d-hover p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#45464d]">Offer Acceptance Rate</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eff4ff] to-[#d3e4fe] border border-[#6cf8bb]/40 flex items-center justify-center text-[#006c49] shadow-2xs">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <p className="text-3xl font-black text-[#0b1c30] tracking-tight">{data?.offer_acceptance_rate_pct || 91.5}%</p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#006c49] font-bold bg-[#eff4ff] px-2.5 py-1 rounded-lg w-fit border border-[#d3e4fe]">
            <span className="material-symbols-outlined text-xs">verified</span>
            <span>High candidate fit score</span>
          </div>
        </div>
      </div>

      {/* Process Bottleneck Alert */}
      {data?.process_bottleneck?.detected && (
        <div className="card-3d p-5 bg-gradient-to-r from-[#ffdad6] via-[#ffe5e2] to-[#ffdad6] border border-[#ba1a1a]/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined animate-pulse">warning</span>
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
            className="btn-3d px-4 py-2.5 bg-[#93000a] text-white hover:bg-[#ba1a1a] text-xs font-extrabold rounded-xl shadow-md shrink-0 flex items-center gap-1"
          >
            <span>Go to Pipeline</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Main Grid: Pipeline Overview & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Breakdown */}
        <div className="lg:col-span-2 card-3d p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#0b1c30]">Hiring Pipeline Overview</h2>
              <p className="text-xs text-[#45464d]">Live candidate count breakdown across recruitment stages</p>
            </div>
            <button
              onClick={() => onNavigate('pipeline')}
              className="text-xs font-bold text-[#006c49] hover:underline flex items-center gap-1"
            >
              <span>View Kanban Board</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {data?.hiring_funnel?.map((item) => (
              <div
                key={item.stage}
                className="card-3d card-3d-hover p-4 bg-[#f8f9ff] border border-[#d3e4fe] flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-[#45464d] truncate block">{item.stage}</span>
                <span className="text-2xl font-black text-[#0b1c30] mt-2 block tracking-tight">{item.count}</span>
                <span className="text-[10px] text-[#006c49] font-extrabold mt-1 block">Candidates</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
            <h2 className="text-base font-extrabold text-[#0b1c30]">Recent Activity</h2>
            <span className="text-[10px] font-bold text-[#006c49] bg-[#eff4ff] px-2.5 py-0.5 rounded-full border border-[#d3e4fe] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] animate-pulse" />
              Live Updates
            </span>
          </div>

          <div className="space-y-3.5">
            {data?.recent_activity?.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-[#eff4ff] last:border-0 last:pb-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#eff4ff] to-[#d3e4fe] border border-[#6cf8bb]/40 text-[#006c49] flex items-center justify-center font-bold shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-sm">notifications</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0b1c30] truncate">{act.title}</p>
                  <p className="text-[#45464d] text-[11px] mt-0.5 leading-tight">{act.description}</p>
                  <span className="text-[10px] text-[#76777d] mt-1 block font-medium">{act.time}</span>
                </div>
                <span className="px-2 py-0.5 bg-[#6cf8bb] text-[#002113] font-extrabold text-[9px] rounded-full shrink-0 shadow-2xs">
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
