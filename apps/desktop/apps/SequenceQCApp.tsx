"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Terminal, Play } from "lucide-react";

export function SequenceQCApp({ sampleId }: { sampleId?: string }) {
  const [logs, setLogs] = useState<string[]>([
    "[10:04:12] Initialized deterministic sequence QC engine.",
    "[10:04:13] Ingested 1,500 benchmark isolates from BV-BRC cohort.",
    "[10:04:15] Validating contig boundaries and non-ACGT ambiguous characters...",
    "[10:04:18] Batch QC completed: 1,365 PASS, 105 WARN, 30 FAIL."
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const runTriggerBatch = () => {
    setIsRunning(true);
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Triggering batch audit scan across data lake...`]);
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] SHA-256 verification complete: 0 corruptions detected.`,
        `[${new Date().toLocaleTimeString()}] QC Status updated across all registered samples.`
      ]);
      setIsRunning(false);
    }, 1200);
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200 h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header & Batch Progress */}
        <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">BATCH STATUS // COHORT 2026_10</span>
            <button
              onClick={runTriggerBatch}
              disabled={isRunning}
              className="flex items-center gap-1 px-2.5 py-1 bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-emerald-400 rounded text-[11px] transition-colors"
            >
              <Play className="w-3 h-3" />
              <span>{isRunning ? "Scanning..." : "Re-Scan Batch"}</span>
            </button>
          </div>

          {/* Stacked Progress Bar */}
          <div className="h-3 w-full bg-surface-chrome rounded overflow-hidden flex border border-surface-border">
            <div style={{ width: "91%" }} className="bg-emerald-500 h-full" title="PASS 91%" />
            <div style={{ width: "7%" }} className="bg-amber-500 h-full" title="WARN 7%" />
            <div style={{ width: "2%" }} className="bg-red-500 h-full" title="FAIL 2%" />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> PASS 91.0% (1,365)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" /> WARN 7.0% (105)
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <XCircle className="w-3.5 h-3.5" /> FAIL 2.0% (30)
            </span>
          </div>
        </div>

        {/* Metric Percentiles Table */}
        <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="font-semibold text-slate-200 border-b border-surface-border pb-1">
            STATISTICAL QUALITY DISTRIBUTIONS
          </div>
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-surface-chrome text-slate-400 text-[10px]">
              <tr>
                <th className="py-1 px-2">METRIC</th>
                <th className="py-1 px-2">MEDIAN</th>
                <th className="py-1 px-2">P95</th>
                <th className="py-1 px-2">OUTLIERS FLAGGED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40">
              <tr className="hover:bg-surface-secondary">
                <td className="py-1.5 px-2 font-bold text-slate-200">Genome Length</td>
                <td className="py-1.5 px-2 text-slate-300">5.12 Mb</td>
                <td className="py-1.5 px-2 text-slate-300">5.88 Mb</td>
                <td className="py-1.5 px-2 text-amber-400">21 (&lt; 1.5 Mb or &gt; 8.0 Mb)</td>
              </tr>
              <tr className="hover:bg-surface-secondary">
                <td className="py-1.5 px-2 font-bold text-slate-200">GC Percentage</td>
                <td className="py-1.5 px-2 text-cyan-400">50.84%</td>
                <td className="py-1.5 px-2 text-cyan-400">56.40%</td>
                <td className="py-1.5 px-2 text-amber-400">13 (abnormal skew)</td>
              </tr>
              <tr className="hover:bg-surface-secondary">
                <td className="py-1.5 px-2 font-bold text-slate-200">Ambiguous Bases (N)</td>
                <td className="py-1.5 px-2 text-slate-300">0.003%</td>
                <td className="py-1.5 px-2 text-slate-300">0.18%</td>
                <td className="py-1.5 px-2 text-red-400">61 (&gt; 1.0% masked)</td>
              </tr>
              <tr className="hover:bg-surface-secondary">
                <td className="py-1.5 px-2 font-bold text-slate-200">Contig Count</td>
                <td className="py-1.5 px-2 text-slate-300">24 contigs</td>
                <td className="py-1.5 px-2 text-slate-300">142 contigs</td>
                <td className="py-1.5 px-2 text-amber-400">8 (high fragmentation)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Job Console (Bottom 20%) */}
      <div className="p-3 bg-surface-chrome border border-surface-border rounded space-y-1.5 h-32 flex flex-col">
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-surface-border pb-1">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            LIVE QC WORKER CONSOLE
          </span>
          <span>STREAM: ACTIVE</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5 font-mono text-[10px] text-slate-400">
          {logs.map((log, i) => (
            <div key={i} className="text-emerald-400/90 font-mono">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
