import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Sparkles, 
  Maximize2, 
  RotateCw, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Eye, 
  Sparkle
} from 'lucide-react';
import type { Candidate, ScreeningResult } from '../../types';

interface CandidateSpatialNodePreviewProps {
  candidate: Candidate;
  screening?: ScreeningResult | null;
  onOpenMatcher?: () => void;
  onClosePreview?: () => void;
}

// 3D Orbital Satellite Badge for Skills
function SkillSatellite({ 
  name, 
  radius, 
  speed, 
  color, 
  offset = 0,
  score
}: { 
  name: string; 
  radius: number; 
  speed: number; 
  color: string; 
  offset?: number;
  score?: number;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime() * speed + offset;
      meshRef.current.position.x = Math.cos(time) * radius;
      meshRef.current.position.z = Math.sin(time) * radius;
      meshRef.current.position.y = Math.sin(time * 1.5) * 0.4;
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.6} 
        />
      </mesh>
      
      {/* Skill Label DOM Overlay in 3D Space */}
      <Html distanceFactor={10} center className="pointer-events-none select-none">
        <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-[10px] font-bold text-slate-100 flex items-center gap-1.5 shadow-lg whitespace-nowrap">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span>{name}</span>
          {score && <span className="text-[#6cf8bb] font-extrabold">{score}%</span>}
        </div>
      </Html>
    </group>
  );
}

// Glowing Orbital Ring Component
function OrbitalRing({ radius, color, rotation = [Math.PI / 3, 0, 0] }: { radius: number; color: string; rotation?: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.003;
    }
  });

  return (
    <mesh ref={ringRef} rotation={rotation}>
      <torusGeometry args={[radius, 0.015, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  );
}

// Central Spatial Node representing Candidate Profile
function CandidateCoreNode({ candidate, matchScore = 94, autoRotate = true }: { candidate: Candidate; matchScore?: number; autoRotate?: boolean }) {
  const coreRef = useRef<THREE.Group>(null);
  const outerSphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (coreRef.current && autoRotate) {
      coreRef.current.rotation.y += 0.005;
    }
    if (outerSphereRef.current) {
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 2) * 0.03;
      outerSphereRef.current.scale.set(scale, scale, scale);
    }
  });

  const skills = [
    { name: 'React / Next.js', radius: 2.2, speed: 0.6, color: '#38bdf8', offset: 0, score: 98 },
    { name: 'TypeScript', radius: 2.8, speed: 0.45, color: '#818cf8', offset: 2, score: 95 },
    { name: 'System Design', radius: 3.4, speed: 0.35, color: '#6cf8bb', offset: 4, score: 91 },
    { name: 'AI Integration', radius: 2.5, speed: 0.5, color: '#f472b6', offset: 1.5, score: 88 }
  ];

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={coreRef}>
        {/* Core Pulsing Sphere */}
        <mesh ref={outerSphereRef}>
          <sphereGeometry args={[1.0, 64, 64]} />
          <MeshDistortMaterial
            color="#006c49"
            attach="material"
            distort={0.25}
            speed={2}
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Inner Glowing Core */}
        <mesh>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshBasicMaterial color="#6cf8bb" wireframe transparent opacity={0.6} />
        </mesh>

        {/* Dynamic Orbital Rings */}
        <OrbitalRing radius={2.2} color="#38bdf8" rotation={[Math.PI / 3, Math.PI / 6, 0]} />
        <OrbitalRing radius={2.8} color="#818cf8" rotation={[Math.PI / 4, -Math.PI / 4, 0]} />
        <OrbitalRing radius={3.4} color="#6cf8bb" rotation={[Math.PI / 2.5, 0, Math.PI / 5]} />

        {/* Satellite Skill Nodes */}
        {skills.map((skill, i) => (
          <SkillSatellite key={i} {...skill} />
        ))}

        {/* Central Candidate Avatar / Tag Badge in 3D Space */}
        <Html distanceFactor={8} center position={[0, 1.45, 0]} className="pointer-events-none select-none">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img 
                src={candidate.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                alt={candidate.full_name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#6cf8bb] shadow-2xl ring-4 ring-[#006c49]/40"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#6cf8bb] border-2 border-slate-900 rounded-full" />
            </div>
            <div className="mt-2 px-3 py-1 bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl rounded-xl text-center shadow-xl">
              <span className="text-xs font-black text-slate-100 block">{candidate.full_name}</span>
              <span className="text-[10px] text-[#6cf8bb] font-bold block">{matchScore}% Match Score</span>
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// 3D Canvas Fallback Loader
function Canvas3DLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl p-5 rounded-2xl shadow-2xl">
        <div className="w-8 h-8 border-3 border-[#6cf8bb] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-200 tracking-wide">Compiling 3D Spatial Canvas...</span>
      </div>
    </Html>
  );
}

export const CandidateSpatialNodePreview: React.FC<CandidateSpatialNodePreviewProps> = ({
  candidate,
  screening,
  onOpenMatcher,
  onClosePreview
}) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const overallMatch = screening?.overall_match_score || 94;
  const atsScore = screening?.ats_score || 92;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl text-slate-100 font-sans">
      {/* 2D Glassmorphic Header Toolbar (ui-ux-pro-max & design-spatial) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Side: Candidate Identity Badge */}
        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 px-4 py-2.5 rounded-2xl flex items-center gap-3.5 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006c49] to-[#009b67] text-white flex items-center justify-center font-black shadow-md">
            <Cpu className="w-5 h-5 text-[#6cf8bb]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-tight">{candidate.full_name}</h2>
              <span className="px-2 py-0.5 bg-[#6cf8bb]/20 text-[#6cf8bb] text-[10px] font-extrabold rounded-full border border-[#6cf8bb]/40">
                Spatial Node Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              {candidate.current_role || 'Senior Software Engineer'} • {candidate.location}
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Controls */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 p-1.5 rounded-2xl shadow-2xl">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              autoRotate 
                ? 'bg-[#6cf8bb] text-slate-950 shadow-md' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{autoRotate ? 'Auto Rotating' : 'Rotate Node'}</span>
          </button>

          {onOpenMatcher && (
            <button
              onClick={onOpenMatcher}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Matcher</span>
            </button>
          )}

          {onClosePreview && (
            <button
              onClick={onClosePreview}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
              title="Close Spatial View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3D WebGL Canvas Surface */}
      <div className="relative w-full h-[480px] sm:h-[540px]">
        {!webGLError ? (
          <Canvas
            dpr={isMobile ? 1 : [1, 2]}
            camera={{ position: [0, 0, 6.5], fov: 45 }}
            onCreated={({ gl }) => {
              gl.setClearColor(new THREE.Color('#020617'));
            }}
            onError={() => setWebGLError(true)}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} />
            <pointLight position={[-10, -10, -5]} intensity={0.8} color="#6cf8bb" />
            <pointLight position={[5, -5, 5]} intensity={0.6} color="#818cf8" />
            
            <Suspense fallback={<Canvas3DLoader />}>
              <CandidateCoreNode candidate={candidate} matchScore={overallMatch} autoRotate={autoRotate} />
            </Suspense>

            {/* OrbitControls: Touch scroll friendly with restricted zoom and max pitch */}
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 1.6} 
              minPolarAngle={Math.PI / 4}
              autoRotate={false}
            />
          </Canvas>
        ) : (
          /* WebGL Fallback Card */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 text-center">
            <ShieldCheck className="w-12 h-12 text-[#6cf8bb] mb-3" />
            <h3 className="text-base font-extrabold text-white">Interactive Node Mode Active</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Rendering candidate parameters via high-performance spatial UI fallback.
            </p>
          </div>
        )}

        {/* Dynamic Background Particle Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      </div>

      {/* 2D Glassmorphic Bottom Panel (Candidate Match Insights & Skills) */}
      <div className="p-5 bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 z-20 relative">
        {/* Overall Match Gauge Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6cf8bb]/10 border border-[#6cf8bb]/30 flex items-center justify-center text-[#6cf8bb]">
              <Sparkle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">AI Match Score</span>
              <span className="text-lg font-black text-white">{overallMatch}% Fit</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">ATS Compatibility</span>
            <span className="text-sm font-extrabold text-[#6cf8bb]">{atsScore}%</span>
          </div>
        </div>

        {/* Top Skill Badges */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl flex flex-col justify-center space-y-1.5">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            Extracted Skills Orbital
          </span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {['React', 'TypeScript', 'System Architecture', 'Node.js'].map((skill, idx) => (
              <span key={idx} className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-bold">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Action & Controls Hint */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#6cf8bb]" />
              Spatial Controls
            </span>
            <p className="text-[11px] text-slate-300 font-medium">
              Drag canvas to orbit node • Auto-rotates
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6cf8bb] animate-ping" />
            <span className="text-[10px] font-black text-[#6cf8bb] uppercase">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateSpatialNodePreview;
