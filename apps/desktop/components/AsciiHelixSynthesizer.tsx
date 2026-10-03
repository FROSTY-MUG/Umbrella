"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Sparkles, CheckCircle2, AlertTriangle, Activity, Dna } from "lucide-react";

export interface HelixRung {
  index: number;
  position: number; // coordinate along sequence
  queryBase: "A" | "T" | "G" | "C";
  refBase: "A" | "T" | "G" | "C";
  status: "match" | "snp" | "indel" | "telomere" | "methylated";
  annotation: string;
  hydrogenBonds: 2 | 3;
  phase: number; // 0 to 2PI for helical sine offset
}

interface AsciiHelixSynthesizerProps {
  progress: number; // 0 to 100
  isRunning: boolean;
  onComplete?: () => void;
  demographicLabel?: string;
  subjectName?: string;
  customSequence?: string;
}

export function AsciiHelixSynthesizer({
  progress,
  isRunning,
  demographicLabel = "Male (46,XY) // Adult (36-55 yrs)",
  subjectName = "Uploaded Subject DNA",
  customSequence
}: AsciiHelixSynthesizerProps) {
  const [viewMode, setViewMode] = useState<"ladder" | "3d_helix" | "split">("ladder");
  const [helixRungs, setHelixRungs] = useState<HelixRung[]>([]);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Generate rungs based on sequence or sample
  useEffect(() => {
    const bases: ("A" | "T" | "G" | "C")[] = ["A", "T", "G", "C", "T", "A", "G", "C", "A", "G", "C", "T"];
    const rungs: HelixRung[] = [];
    const totalRungs = 28;

    for (let i = 0; i < totalRungs; i++) {
      const qBase = bases[(i * 3 + 1) % bases.length];
      let rBase = qBase;
      let status: HelixRung["status"] = "match";
      let annotation = "Conserved Base";

      // Inject biologically meaningful variants along the strand
      if (i === 4 || i === 18) {
        status = "telomere";
        annotation = "Telomeric Repeat (TTAGGG)";
      } else if (i === 9) {
        rBase = qBase === "C" ? "T" : "C";
        status = "snp";
        annotation = "Cohort Variant C>T (Horvath Clock Marker)";
      } else if (i === 14) {
        status = "methylated";
        annotation = "CpG Island Methylation [5mC]";
      } else if (i === 22) {
        rBase = qBase === "G" ? "A" : "G";
        status = "snp";
        annotation = "Longevity Associated SNP rs2802292";
      }

      const hydrogenBonds: 2 | 3 = (qBase === "G" && rBase === "C") || (qBase === "C" && rBase === "G") ? 3 : 2;

      rungs.push({
        index: i,
        position: 1042000 + i * 48,
        queryBase: qBase,
        refBase: rBase,
        status,
        annotation,
        hydrogenBonds,
        phase: (i / totalRungs) * Math.PI * 4
      });
    }

    setHelixRungs(rungs);
  }, [customSequence]);

  // Continuous gentle 3D rotation frame loop
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRotationAngle((prev) => (prev + (isRunning ? 0.05 : 0.015)) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  // Calculate how many rungs have built themselves
  const totalRungs = helixRungs.length;
  const completedRungsCount = Math.floor((progress / 100) * totalRungs);
  const activeRungIndex = Math.min(totalRungs - 1, completedRungsCount);

  // Nucleotide color map
  const getBaseColor = (base: string) => {
    switch (base) {
      case "A":
        return "text-amber-400 font-bold";
      case "T":
        return "text-cyan-400 font-bold";
      case "G":
        return "text-emerald-400 font-bold";
      case "C":
        return "text-purple-400 font-bold";
      default:
        return "text-slate-300";
    }
  };

  const getStatusBadge = (status: HelixRung["status"]) => {
    switch (status) {
      case "match":
        return <span className="text-[10px] text-emerald-400/90 font-mono">OK: CONCORDANT</span>;
      case "snp":
        return <span className="text-[10px] text-rose-400 font-bold font-mono bg-rose-950/40 px-1 py-0.5 rounded border border-rose-800/60 animate-pulse">SNP VARIANT</span>;
      case "telomere":
        return <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/40 px-1 py-0.5 rounded border border-cyan-800/60">TELO-CAP</span>;
      case "methylated":
        return <span className="text-[10px] text-amber-300 font-mono bg-amber-950/40 px-1 py-0.5 rounded border border-amber-800/60">•CH3 EPIGENETIC</span>;
      default:
        return <span className="text-[10px] text-slate-400 font-mono">ALIGN</span>;
    }
  };

  return (
    <div className="bg-surface-secondary/70 border border-surface-border rounded-lg overflow-hidden flex flex-col font-mono">
      {/* Top Banner / Telemetry Strip */}
      <div className="p-3 bg-surface border-b border-surface-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <Dna className="w-3.5 h-3.5 text-emerald-400" />
            ASCII DNA HELIX SYNTHESIS ENGINE
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-tertiary text-slate-400 border border-surface-border">
            v2.4-PROG-SYNTH
          </span>
        </div>

        {/* View Mode Switcher with Framer Motion pill */}
        <div className="flex items-center bg-surface-tertiary/80 p-0.5 rounded-md border border-surface-border">
          {(["ladder", "3d_helix", "split"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="relative px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono text-slate-300 transition-colors z-10"
            >
              {viewMode === mode && (
                <motion.div
                  layoutId="helixViewModePill"
                  className="absolute inset-0 bg-emerald-950/80 border border-emerald-500/60 rounded"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-20">
                {mode === "ladder" ? "Ladder Assembly" : mode === "3d_helix" ? "3D ASCII Helix" : "Dual Matrix"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Live Telemetry Strip */}
      <div className="px-4 py-2 bg-surface/50 border-b border-surface-border/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500">SUBJECT:</span>{" "}
            <span className="text-slate-200 font-semibold">{subjectName}</span>
          </div>
          <div>
            <span className="text-slate-500">COHORT:</span>{" "}
            <span className="text-emerald-400">{demographicLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">SYNTHESIS:</span>
            <span className="text-emerald-300 font-bold">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-24 h-1.5 bg-surface-tertiary rounded-full overflow-hidden border border-surface-border">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-300"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] text-slate-400">
            {completedRungsCount}/{totalRungs} Rungs Locked
          </span>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#05080a] min-h-[380px] max-h-[500px] overflow-hidden relative">
        {/* Subtle Scanline Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:16px_16px] opacity-40 z-0" />

        {/* View: Ladder Assembly Mode (Self-building strand) */}
        {(viewMode === "ladder" || viewMode === "split") && (
          <div
            className={`${
              viewMode === "split" ? "md:col-span-7" : "md:col-span-12"
            } overflow-y-auto max-h-[460px] pr-2 space-y-1 z-10 custom-scrollbar`}
          >
            <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between pb-1 border-b border-surface-border/40">
              <span className="text-cyan-400">5&apos; [UPLOADED QUERY STRAND]</span>
              <span className="text-slate-400">HYDROGEN BONDING LADDER</span>
              <span className="text-emerald-400">[DEMOGRAPHIC BENCHMARK] 3&apos;</span>
            </div>

            {helixRungs.map((rung) => {
              const isBuilt = rung.index <= completedRungsCount;
              const isCurrentlyBuilding = rung.index === completedRungsCount && isRunning;

              // Compute width of sine wave offset to simulate 3D ladder perspective
              const sineVal = Math.sin(rung.phase + rotationAngle);
              const widthSpaces = Math.max(3, Math.round(7 + sineVal * 5));
              const bondChar = rung.hydrogenBonds === 3 ? "≡" : "=";
              const bondString = isBuilt
                ? bondChar.repeat(widthSpaces)
                : "·".repeat(widthSpaces);

              return (
                <motion.div
                  key={rung.index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: isBuilt ? 1 : 0.25,
                    x: 0,
                    backgroundColor: isCurrentlyBuilding
                      ? "rgba(16, 185, 129, 0.12)"
                      : "transparent"
                  }}
                  transition={{ duration: 0.2 }}
                  className={`text-[11px] font-mono leading-none py-0.5 px-2 rounded flex items-center justify-between transition-colors ${
                    isBuilt
                      ? rung.status === "snp"
                        ? "border-l-2 border-rose-500 bg-rose-950/20"
                        : rung.status === "telomere"
                        ? "border-l-2 border-cyan-400 bg-cyan-950/15"
                        : "border-l-2 border-emerald-500/40"
                      : "border-l-2 border-slate-800"
                  }`}
                >
                  {/* Left: Query Base */}
                  <div className="flex items-center gap-1.5 w-24">
                    <span className="text-[9px] text-slate-600">#{rung.index.toString().padStart(2, "0")}</span>
                    {isBuilt ? (
                      <span className={`px-1.5 py-0.5 rounded bg-surface border border-surface-border ${getBaseColor(rung.queryBase)}`}>
                        {rung.queryBase}
                      </span>
                    ) : (
                      <span className="text-slate-700 px-1.5 py-0.5 font-mono">·</span>
                    )}
                    <span className="text-[9px] text-slate-500">
                      {isBuilt ? (rung.index % 2 === 0 ? "╱" : "╲") : "┆"}
                    </span>
                  </div>

                  {/* Center: ASCII Hydrogen Bond Scaffold */}
                  <div className="flex-1 flex items-center justify-center gap-1 overflow-hidden px-2">
                    <span className="text-slate-600 text-[10px]">
                      {isBuilt ? (rung.index % 2 === 0 ? "╭" : "╰") : "·"}
                    </span>
                    <span
                      className={`tracking-widest ${
                        isBuilt
                          ? rung.status === "snp"
                            ? "text-rose-400 font-bold"
                            : rung.status === "telomere"
                            ? "text-cyan-300 font-bold"
                            : "text-emerald-400/80"
                          : "text-slate-700"
                      }`}
                    >
                      {isBuilt ? bondString : "·······"}
                    </span>
                    <span className="text-slate-600 text-[10px]">
                      {isBuilt ? (rung.index % 2 === 0 ? "╮" : "╯") : "·"}
                    </span>
                  </div>

                  {/* Right: Benchmark Reference Base & Annotation */}
                  <div className="flex items-center gap-2 justify-end w-44">
                    <span className="text-[9px] text-slate-500">
                      {isBuilt ? (rung.index % 2 === 0 ? "╲" : "╱") : "┆"}
                    </span>
                    {isBuilt ? (
                      <span className={`px-1.5 py-0.5 rounded bg-surface border border-surface-border ${getBaseColor(rung.refBase)}`}>
                        {rung.refBase}
                      </span>
                    ) : (
                      <span className="text-slate-700 px-1.5 py-0.5 font-mono">·</span>
                    )}
                    <div className="w-24 text-right">
                      {isBuilt ? (
                        getStatusBadge(rung.status)
                      ) : (
                        <span className="text-[9px] text-slate-700">SYNTHESIZING...</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View: 3D Procedural ASCII Double Helix */}
        {(viewMode === "3d_helix" || viewMode === "split") && (
          <div
            className={`${
              viewMode === "split" ? "md:col-span-5" : "md:col-span-12"
            } flex flex-col items-center justify-center bg-surface-secondary/40 border border-surface-border/80 rounded-md p-3 relative overflow-hidden z-10`}
          >
            <div className="absolute top-2 left-2 text-[9px] text-emerald-400/80 font-mono flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400 animate-spin" />
              ROTATING PROCEDURAL ASCII HELIX [3D ROTATION: {(rotationAngle * 57.3).toFixed(0)}°]
            </div>

            {/* Generated 3D ASCII Double Helix text block */}
            <pre className="font-mono text-[10px] md:text-[11px] leading-[1.1] text-center select-none text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] my-auto">
              {generate3dAsciiHelix(rotationAngle, progress, completedRungsCount)}
            </pre>

            <div className="mt-2 text-[10px] text-slate-500 text-center flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Strand A (Query)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Strand B (Benchmark)
              </span>
              <span className="text-slate-400">
                Twist: {(Math.sin(rotationAngle) * 36).toFixed(1)}°/base
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Live Active Rung Diagnostic Bar */}
      <div className="p-3 bg-surface border-t border-surface-border flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">ACTIVE LOCUS:</span>
          {helixRungs[activeRungIndex] ? (
            <span className="text-slate-200 font-mono text-[11px]">
              Chr22:{helixRungs[activeRungIndex].position} [
              {helixRungs[activeRungIndex].queryBase} ↔ {helixRungs[activeRungIndex].refBase}] —{" "}
              <span className="text-emerald-400">{helixRungs[activeRungIndex].annotation}</span>
            </span>
          ) : (
            <span className="text-slate-500">Standby for alignment...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono">
            HYDROGEN BONDS: {helixRungs.slice(0, completedRungsCount).reduce((acc, r) => acc + r.hydrogenBonds, 0)} FORMED
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 font-mono">
            CONCORDANCE: {completedRungsCount > 0 ? ((completedRungsCount - 2) / completedRungsCount * 100).toFixed(1) : 100}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Procedural 3D ASCII Helix Generator
function generate3dAsciiHelix(angle: number, progress: number, maxLines: number = 24): string {
  const lines: string[] = [];
  const height = 18;
  const width = 36;
  const halfWidth = width / 2;
  const frequency = 0.45;

  const visibleLinesCount = Math.max(3, Math.floor((progress / 100) * height));

  for (let y = 0; y < height; y++) {
    if (y > visibleLinesCount) {
      lines.push(" ".repeat(width));
      continue;
    }

    const t = y * frequency + angle;
    const sin1 = Math.sin(t);
    const cos1 = Math.cos(t);

    const x1 = Math.round(halfWidth + sin1 * (halfWidth - 4));
    const x2 = Math.round(halfWidth - sin1 * (halfWidth - 4));

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);

    let row = new Array(width).fill(" ");

    // Fill hydrogen bond characters between strands
    for (let x = minX + 1; x < maxX; x++) {
      row[x] = cos1 > 0 ? "=" : "-";
    }

    // Strand 1 node (Query Strand)
    const char1 = cos1 > 0 ? "A" : "T";
    row[x1] = `[${char1}]`;

    // Strand 2 node (Benchmark Strand)
    const char2 = cos1 > 0 ? "T" : "A";
    row[x2] = `[${char2}]`;

    lines.push(row.join("").slice(0, width));
  }

  return lines.join("\n");
}
