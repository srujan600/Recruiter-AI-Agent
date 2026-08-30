import React, { useEffect, useState } from 'react';
import { fetchDashboardAnalytics } from '../../services/api';
import type { AnalyticsData } from '../../types';

export const AnalyticsView: React.FC = () => {
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

  return (
    <div className="p-8 space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="card-3d p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006c49] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Recruitment & Hiring Analytics</h1>
            <p className="text-xs text-[#45464d] mt-0.5">Real-time spatial data environment and metric telemetry</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-[#eff4ff] border border-[#d3e4fe] rounded-full text-xs font-bold text-[#006c49] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse" />
          Live Metrics
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#006c49] font-bold">Loading Spatial Analytics...</div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-3d card-3d-hover p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#45464d]">Time-to-Hire Benchmark</span>
                <span className="material-symbols-outlined text-[#006c49]">schedule</span>
              </div>
              <p className="text-3xl font-black text-[#0b1c30] mt-2 tracking-tight">{data?.avg_time_to_hire_days} Days</p>
              <p className="text-xs text-[#006c49] font-extrabold flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined text-xs">trending_down</span>
                <span>15% reduction vs previous quarter</span>
              </p>
            </div>

            <div className="card-3d card-3d-hover p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#45464d]">Offer Acceptance Rate</span>
                <span className="material-symbols-outlined text-[#006c49]">task_alt</span>
              </div>
              <p className="text-3xl font-black text-[#0b1c30] mt-2 tracking-tight">{data?.offer_acceptance_rate_pct}%</p>
              <p className="text-xs text-[#006c49] font-extrabold flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined text-xs">thumb_up</span>
                <span>High candidate alignment score</span>
              </p>
            </div>

            <div className="card-3d card-3d-hover p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#45464d]">AI Screening Accuracy</span>
                <span className="material-symbols-outlined text-[#006c49]">auto_awesome</span>
              </div>
              <p className="text-3xl font-black text-[#0b1c30] mt-2 tracking-tight">96.8%</p>
              <p className="text-xs text-[#006c49] font-extrabold flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>Based on hiring manager acceptances</span>
              </p>
            </div>
          </div>

          {/* Hiring Funnel Surface */}
          <div className="card-3d p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0b1c30]">Hiring Funnel Stage Conversion</h3>
              <span className="text-xs text-[#45464d] font-semibold">Stage Yield Telemetry</span>
            </div>
            <div className="space-y-4">
              {data?.hiring_funnel.map((item) => (
                <div key={item.stage} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold text-[#0b1c30]">
                    <span>{item.stage}</span>
                    <span>{item.count} Candidates</span>
                  </div>
                  <div className="w-full h-3.5 bg-[#eff4ff] rounded-full overflow-hidden inset-depth p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#006c49] via-[#008f61] to-[#6cf8bb] rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${Math.min(item.count * 25, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
