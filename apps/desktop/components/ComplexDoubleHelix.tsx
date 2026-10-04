"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCw, ZoomIn, ZoomOut, Zap, AlertCircle, ShieldAlert } from "lucide-react";

interface BasePair {
  index: number;
  base1: "A" | "T" | "G" | "C";
  base2: "T" | "A" | "C" | "G";
  locus: string;
  isBreakageLocus: boolean;
  damagePercent: number;
}

interface ComplexDoubleHelixProps {
  breakageLoci?: string[];
  structuralImpactScore?: number;
  organismName?: string;
  onSelectBasePair?: (bp: BasePair) => void;
}

export function ComplexDoubleHelix({
  breakageLoci = [],
  structuralImpactScore = 75,
  organismName = "Query Isolate",
  onSelectBasePair
}: ComplexDoubleHelixProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(0.025);
  const [zoom, setZoom] = useState<number>(1.0);
  const [selectedLocus, setSelectedLocus] = useState<number | null>(14);
  const animFrameRef = useRef<number | null>(null);

  // Generate 28 base pairs representing the double helix segment
  const basePairs: BasePair[] = React.useMemo(() => {
    const bases: ("A" | "T" | "G" | "C")[] = [
      "A", "T", "G", "C", "C", "G", "T", "A", "G", "C", "A", "T", "G", "C",
      "A", "A", "T", "G", "C", "G", "C", "T", "A", "G", "C", "A", "T", "G"
    ];
    const complement: Record<"A" | "T" | "G" | "C", "T" | "A" | "C" | "G"> = {
      A: "T",
      T: "A",
      G: "C",
      C: "G"
    };

    return bases.map((b, i) => {
      // Check if this pair corresponds to a breakage zone (e.g. index 12 to 16)
      const isBreak = i >= 12 && i <= 15;
      return {
        index: i,
        base1: b,
        base2: complement[b],
        locus: `Loci:Chr-${(1245000 + i * 280).toLocaleString()}bp`,
        isBreakageLocus: isBreak,
        damagePercent: isBreak ? structuralImpactScore : Math.max(5, Math.round(structuralImpactScore * 0.15))
      };
    });
  }, [structuralImpactScore]);

  // Animation Loop for smooth 3D rotation
  useEffect(() => {
    const loop = () => {
      if (isRotating) {
        setRotation((prev) => (prev + speed) % (Math.PI * 2));
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRotating, speed]);

  const baseColors: Record<"A" | "T" | "G" | "C", { bg: string; text: string; stroke: string }> = {
    A: { bg: "#059669", text: "#a7f3d0", stroke: "#10b981" }, // Emerald
    T: { bg: "#0284c7", text: "#bae6fd", stroke: "#0ea5e9" }, // Electric Blue / Cyan
    G: { bg: "#d97706", text: "#fde68a", stroke: "#f59e0b" }, // Amber
    C: { bg: "#dc2626", text: "#fecaca", stroke: "#ef4444" }  // Red / Coral
  };

  const activeBp = selectedLocus !== null ? basePairs[selectedLocus] : basePairs[14];

  return (
    <div className="flex flex-col h-full bg-[#070a0c] border border-white/20 rounded-lg overflow-hidden font-mono select-none shadow-2xl">
      {/* Top Controls Bar */}
      <div className="p-2.5 bg-[#0b1013] border-b border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white tracking-wider text-[11px]">
            DOUBLE HELIX 3D // BIOPHYSICAL STRAND TOPOLOGY
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">
            B-DNA CONFORMATION
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Play/Pause Rotation */}
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-1.5 rounded bg-[#131b1f] hover:bg-[#1a252b] text-slate-300 border border-white/10 hover:border-white/30 transition-all"
            title={isRotating ? "Pause 3D rotation" : "Resume 3D rotation"}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-[#131b1f] px-2 py-0.5 rounded border border-white/10">
            <span>RPM:</span>
            {[0.015, 0.03, 0.05].map((s, idx) => (
              <button
                key={idx}
                onClick={() => setSpeed(s)}
                className={`px-1 rounded font-bold ${speed === s ? "text-cyan-300 bg-cyan-950" : "hover:text-white"}`}
              >
                {idx + 1}x
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-1 rounded bg-[#131b1f] text-slate-300 hover:text-white border border-white/10"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-1 rounded bg-[#131b1f] text-slate-300 hover:text-white border border-white/10"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas / SVG 3D Double Helix Render Container */}
      <div className="relative flex-1 min-h-[300px] flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0d161a] via-[#080d0f] to-[#040608]">
        {/* Subtle coordinate grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        {/* 5' and 3' Terminus Annotations */}
        <div className="absolute top-3 left-4 text-[10px] text-emerald-400/80 font-bold tracking-widest flex items-center gap-1">
          <span>5&apos; PRIMARY SENSE STRAND</span>
          <span className="text-slate-500 font-normal">→ 3&apos;</span>
        </div>
        <div className="absolute bottom-3 right-4 text-[10px] text-cyan-400/80 font-bold tracking-widest flex items-center gap-1">
          <span className="text-slate-500 font-normal">3&apos; ←</span>
          <span>5&apos; ANTISENSE STRAND</span>
        </div>

        {/* Active Breakage Callout Overlay */}
        {activeBp && activeBp.isBreakageLocus && (
          <div className="absolute top-3 right-4 p-2 rounded bg-red-950/80 border border-red-500 text-red-300 text-[10px] max-w-xs shadow-lg flex items-start gap-2 animate-pulse z-20">
            <Zap className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white uppercase">Vulnerable Cleavage Locus</div>
              <div className="text-red-200">
                {activeBp.locus} // {organismName} target site ({structuralImpactScore}% disruption risk)
              </div>
            </div>
          </div>
        )}

        {/* 3D Double Helix SVG */}
        <svg
          viewBox="0 0 540 640"
          className="w-full h-full max-h-[520px] transition-transform duration-100"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            {/* Luminous Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="strand1-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="strand2-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Render base pairs sorted by Z-depth for correct occlusion */}
          {(() => {
            const centerY = 320;
            const centerX = 270;
            const helixRadius = 110;
            const heightStep = 19;
            const pitch = 0.32;

            // Compute coordinates for each base pair
            const renderedRungs = basePairs.map((bp) => {
              const y = 50 + bp.index * heightStep;
              const angle = bp.index * pitch + rotation;

              // Strand 1 (Sense)
              const x1 = centerX + Math.cos(angle) * helixRadius;
              const z1 = Math.sin(angle); // -1 (back) to +1 (front)

              // Strand 2 (Antisense, phase shift pi)
              const x2 = centerX + Math.cos(angle + Math.PI) * helixRadius;
              const z2 = Math.sin(angle + Math.PI);

              // Mean Z for ordering
              const meanZ = (z1 + z2) / 2;

              return { bp, x1, y1: y, z1, x2, y2: y, z2, meanZ };
            });

            // Sort so back-facing rungs render first, front-facing render on top
            renderedRungs.sort((a, b) => a.meanZ - b.meanZ);

            return renderedRungs.map((item) => {
              const { bp, x1, y1, z1, x2, y2, z2 } = item;
              const isSelected = selectedLocus === bp.index;
              const isBreak = bp.isBreakageLocus;

              // Depth scaling and opacity
              const r1 = 6 + (z1 + 1) * 2.5; // Radius of backbone node 1
              const r2 = 6 + (z2 + 1) * 2.5; // Radius of backbone node 2
              const opacity = 0.4 + ((z1 + z2) / 4 + 0.5) * 0.6;

              return (
                <g
                  key={bp.index}
                  onClick={() => {
                    setSelectedLocus(bp.index);
                    if (onSelectBasePair) onSelectBasePair(bp);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Connecting Hydrogen Bond Rung */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      isBreak
                        ? "#ef4444"
                        : isSelected
                        ? "#ffffff"
                        : "#64748b"
                    }
                    strokeWidth={isBreak ? 3.5 : isSelected ? 3 : 2}
                    strokeDasharray={isBreak ? "4 3" : undefined}
                    opacity={opacity}
                    filter={isBreak ? "url(#glow)" : undefined}
                    className="transition-all duration-150 group-hover:stroke-white"
                  />

                  {/* Mid-point Base Pair Marker */}
                  {(() => {
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;
                    return (
                      <g>
                        {/* Base 1 badge on the left segment */}
                        <circle
                          cx={x1 + (midX - x1) * 0.45}
                          cy={midY}
                          r={3.5}
                          fill={baseColors[bp.base1].stroke}
                          opacity={opacity}
                        />
                        {/* Base 2 badge on the right segment */}
                        <circle
                          cx={x2 + (midX - x2) * 0.45}
                          cy={midY}
                          r={3.5}
                          fill={baseColors[bp.base2].stroke}
                          opacity={opacity}
                        />

                        {/* If Cleavage Point, draw ruptured stress rings */}
                        {isBreak && (
                          <circle
                            cx={midX}
                            cy={midY}
                            r={7}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth={1.5}
                            className="animate-ping"
                          />
                        )}
                      </g>
                    );
                  })()}

                  {/* Backbone Phosphate Node 1 (Strand A) */}
                  <circle
                    cx={x1}
                    cy={y1}
                    r={r1}
                    fill={z1 > 0 ? "#10b981" : "#047857"}
                    stroke={isSelected ? "#ffffff" : "#a7f3d0"}
                    strokeWidth={1.5}
                    filter={z1 > 0.4 ? "url(#glow)" : undefined}
                    className="transition-all"
                  />
                  {z1 > 0 && (
                    <text
                      x={x1}
                      y={y1 + 3}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="7.5"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {bp.base1}
                    </text>
                  )}

                  {/* Backbone Phosphate Node 2 (Strand B) */}
                  <circle
                    cx={x2}
                    cy={y2}
                    r={r2}
                    fill={z2 > 0 ? "#06b6d4" : "#0369a1"}
                    stroke={isSelected ? "#ffffff" : "#bae6fd"}
                    strokeWidth={1.5}
                    filter={z2 > 0.4 ? "url(#glow)" : undefined}
                    className="transition-all"
                  />
                  {z2 > 0 && (
                    <text
                      x={x2}
                      y={y2 + 3}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="7.5"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {bp.base2}
                    </text>
                  )}
                </g>
              );
            });
          })()}
        </svg>

        {/* Legend Panel at Bottom Left */}
        <div className="absolute bottom-3 left-4 p-2 rounded bg-black/80 border border-white/15 text-[10px] space-y-1 z-20 backdrop-blur-sm">
          <div className="text-slate-400 font-bold uppercase text-[9px]">Watson-Crick Base Pairs:</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Adenine (A)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-500" /> Thymine (T)
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Guanine (G)
            </span>
            <span className="flex items-center gap-1.5 text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Cytosine (C)
            </span>
          </div>
        </div>
      </div>

      {/* Selected Base Pair Inspector Strip */}
      {activeBp && (
        <div className="p-3 bg-[#0d1317] border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-black border border-white/20 font-bold text-white">
              {activeBp.base1} ══ {activeBp.base2}
            </div>
            <div>
              <div className="text-white font-bold flex items-center gap-2">
                <span>{activeBp.locus}</span>
                {activeBp.isBreakageLocus ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-950 border border-red-500 text-red-300">
                    CRITICAL CLEAVAGE LOCUS
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 border border-emerald-500 text-emerald-300">
                    STABLE DUPLEX
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                Hydrogen Bonds: {activeBp.base1 === "G" || activeBp.base1 === "C" ? "3 (Triple H-Bond)" : "2 (Double H-Bond)"} // Thermodynamic Binding dG: -2.4 kcal/mol
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[9px]">LOCAL DAMAGE INDEX</span>
              <span className={`font-bold ${activeBp.damagePercent > 50 ? "text-red-400" : "text-emerald-400"}`}>
                {activeBp.damagePercent}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">HELIX CONFORMATION</span>
              <span className="text-cyan-300 font-bold">Right-handed 10.5 bp/turn</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
