import React from 'react';

interface AIMatchScoreRing3DProps {
  score: number;
  skillsScore?: number;
  experienceScore?: number;
  educationScore?: number;
  requirementsScore?: number;
}

export const AIMatchScoreRing3D: React.FC<AIMatchScoreRing3DProps> = ({
  score,
  skillsScore = Math.min(score + 3, 99),
  experienceScore = Math.max(score - 3, 85),
  educationScore = Math.min(score + 1, 98),
  requirementsScore = score
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="card-3d p-6 bg-gradient-to-br from-[#131b2e] via-[#1b263e] to-[#0b1c30] text-white shadow-xl relative overflow-hidden border border-[#6cf8bb]/30">
      {/* Background ambient lighting */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#006c49]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#6cf8bb]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* 3D Circular Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-36 h-36 transform -rotate-90 filter drop-shadow-[0_4px_12px_rgba(0,108,73,0.5)]">
            {/* Outer track ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6cf8bb" />
                <stop offset="100%" stopColor="#006c49" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center 3D Score Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              {score}%
            </span>
            <span className="text-[10px] font-extrabold text-[#6cf8bb] uppercase tracking-wider mt-0.5">
              AI Match
            </span>
          </div>
        </div>

        {/* Breakdown Supporting Metrics */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#6cf8bb] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              AI Match Score Breakdown
            </h4>
            <span className="text-[11px] font-bold text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Deep Match Matrix
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl backdrop-blur-xs space-y-1">
              <div className="flex justify-between text-[11px] text-[#c6c6cd]">
                <span>Skills:</span>
                <strong className="text-white font-bold">{skillsScore}%</strong>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#6cf8bb] rounded-full" style={{ width: `${skillsScore}%` }} />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl backdrop-blur-xs space-y-1">
              <div className="flex justify-between text-[11px] text-[#c6c6cd]">
                <span>Experience:</span>
                <strong className="text-white font-bold">{experienceScore}%</strong>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#6cf8bb] rounded-full" style={{ width: `${experienceScore}%` }} />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl backdrop-blur-xs space-y-1">
              <div className="flex justify-between text-[11px] text-[#c6c6cd]">
                <span>Education:</span>
                <strong className="text-white font-bold">{educationScore}%</strong>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#6cf8bb] rounded-full" style={{ width: `${educationScore}%` }} />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl backdrop-blur-xs space-y-1">
              <div className="flex justify-between text-[11px] text-[#c6c6cd]">
                <span>Requirements:</span>
                <strong className="text-white font-bold">{requirementsScore}%</strong>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#6cf8bb] rounded-full" style={{ width: `${requirementsScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
