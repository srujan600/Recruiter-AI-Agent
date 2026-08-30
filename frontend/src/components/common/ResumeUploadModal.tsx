import React, { useState } from 'react';
import { uploadCandidateResume } from '../../services/api';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF or DOCX resume file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadCandidateResume(file);
      setUploading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Floating Spatial Modal Layer (Level 4 Depth) */}
      <div className="relative bg-white/95 backdrop-blur-xl border border-[#d3e4fe] rounded-3xl p-6 max-w-md w-full shadow-2xl z-10 space-y-5 depth-l4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006c49] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-base">cloud_upload</span>
            </div>
            <h2 className="text-base font-black text-[#0b1c30]">Upload Candidate Resume</h2>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#0b1c30] p-1">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-[#c6c6cd] hover:border-[#006c49] rounded-2xl p-6 text-center space-y-3 bg-[#f8f9ff] inset-depth relative">
            <span className="material-symbols-outlined text-4xl text-[#006c49] animate-bounce">description</span>
            <div>
              <p className="text-xs font-bold text-[#0b1c30]">
                {file ? file.name : 'Click to select or drag PDF/DOCX resume'}
              </p>
              <p className="text-[11px] text-[#76777d] mt-1 font-medium">Supports PDF, DOCX up to 10MB</p>
            </div>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {error && (
            <p className="text-xs text-[#93000a] font-bold bg-[#ffdad6] p-3 rounded-xl border border-[#ba1a1a]/30">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="btn-3d btn-3d-glass px-4 py-2 text-xs font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-3d btn-3d-emerald px-4 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2"
          >
            {uploading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                Parsing Resume...
              </>
            ) : (
              'Upload & Parse AI'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
