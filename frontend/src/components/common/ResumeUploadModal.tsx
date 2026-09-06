import React, { useState } from 'react';
import { uploadCandidateResume } from '../../services/api';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadStep = 'idle' | 'uploading' | 'parsing' | 'screening' | 'complete';

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF or DOCX resume file.');
      return;
    }

    setUploadStep('uploading');
    setError(null);

    // Simulate progressive UI states while the async API processes
    const stepTimer1 = setTimeout(() => setUploadStep('parsing'), 600);
    const stepTimer2 = setTimeout(() => setUploadStep('screening'), 1400);

    try {
      await uploadCandidateResume(file);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setUploadStep('complete');
      setTimeout(() => {
        setUploadStep('idle');
        setFile(null);
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setError(err.message || 'Failed to upload resume. Please try again.');
      setUploadStep('idle');
    }
  };

  const isProcessing = uploadStep !== 'idle';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={isProcessing ? undefined : onClose} />

      {/* Floating Spatial Modal Layer */}
      <div className="relative bg-white/95 backdrop-blur-xl border border-[#d3e4fe] rounded-3xl p-6 max-w-md w-full shadow-2xl z-10 space-y-5 depth-l4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006c49] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-base">cloud_upload</span>
            </div>
            <h2 className="text-base font-black text-[#0b1c30]">Upload Candidate Resume</h2>
          </div>
          {!isProcessing && (
            <button onClick={onClose} className="text-[#76777d] hover:text-[#0b1c30] p-1 cursor-pointer">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className={`border-2 border-dashed ${file ? 'border-[#006c49] bg-[#eff4ff]/50' : 'border-[#c6c6cd] bg-[#f8f9ff]'} hover:border-[#006c49] rounded-2xl p-6 text-center space-y-3 inset-depth relative transition-colors`}>
            <span className={`material-symbols-outlined text-4xl ${file ? 'text-[#006c49]' : 'text-[#76777d]'}`}>
              description
            </span>
            <div>
              <p className="text-xs font-bold text-[#0b1c30]">
                {file ? file.name : 'Click to select or drag PDF/DOCX resume'}
              </p>
              <p className="text-[11px] text-[#76777d] mt-1 font-medium">Supports PDF, DOCX up to 10MB</p>
            </div>
            {!isProcessing && (
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            )}
          </div>

          {/* Progressive Step Progress Indicator */}
          {isProcessing && (
            <div className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#d3e4fe] space-y-3">
              <div className="flex justify-between items-center text-xs font-black text-[#006c49]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  {uploadStep === 'uploading' && 'Step 1: Uploading Resume Document...'}
                  {uploadStep === 'parsing' && 'Step 2: Extracting Text, Skills & History...'}
                  {uploadStep === 'screening' && 'Step 3: Calculating AI ATS & Match Score...'}
                  {uploadStep === 'complete' && '✓ Candidate Processed Successfully!'}
                </span>
                <span className="text-[11px]">
                  {uploadStep === 'uploading' && '25%'}
                  {uploadStep === 'parsing' && '55%'}
                  {uploadStep === 'screening' && '85%'}
                  {uploadStep === 'complete' && '100%'}
                </span>
              </div>
              <div className="w-full h-2 bg-[#eff4ff] rounded-full overflow-hidden inset-depth">
                <div
                  className="h-full bg-gradient-to-r from-[#006c49] to-[#6cf8bb] transition-all duration-500 rounded-full"
                  style={{
                    width:
                      uploadStep === 'uploading'
                        ? '25%'
                        : uploadStep === 'parsing'
                        ? '55%'
                        : uploadStep === 'screening'
                        ? '85%'
                        : '100%'
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-[#93000a] font-bold bg-[#ffdad6] p-3 rounded-xl border border-[#ba1a1a]/30">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="btn-3d btn-3d-glass px-4 py-2 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className="btn-3d btn-3d-emerald px-4 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? 'Processing Pipeline...' : 'Upload & Parse AI'}
          </button>
        </div>
      </div>
    </div>
  );
};
