"use client";

import React, { useState } from "react";
import { BarChart3, LineChart, Table, FileSpreadsheet, Download } from "lucide-react";

export function AnalysisStudioApp() {
  const [metric, setMetric] = useState("phenotype");

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-100">ANALYSIS STUDIO // TABULAR ANALYTICS & COHORT CHARTS</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setMetric("phenotype")}
            className={`px-2.5 py-1 rounded text-[11px] ${
              metric === "phenotype" ? "bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold" : "bg-surface-secondary text-slate-400"
            }`}
          >
            Phenotype Split
          </button>
          <button
            onClick={() => setMetric("markers")}
            className={`px-2.5 py-1 rounded text-[11px] ${
              metric === "markers" ? "bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold" : "bg-surface-secondary text-slate-400"
            }`}
          >
            Marker Frequencies
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Visual Distribution Chart */}
        <div className="p-3 bg-surface border border-surface-border rounded space-y-3">
          <div className="font-semibold text-slate-200 border-b border-surface-border pb-1">
            COHORT DISTRIBUTION ({metric.toUpperCase()})
          </div>

          <div className="h-44 bg-surface-chrome border border-surface-border rounded p-3 flex items-end justify-around gap-2">
            {metric === "phenotype" ? (
              <>
                <div className="w-16 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-red-400 font-bold">64.2%</span>
                  <div style={{ height: "110px" }} className="w-full bg-red-500/80 rounded-t" />
                  <span className="text-[9px] text-slate-400">Resistant</span>
                </div>
                <div className="w-16 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-amber-400 font-bold">8.6%</span>
                  <div style={{ height: "24px" }} className="w-full bg-amber-500/80 rounded-t" />
                  <span className="text-[9px] text-slate-400">Intermediate</span>
                </div>
                <div className="w-16 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-emerald-400 font-bold">27.2%</span>
                  <div style={{ height: "55px" }} className="w-full bg-emerald-500/80 rounded-t" />
                  <span className="text-[9px] text-slate-400">Susceptible</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-cyan-300 font-bold">42%</span>
                  <div style={{ height: "80px" }} className="w-full bg-cyan-500/80 rounded-t" />
                  <span className="text-[8px] text-slate-400 truncate">blaTEM</span>
                </div>
                <div className="w-12 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-cyan-300 font-bold">28%</span>
                  <div style={{ height: "55px" }} className="w-full bg-cyan-500/80 rounded-t" />
                  <span className="text-[8px] text-slate-400 truncate">gyrA</span>
                </div>
                <div className="w-12 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-cyan-300 font-bold">19%</span>
                  <div style={{ height: "38px" }} className="w-full bg-cyan-500/80 rounded-t" />
                  <span className="text-[8px] text-slate-400 truncate">blaNDM</span>
                </div>
                <div className="w-12 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-cyan-300 font-bold">34%</span>
                  <div style={{ height: "65px" }} className="w-full bg-cyan-500/80 rounded-t" />
                  <span className="text-[8px] text-slate-400 truncate">tet(M)</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabular Parquet Summary */}
        <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="flex items-center justify-between border-b border-surface-border pb-1">
            <span className="font-semibold text-slate-200">PARQUET FEATURE MATRIX</span>
            <span className="text-[10px] text-slate-400">1,500 ROWS x 32 COLS</span>
          </div>

          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-surface-chrome text-slate-400 text-[10px]">
              <tr>
                <th className="py-1 px-1.5">FEATURE</th>
                <th className="py-1 px-1.5">TYPE</th>
                <th className="py-1 px-1.5">NON-ZERO</th>
                <th className="py-1 px-1.5">SPARSITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40">
              <tr>
                <td className="py-1 px-1.5 font-bold text-slate-200">has_blaNDM</td>
                <td className="py-1 px-1.5 text-slate-400">binary</td>
                <td className="py-1 px-1.5 text-cyan-400">285</td>
                <td className="py-1 px-1.5 text-slate-400">81.0%</td>
              </tr>
              <tr>
                <td className="py-1 px-1.5 font-bold text-slate-200">has_gyrA_D87G</td>
                <td className="py-1 px-1.5 text-slate-400">binary</td>
                <td className="py-1 px-1.5 text-cyan-400">420</td>
                <td className="py-1 px-1.5 text-slate-400">72.0%</td>
              </tr>
              <tr>
                <td className="py-1 px-1.5 font-bold text-slate-200">gc_fraction</td>
                <td className="py-1 px-1.5 text-slate-400">float64</td>
                <td className="py-1 px-1.5 text-cyan-400">1,500</td>
                <td className="py-1 px-1.5 text-slate-400">0.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
