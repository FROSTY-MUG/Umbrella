"use client";

import React, { useState } from "react";
import { FlaskConical, Play, AlertTriangle } from "lucide-react";

export function ScienceLabApp() {
  const [stress, setStress] = useState("Oxidative");
  const [intensity, setIntensity] = useState(0.65);
  const [duration, setDuration] = useState("30 min");
  const [showAscii, setShowAscii] = useState(true);

  const integrity = Math.max(10, Math.round(100 - intensity * 45));
  const stressVal = Math.round(intensity * 92);
  const repairVal = Math.round(intensity * 78);

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-100">SCIENCE LAB // CELLULAR STRESS SIMULATION WORKSPACE</span>
        </div>
        <button
          onClick={() => setShowAscii(!showAscii)}
          className="text-[10px] px-2 py-0.5 rounded bg-surface-secondary text-slate-400 border border-surface-border hover:text-slate-200"
        >
          {showAscii ? "View Data Only" : "Toggle ASCII View"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Model Inputs */}
        <div className="p-3 bg-surface border border-surface-border rounded space-y-3">
          <div className="font-semibold text-slate-100 border-b border-surface-border pb-1">
            SIMULATION PARAMETERS
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">STRESS CLASS</label>
              <select
                value={stress}
                onChange={(e) => setStress(e.target.value)}
                className="w-full bg-surface-secondary border border-surface-border rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none"
              >
                <option value="Oxidative">Oxidative Radicals (H2O2 / ROS)</option>
                <option value="Thermal">Thermal Shock (Heat Dissipation)</option>
                <option value="Osmotic">Osmotic Pressure Gradient</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>STRESS INTENSITY:</span>
                <span className="text-emerald-400 font-bold">{intensity}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">EXPOSURE DURATION</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-surface-secondary border border-surface-border rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none"
              >
                <option value="15 min">15 minutes</option>
                <option value="30 min">30 minutes</option>
                <option value="60 min">60 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modeled Output */}
        <div className="p-3 bg-surface border border-surface-border rounded space-y-3">
          <div className="font-semibold text-slate-100 border-b border-surface-border pb-1">
            SIMULATION RESPONSE (MODELED)
          </div>

          <div className="space-y-2 text-[11px]">
            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">DNA Integrity:</span>
                <span className="text-emerald-400 font-bold">{integrity}%</span>
              </div>
              <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden">
                <div style={{ width: `${integrity}%` }} className="bg-emerald-500 h-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">Intracellular Stress Signal:</span>
                <span className="text-amber-400 font-bold">{stressVal}%</span>
              </div>
              <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden">
                <div style={{ width: `${stressVal}%` }} className="bg-amber-500 h-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">Cellular Repair Load:</span>
                <span className="text-cyan-400 font-bold">{repairVal}%</span>
              </div>
              <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden">
                <div style={{ width: `${repairVal}%` }} className="bg-cyan-500 h-full" />
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 flex justify-between">
              <span>Model Confidence: 0.81</span>
              <span>Algorithm: Stochastic Agent Simulation</span>
            </div>
          </div>
        </div>
      </div>

      {/* ASCII Cellular State Frame */}
      {showAscii && (
        <div className="p-3 bg-surface-chrome border border-surface-border rounded font-mono text-[10px] text-emerald-400/90 whitespace-pre overflow-x-auto">
{`FRAME 042 // ACTIVE RESPONSE
      .------------------------.
     /        CELL MATRIX       \\
    |   [DNA] ====||==== [DNA]   |
    |     * * ROS STRESS * *     | ---> Oxidative flux: ${stressVal}%
    |        \\_  SOS REPAIR _/   |
     \\                          /
      '------------------------'
DNA INTEGRITY [${"#".repeat(Math.round(integrity / 10))}${"-".repeat(10 - Math.round(integrity / 10))}] ${integrity}%
REPAIR BURDEN [${"#".repeat(Math.round(repairVal / 10))}${"-".repeat(10 - Math.round(repairVal / 10))}] ${repairVal}%`}
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <div className="p-2.5 bg-surface border border-surface-border rounded text-[10px] text-slate-400 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>MODEL DISCLAIMER: Outputs are computational estimates under stated assumptions, not experimental measurements.</span>
      </div>
    </div>
  );
}
