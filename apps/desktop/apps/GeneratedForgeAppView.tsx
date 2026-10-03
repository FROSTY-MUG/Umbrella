"use client";

import React, { useState } from "react";
import { Layers, Dna, CheckCircle, BarChart3, Download } from "lucide-react";

export function GeneratedForgeAppView({ appDef }: { appDef: any }) {
  const spec = appDef.spec_dsl || {};
  const components = spec.ui_layout?.components || [];
  const [activeTab, setActiveTab] = useState("diff");

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      {/* Top Spec Header */}
      <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400">FORGE GENERATED APPLICATION</div>
          <div className="font-bold text-amber-400 text-sm">{spec.name || appDef.name} (v{spec.version || "1.0.0"})</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold">
            SANDBOXED
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-secondary border border-surface-border text-slate-400 text-[10px]">
            {spec.category || "FORGE"}
          </span>
        </div>
      </div>

      {/* Render Synthesized Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {components
          .filter((c: any) => c.type === "MetricCard")
          .map((c: any, i: number) => (
            <div key={i} className="p-3 bg-surface border border-surface-border rounded">
              <div className="text-[10px] text-slate-400">{c.props.label}</div>
              <div className={`text-base font-bold mt-1 ${c.props.accent === "green" ? "text-emerald-400" : "text-amber-400"}`}>
                {c.props.value}
              </div>
            </div>
          ))}
      </div>

      {/* Dual-Track Sequence Viewer */}
      {components.some((c: any) => c.type === "SequenceViewer") && (
        <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="flex items-center justify-between border-b border-surface-border pb-1">
            <span className="font-semibold text-slate-200">DUAL-TRACK NUCLEOTIDE ALIGNMENT</span>
            <span className="text-[10px] text-slate-400">SAMPLE 1827 VS 1829</span>
          </div>
          <div className="p-2.5 bg-surface-chrome border border-surface-border rounded font-mono text-[11px] overflow-x-auto space-y-1">
            <div className="flex gap-2">
              <span className="text-slate-500 w-12">REF:</span>
              <span className="text-slate-300 tracking-wider">
                ATGCGATC<span className="text-emerald-400 font-bold bg-emerald-950/60 px-0.5">G</span>ATCGATCGATCGAACCGTTAGGCTA<span className="text-amber-400 font-bold bg-amber-950/60 px-0.5">G</span>CTAGCTAGCTAAGCGGGCATTTACCGTAAAC
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-12">SMP:</span>
              <span className="text-slate-100 tracking-wider">
                ATGCGATC<span className="text-red-400 font-bold bg-red-950/60 px-0.5">T</span>ATCGATCGATCGAACCGTTAGGCTA<span className="text-red-400 font-bold bg-red-950/60 px-0.5">A</span>CTAGCTAGCTAAGCGGGCATTTACCGTAAAC
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Synthesized Data Table */}
      {components.some((c: any) => c.type === "DataTable") && (
        <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="font-semibold text-slate-200 border-b border-surface-border pb-1 flex justify-between">
            <span>VARIANT COORDINATES & SKEW METRICS</span>
            <span className="text-[10px] text-slate-400">SORTABLE TABLE</span>
          </div>
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-surface-chrome text-slate-400 text-[10px]">
              <tr>
                <th className="py-1 px-2">LOCUS</th>
                <th className="py-1 px-2">REF</th>
                <th className="py-1 px-2">ALT</th>
                <th className="py-1 px-2">GC SKEW</th>
                <th className="py-1 px-2">CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40">
              <tr>
                <td className="py-1.5 px-2">chr1:10,231</td>
                <td className="py-1.5 px-2">C</td>
                <td className="py-1.5 px-2 text-emerald-400 font-bold">T</td>
                <td className="py-1.5 px-2 text-cyan-400">+0.14</td>
                <td className="py-1.5 px-2 text-emerald-400">99.4%</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2">chr1:18,442</td>
                <td className="py-1.5 px-2">A</td>
                <td className="py-1.5 px-2 text-emerald-400 font-bold">G</td>
                <td className="py-1.5 px-2 text-cyan-400">-0.08</td>
                <td className="py-1.5 px-2 text-emerald-400">98.9%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Synthesized Chart Block */}
      {components.some((c: any) => c.type === "Chart") && (
        <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="font-semibold text-slate-200 border-b border-surface-border pb-1 flex justify-between">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              SLIDING WINDOW GC DISTRIBUTION (500 BP WINDOW)
            </span>
            <span className="text-[10px] text-slate-400">COMPUTED LIVE</span>
          </div>
          <div className="h-20 bg-surface-chrome border border-surface-border rounded flex items-end px-4 py-2 gap-1.5">
            {[48, 52, 51, 55, 50, 49, 54, 53, 56, 52, 50, 51, 49, 53, 52, 54].map((v, i) => (
              <div
                key={i}
                style={{ height: `${(v - 40) * 5}%` }}
                className="flex-1 bg-cyan-500/70 hover:bg-cyan-400 transition-colors rounded-t"
                title={`Window ${i}: ${v}% GC`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
