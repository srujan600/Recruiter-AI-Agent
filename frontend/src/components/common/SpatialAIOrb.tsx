import React from 'react';

interface SpatialAIOrbProps {
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const SpatialAIOrb: React.FC<SpatialAIOrbProps> = ({ size = 'md', active = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-24 h-24'
  }[size];

  const ringSizes = {
    sm: 'w-10 h-10 -top-1 -left-1',
    md: 'w-18 h-18 -top-2 -left-2',
    lg: 'w-32 h-32 -top-4 -left-4'
  }[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses}`}>
      {/* Ambient Outer Glow */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#006c49] via-[#6cf8bb] to-[#d3e4fe] opacity-50 blur-md ${
          active ? 'animate-pulse-glow' : ''
        }`}
      />

      {/* 3D Concentric Rotating Ring */}
      <div
        className={`absolute rounded-full border border-dashed border-[#6cf8bb]/60 ${ringSizes} ${
          active ? 'animate-rotate-ring' : ''
        }`}
      />

      {/* Spatial 3D Glass Orb Core */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#131b2e] via-[#006c49] to-[#002113] p-0.5 shadow-lg border border-[#6cf8bb]/40 overflow-hidden flex items-center justify-center">
        {/* Specular Highlight Arc */}
        <div className="absolute top-1 left-1 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />

        {/* Inner AI Icon */}
        <span className="material-symbols-outlined text-white text-opacity-95 text-lg md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10 animate-pulse">
          auto_awesome
        </span>
      </div>
    </div>
  );
};
