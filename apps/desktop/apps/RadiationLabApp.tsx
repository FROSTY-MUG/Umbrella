"use client";

import React, { useState, useEffect } from "react";
import { Zap, AlertTriangle, ShieldCheck, Play, RefreshCw } from "lucide-react";

export function RadiationLabApp() {
  const [radiationType, setRadiationType] = useState("X-RAY");
  const [doseGy, setDoseGy] = useState(2.0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/radiation/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        radiation_type: radiationType,
        dose_gy: doseGy,
        target_bases: 4600000
      })
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => setData(resData))
      .catch((err) => console.error("Simulation error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runSimulation();
  }, [radiationType, doseGy]);

  const outputs = data?.modeled_outputs || {
    single_strand_breaks: 154,
    double_strand_breaks: 8,
    oxidative_base_lesions: 210,
    complex_clustered_damage_sites: 32,
    dna_integrity_percent: 74.2,
    cellular_repair_load_percent: 48.6
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      {/* Simulation Controls Strip */}
      <div className="p-3.5 bg-surface border border-surface-border rounded grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">RADIATION CATEGORY</label>
          <select
            value={radiationType}
            onChange={(e) => setRadiationType(e.target.value)}
            className="w-full bg-surface-secondary border border-surface-border rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none"
          >
            <option value="X-RAY">X-Ray (Low-LET, Photons)</option>
            <option value="GAMMA">Gamma Radiation (Low-LET, Co-60)</option>
            <option value="BETA">Beta Particles (Low-LET, Electrons)</option>
            <option value="PROTON">Proton Beam (Intermediate-LET)</option>
            <option value="NEUTRON">Fast Neutrons (High-LET, Dense Core)</option>
            <option value="ALPHA">Alpha Particles (High-LET, He-4 Nuclei)</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>ABSORBED DOSE:</span>
            <span className="font-bold text-emerald-400">{doseGy} Gray (Gy)</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="10.0"
            step="0.1"
            value={doseGy}
            onChange={(e) => setDoseGy(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        <div className="flex items-end justify-end">
          <button
            onClick={runSimulation}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/80 text-emerald-300 font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Compute Damage Profile</span>
          </button>
        </div>
      </div>

      {/* Modeled Damage Yield KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400">SINGLE-STRAND BREAKS</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">{outputs.single_strand_breaks}</div>
          <div className="text-[10px] text-slate-500">SSB yield</div>
        </div>
        <div className="p-3 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400">DOUBLE-STRAND BREAKS</div>
          <div className="text-lg font-bold text-red-400 mt-1">{outputs.double_strand_breaks}</div>
          <div className="text-[10px] text-slate-500">DSB repair-limiting</div>
        </div>
        <div className="p-3 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400">CLUSTERED LESION SITES</div>
          <div className="text-lg font-bold text-amber-400 mt-1">{outputs.complex_clustered_damage_sites}</div>
          <div className="text-[10px] text-slate-500">Dense track events</div>
        </div>
        <div className="p-3 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400">ESTIMATED INTEGRITY</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{outputs.dna_integrity_percent}%</div>
          <div className="text-[10px] text-slate-500">Bacterial genome</div>
        </div>
      </div>

      {/* Comparative Damage Spectrum Bars */}
      <div className="p-3.5 bg-surface border border-surface-border rounded space-y-3">
        <div className="flex items-center justify-between border-b border-surface-border pb-1.5">
          <span className="font-semibold text-slate-200">DAMAGE CLUSTERING SPECTRUM</span>
          <span className="text-[10px] text-slate-400">LET: {data?.let_category || "LOW_LET"} ({data?.mean_let_kev_um || 1.5} keV/&mu;m)</span>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300">Single-Strand Breaks (SSB)</span>
              <span className="text-cyan-400 font-bold">{outputs.single_strand_breaks}</span>
            </div>
            <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (outputs.single_strand_breaks / 400) * 100)}%` }}
                className="bg-cyan-500 h-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300">Double-Strand Breaks (DSB)</span>
              <span className="text-red-400 font-bold">{outputs.double_strand_breaks}</span>
            </div>
            <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (outputs.double_strand_breaks / 100) * 100)}%` }}
                className="bg-red-500 h-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300">Oxidative Base Modifications (8-oxodG)</span>
              <span className="text-amber-400 font-bold">{outputs.oxidative_base_lesions}</span>
            </div>
            <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (outputs.oxidative_base_lesions / 500) * 100)}%` }}
                className="bg-amber-500 h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Scientific Disclaimer Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-600/60 rounded flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-200/90 leading-relaxed">
          <span className="font-bold">MODELED SIMULATION DISCLAIMER:</span> Outputs represent biophysical computational estimates based on Monte Carlo track-structure references (Goodhead 1994, Ward 1988), NOT experimentally confirmed measurements or clinical advice.
        </div>
      </div>
    </div>
  );
}
