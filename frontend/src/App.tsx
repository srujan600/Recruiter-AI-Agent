import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RecruiterDashboard } from './components/dashboard/RecruiterDashboard';
import { ViewSkeleton } from './components/common/Skeletons';

// Route-level code splitting: lazy load non-dashboard views to minimize initial bundle
const CandidatePipeline = React.lazy(() =>
  import('./components/pipeline/CandidatePipeline').then((m) => ({ default: m.CandidatePipeline }))
);
const CandidateProfile = React.lazy(() =>
  import('./components/profile/CandidateProfile').then((m) => ({ default: m.CandidateProfile }))
);
const AICandidateMatcher = React.lazy(() =>
  import('./components/matcher/AICandidateMatcher').then((m) => ({ default: m.AICandidateMatcher }))
);
const JobManagement = React.lazy(() =>
  import('./components/jobs/JobManagement').then((m) => ({ default: m.JobManagement }))
);
const InterviewScheduler = React.lazy(() =>
  import('./components/scheduling/InterviewScheduler').then((m) => ({ default: m.InterviewScheduler }))
);
const AssessmentManager = React.lazy(() =>
  import('./components/assessments/AssessmentManager').then((m) => ({ default: m.AssessmentManager }))
);
const AnalyticsView = React.lazy(() =>
  import('./components/analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView }))
);
const AIRecruiterDrawer = React.lazy(() =>
  import('./components/assistant/AIRecruiterDrawer').then((m) => ({ default: m.AIRecruiterDrawer }))
);
const ResumeUploadModal = React.lazy(() =>
  import('./components/common/ResumeUploadModal').then((m) => ({ default: m.ResumeUploadModal }))
);
const NewJobModal = React.lazy(() =>
  import('./components/common/NewJobModal').then((m) => ({ default: m.NewJobModal }))
);

// Prefetch map to preload route chunks when hovering over sidebar navigation
const routePrefetchers: Record<string, () => Promise<any>> = {
  pipeline: () => import('./components/pipeline/CandidatePipeline'),
  profile: () => import('./components/profile/CandidateProfile'),
  matcher: () => import('./components/matcher/AICandidateMatcher'),
  jobs: () => import('./components/jobs/JobManagement'),
  interviews: () => import('./components/scheduling/InterviewScheduler'),
  assessments: () => import('./components/assessments/AssessmentManager'),
  analytics: () => import('./components/analytics/AnalyticsView')
};

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(1);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(1);
  const [activeRole, setActiveRole] = useState<string>('Recruiter');

  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);

  // Idle prefetching for highest-frequency routes
  useEffect(() => {
    const idleFn = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1000));
    idleFn(() => {
      routePrefetchers.pipeline();
      routePrefetchers.jobs();
    });
  }, []);

  const handlePrefetch = useCallback((tab: string) => {
    routePrefetchers[tab]?.();
  }, []);

  const handleNavigate = useCallback((tab: string, candidateId?: number) => {
    if (candidateId) setSelectedCandidateId(candidateId);
    setCurrentTab(tab);
  }, []);

  const handleOpenMatcher = useCallback((candidateId: number, jobId: number) => {
    setSelectedCandidateId(candidateId);
    setSelectedJobId(jobId);
    setCurrentTab('matcher');
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f6fc] text-[#0b1c30] flex flex-col font-sans antialiased selection:bg-[#6cf8bb] selection:text-[#002113]">
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenAgent={() => setIsAgentOpen(true)}
        onPrefetch={handlePrefetch}
      />

      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenNewJob={() => setIsNewJobOpen(true)}
        onOpenAgent={() => setIsAgentOpen(true)}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onNavigate={handleNavigate}
      />

      <main className="ml-[260px] flex-1 pb-16">
        <Suspense fallback={<ViewSkeleton tab={currentTab} />}>
          {currentTab === 'dashboard' && (
            <RecruiterDashboard
              onNavigate={handleNavigate}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenAgent={() => setIsAgentOpen(true)}
            />
          )}

          {currentTab === 'pipeline' && (
            <CandidatePipeline
              onSelectCandidate={(id) => handleNavigate('profile', id)}
              onOpenMatcher={handleOpenMatcher}
            />
          )}

          {currentTab === 'profile' && selectedCandidateId && (
            <CandidateProfile
              candidateId={selectedCandidateId}
              onBack={() => setCurrentTab('pipeline')}
              onOpenMatcher={handleOpenMatcher}
            />
          )}

          {currentTab === 'matcher' && (
            <AICandidateMatcher
              initialCandidateId={selectedCandidateId || 1}
              initialJobId={selectedJobId || 1}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'jobs' && (
            <JobManagement
              onOpenNewJob={() => setIsNewJobOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'interviews' && <InterviewScheduler />}

          {currentTab === 'assessments' && <AssessmentManager />}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'settings' && (
            <div className="p-8 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="card-3d p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#006c49] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined">settings</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-[#0b1c30]">Organization & AI Settings</h1>
                    <p className="text-xs text-[#45464d] mt-0.5">Configure recruiter permissions, LLM model thresholds, and ATS parser integrations.</p>
                  </div>
                </div>
                <div className="mt-6 p-4 inset-depth rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#006c49] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      Connected AI Engine: Gemini 2.5 Pro / Flash
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#6cf8bb] text-[#002113] rounded-full font-black text-[10px]">Active</span>
                  </div>
                  <p className="text-[#45464d]">Role Access Permission: <strong className="text-[#0b1c30]">{activeRole} Level</strong></p>
                </div>
              </div>
            </div>
          )}
        </Suspense>
      </main>

      {/* Lazy Modals & Drawers */}
      <Suspense fallback={null}>
        {isAgentOpen && (
          <AIRecruiterDrawer
            isOpen={isAgentOpen}
            onClose={() => setIsAgentOpen(false)}
            onNavigate={handleNavigate}
          />
        )}

        {isUploadOpen && (
          <ResumeUploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onSuccess={() => setCurrentTab('pipeline')}
          />
        )}

        {isNewJobOpen && (
          <NewJobModal
            isOpen={isNewJobOpen}
            onClose={() => setIsNewJobOpen(false)}
            onSuccess={() => setCurrentTab('jobs')}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
