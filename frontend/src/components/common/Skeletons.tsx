import React from 'react';

export const ShimmerBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-xl ${className}`} />
);

export const DashboardSkeleton: React.FC = () => (
  <div className="p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-200">
    {/* Hero Command Center Banner Skeleton */}
    <div className="rounded-3xl p-7 bg-[#131b2e] border border-[#6cf8bb]/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
      <div className="space-y-3">
        <ShimmerBox className="h-6 w-48 rounded-full bg-white/10" />
        <ShimmerBox className="h-9 w-72 bg-white/10" />
        <ShimmerBox className="h-4 w-96 bg-white/10" />
      </div>
      <div className="flex items-center gap-3">
        <ShimmerBox className="w-14 h-14 rounded-2xl bg-white/10" />
        <ShimmerBox className="w-36 h-10 rounded-xl bg-white/10" />
      </div>
    </div>

    {/* KPI Metric Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card-3d p-5 space-y-3.5">
          <div className="flex justify-between items-center">
            <ShimmerBox className="h-4 w-28" />
            <ShimmerBox className="w-10 h-10 rounded-xl" />
          </div>
          <ShimmerBox className="h-8 w-20" />
          <ShimmerBox className="h-5 w-36 rounded-lg" />
        </div>
      ))}
    </div>

    {/* Funnel & Activity Skeletons */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card-3d p-6 space-y-4">
        <div className="flex justify-between">
          <ShimmerBox className="h-5 w-44" />
          <ShimmerBox className="h-4 w-24" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((j) => (
            <div key={j} className="space-y-1.5">
              <div className="flex justify-between">
                <ShimmerBox className="h-3.5 w-24" />
                <ShimmerBox className="h-3.5 w-16" />
              </div>
              <ShimmerBox className="h-3.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="card-3d p-6 space-y-4">
        <ShimmerBox className="h-5 w-36" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((k) => (
            <div key={k} className="p-3 bg-[#f8f9ff] rounded-xl border border-[#eff4ff] space-y-2">
              <ShimmerBox className="h-4 w-32" />
              <ShimmerBox className="h-3 w-full" />
              <ShimmerBox className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const PipelineSkeleton: React.FC = () => (
  <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
    {/* Header Control Bar */}
    <div className="card-3d p-5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <ShimmerBox className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <ShimmerBox className="h-5 w-48" />
          <ShimmerBox className="h-3 w-64" />
        </div>
      </div>
      <div className="flex gap-3">
        <ShimmerBox className="w-36 h-9 rounded-xl" />
        <ShimmerBox className="w-9 h-9 rounded-xl" />
      </div>
    </div>

    {/* 7 Kanban Column Skeletons */}
    <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar min-h-[680px]">
      {[
        'Applied',
        'AI Screening',
        'Shortlisted',
        'Assessment',
        'Interview',
        'Offer',
        'Hired'
      ].map((stage, idx) => (
        <div key={stage} className="w-80 shrink-0 card-3d p-4 bg-[#f4f7fc]/90 border border-[#d3e4fe] space-y-3.5 depth-l1">
          <div className="flex justify-between items-center pb-3 border-b border-[#d3e4fe]">
            <span className="text-xs font-black text-[#0b1c30] uppercase tracking-wider">{stage}</span>
            <ShimmerBox className="h-4 w-6 rounded-full" />
          </div>

          <div className="space-y-3">
            {[1, 2].slice(0, idx < 4 ? 2 : 1).map((c) => (
              <div key={c} className="card-3d p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <ShimmerBox className="h-5 w-24 rounded-lg" />
                  <ShimmerBox className="h-4 w-16 rounded-md" />
                </div>
                <div className="flex items-center gap-3">
                  <ShimmerBox className="w-11 h-11 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <ShimmerBox className="h-3.5 w-28" />
                    <ShimmerBox className="h-3 w-36" />
                  </div>
                </div>
                <div className="pt-2 border-t border-[#eff4ff] flex justify-between">
                  <ShimmerBox className="h-3 w-16" />
                  <ShimmerBox className="h-3 w-20" />
                </div>
                <div className="pt-2 border-t border-[#eff4ff] flex gap-2">
                  <ShimmerBox className="h-7 flex-1 rounded-lg" />
                  <ShimmerBox className="h-7 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CandidateProfileSkeleton: React.FC = () => (
  <div className="p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-200">
    <div className="flex justify-between items-center">
      <ShimmerBox className="h-8 w-36 rounded-xl" />
      <div className="flex gap-3">
        <ShimmerBox className="h-8 w-32 rounded-xl" />
        <ShimmerBox className="h-8 w-32 rounded-xl" />
        <ShimmerBox className="h-8 w-36 rounded-xl" />
      </div>
    </div>

    {/* Hero Card Skeleton */}
    <div className="card-3d p-6 flex items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <ShimmerBox className="w-20 h-20 rounded-2xl" />
        <div className="space-y-2">
          <ShimmerBox className="h-7 w-52" />
          <ShimmerBox className="h-4 w-40" />
          <ShimmerBox className="h-3.5 w-60" />
        </div>
      </div>
      <div className="flex gap-4">
        <ShimmerBox className="w-28 h-14 rounded-2xl" />
        <ShimmerBox className="w-28 h-14 rounded-2xl" />
      </div>
    </div>

    {/* Tab Nav Skeleton */}
    <div className="flex gap-2 border-b border-[#d3e4fe] pb-3">
      {[1, 2, 3, 4, 5].map((t) => (
        <ShimmerBox key={t} className="h-8 w-28 rounded-xl" />
      ))}
    </div>

    {/* Body Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card-3d p-6 space-y-4">
        <ShimmerBox className="h-5 w-44" />
        <div className="space-y-2.5">
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-5/6" />
          <ShimmerBox className="h-4 w-4/6" />
        </div>
      </div>
      <div className="card-3d p-6 space-y-4">
        <ShimmerBox className="h-5 w-32" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <ShimmerBox key={s} className="h-6 w-20 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const JobsSkeleton: React.FC = () => (
  <div className="p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-200">
    <div className="card-3d p-5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <ShimmerBox className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <ShimmerBox className="h-5 w-48" />
          <ShimmerBox className="h-3 w-64" />
        </div>
      </div>
      <ShimmerBox className="h-9 w-44 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card-3d p-5 space-y-4">
          <div className="flex justify-between">
            <ShimmerBox className="h-5 w-16 rounded-full" />
            <ShimmerBox className="h-4 w-24" />
          </div>
          <div className="space-y-1.5">
            <ShimmerBox className="h-5 w-48" />
            <ShimmerBox className="h-3.5 w-36" />
          </div>
          <div className="p-3 bg-[#f8f9ff] rounded-xl space-y-2">
            <ShimmerBox className="h-3.5 w-full" />
            <ShimmerBox className="h-3.5 w-5/6" />
            <ShimmerBox className="h-3.5 w-4/6" />
          </div>
          <div className="flex gap-1.5">
            <ShimmerBox className="h-5 w-16 rounded-md" />
            <ShimmerBox className="h-5 w-20 rounded-md" />
            <ShimmerBox className="h-5 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const InterviewsSkeleton: React.FC = () => (
  <div className="p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-200">
    <div className="card-3d p-5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <ShimmerBox className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <ShimmerBox className="h-5 w-48" />
          <ShimmerBox className="h-3 w-64" />
        </div>
      </div>
      <ShimmerBox className="h-9 w-44 rounded-xl" />
    </div>

    <div className="card-3d overflow-hidden p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between items-center p-3 border-b border-[#eff4ff]">
          <ShimmerBox className="h-4 w-40" />
          <ShimmerBox className="h-4 w-28" />
          <ShimmerBox className="h-4 w-36" />
          <ShimmerBox className="h-6 w-24 rounded-lg" />
          <ShimmerBox className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const AssessmentsSkeleton: React.FC = () => (
  <div className="p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-200">
    <div className="card-3d p-5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <ShimmerBox className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <ShimmerBox className="h-5 w-48" />
          <ShimmerBox className="h-3 w-64" />
        </div>
      </div>
      <ShimmerBox className="h-9 w-44 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card-3d p-5 space-y-3.5">
          <div className="flex justify-between">
            <ShimmerBox className="h-4 w-20 rounded-full" />
            <ShimmerBox className="h-4 w-20 rounded-full" />
          </div>
          <ShimmerBox className="h-5 w-48" />
          <ShimmerBox className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);

export const AnalyticsSkeleton: React.FC = () => (
  <div className="p-8 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-200">
    <div className="card-3d p-5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <ShimmerBox className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <ShimmerBox className="h-5 w-48" />
          <ShimmerBox className="h-3 w-64" />
        </div>
      </div>
      <ShimmerBox className="h-6 w-24 rounded-full" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-3d p-6 space-y-3">
          <div className="flex justify-between">
            <ShimmerBox className="h-4 w-36" />
            <ShimmerBox className="w-6 h-6 rounded-lg" />
          </div>
          <ShimmerBox className="h-9 w-28" />
          <ShimmerBox className="h-4 w-44" />
        </div>
      ))}
    </div>

    <div className="card-3d p-6 space-y-4">
      <ShimmerBox className="h-5 w-48" />
      <div className="space-y-3.5 pt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <ShimmerBox className="h-3.5 w-28" />
              <ShimmerBox className="h-3.5 w-20" />
            </div>
            <ShimmerBox className="h-3.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ErrorRetryCard: React.FC<{
  title?: string;
  message?: string;
  onRetry: () => void;
}> = ({
  title = 'Unable to Load Data',
  message = 'A network error occurred or the backend service is taking too long to respond.',
  onRetry
}) => (
  <div className="card-3d p-8 max-w-md mx-auto my-12 text-center space-y-4 border border-[#ba1a1a]/20 bg-white/95 depth-l2 animate-in fade-in">
    <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto shadow-sm">
      <span className="material-symbols-outlined text-2xl">error_outline</span>
    </div>
    <div>
      <h3 className="text-base font-black text-[#0b1c30]">{title}</h3>
      <p className="text-xs text-[#45464d] mt-1 leading-relaxed">{message}</p>
    </div>
    <div className="pt-2">
      <button
        onClick={onRetry}
        className="btn-3d btn-3d-emerald px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">refresh</span>
        Retry Now
      </button>
    </div>
  </div>
);

export const ViewSkeleton: React.FC<{ tab: string }> = ({ tab }) => {
  switch (tab) {
    case 'pipeline':
      return <PipelineSkeleton />;
    case 'profile':
      return <CandidateProfileSkeleton />;
    case 'jobs':
      return <JobsSkeleton />;
    case 'interviews':
      return <InterviewsSkeleton />;
    case 'assessments':
      return <AssessmentsSkeleton />;
    case 'analytics':
      return <AnalyticsSkeleton />;
    case 'matcher':
      return <CandidateProfileSkeleton />;
    case 'dashboard':
    default:
      return <DashboardSkeleton />;
  }
};
