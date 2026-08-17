import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RecruiterDashboard } from './components/dashboard/RecruiterDashboard';
import { CandidatePipeline } from './components/pipeline/CandidatePipeline';
import { CandidateProfile } from './components/profile/CandidateProfile';
import { AICandidateMatcher } from './components/matcher/AICandidateMatcher';
import { JobManagement } from './components/jobs/JobManagement';
import { InterviewScheduler } from './components/scheduling/InterviewScheduler';
import { AssessmentManager } from './components/assessments/AssessmentManager';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AIRecruiterDrawer } from './components/assistant/AIRecruiterDrawer';
import { ResumeUploadModal } from './components/common/ResumeUploadModal';
import { NewJobModal } from './components/common/NewJobModal';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(1);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(1);
  const [activeRole, setActiveRole] = useState<string>('Recruiter');

  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);

  const handleNavigate = (tab: string, candidateId?: number) => {
    if (candidateId) setSelectedCandidateId(candidateId);
    setCurrentTab(tab);
  };

  const handleOpenMatcher = (candidateId: number, jobId: number) => {
    setSelectedCandidateId(candidateId);
    setSelectedJobId(jobId);
    setCurrentTab('matcher');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenAgent={() => setIsAgentOpen(true)}
      />

      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenNewJob={() => setIsNewJobOpen(true)}
        onOpenAgent={() => setIsAgentOpen(true)}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
      />

      <main className="ml-[260px] flex-1 pb-16">
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
          <div className="p-8 max-w-[1440px] mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#d3e4fe]">
              <h1 className="text-xl font-black text-[#0b1c30]">Organization & AI Settings</h1>
              <p className="text-xs text-[#45464d] mt-1">Configure recruiter permissions, LLM model thresholds, and ATS parser integrations.</p>
              <div className="mt-4 p-4 bg-[#f8f9ff] rounded-xl border border-[#d3e4fe] text-xs">
                <p className="font-bold text-[#006c49]">Connected AI Model: Gemini 2.5 Pro / Flash</p>
                <p className="text-[#45464d] mt-1">Role Permission: {activeRole} Access Level</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <AIRecruiterDrawer
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        onNavigate={handleNavigate}
      />

      <ResumeUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => setCurrentTab('pipeline')}
      />

      <NewJobModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        onSuccess={() => setCurrentTab('jobs')}
      />
    </div>
  );
}

export default App;
