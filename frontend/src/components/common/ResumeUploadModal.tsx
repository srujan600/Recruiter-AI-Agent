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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white border border-[#d3e4fe] rounded-3xl p-6 max-w-md w-full shadow-2xl z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c49]">cloud_upload</span>
            <h2 className="text-base font-black text-[#0b1c30]">Upload Candidate Resume</h2>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#0b1c30]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-[#c6c6cd] hover:border-[#006c49] rounded-2xl p-6 text-center space-y-3 bg-[#f8f9ff]">
            <span className="material-symbols-outlined text-4xl text-[#006c49]">description</span>
            <div>
              <p className="text-xs font-bold text-[#0b1c30]">
                {file ? file.name : 'Click to select or drag PDF/DOCX resume'}
              </p>
              <p className="text-[11px] text-[#76777d] mt-1">Supports PDF, DOCX up to 10MB</p>
            </div>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {error && (
            <p className="text-xs text-[#93000a] font-bold bg-[#ffdad6] p-2.5 rounded-xl border border-[#ba1a1a]/30">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#c6c6cd] text-[#45464d] text-xs font-bold rounded-xl hover:bg-[#f8f9ff]"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-[#006c49] hover:bg-[#005236] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-2"
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
