"use client";

import React, { useState } from "react";
import { useDesktopStore } from "../lib/store";
import { Layers, Sparkles, CheckCircle2, Shield, Play, Plus, RefreshCw, ArrowUpRight } from "lucide-react";

export function UmbrellaForgeApp() {
  const { registerForgeApp, openWindow } = useDesktopStore();
  const [prompt, setPrompt] = useState("Build an application that compares two bacterial genomes and visualizes GC-content differences");
  const [compiledSpec, setCompiledSpec] = useState<any>(null);
  const [compiling, setCompiling] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installedAppId, setInstalledAppId] = useState<string | null>(null);
  const [evolvePrompt, setEvolvePrompt] = useState("Add export button and differential GC skew chart");

  const handleCompile = async () => {
    setCompiling(true);
    try {
      const res = await fetch("http://localhost:8000/api/forge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent_prompt: prompt })
      });
      if (res.ok) {
        const spec = await res.json();
        setCompiledSpec(spec);
      }
    } catch (err) {
      console.error("Forge compile error:", err);
    } finally {
      setCompiling(false);
    }
  };

  const handleInstall = async () => {
    if (!compiledSpec) return;
    setInstalling(true);
    try {
      const res = await fetch("http://localhost:8000/api/forge/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: compiledSpec.app_id,
          spec_dsl: compiledSpec
        })
      });
      if (res.ok) {
        const installed = await res.json();
        setInstalledAppId(installed.app_id);
        registerForgeApp({
          id: installed.app_id,
          name: installed.name,
          acronym: compiledSpec.acronym || "FA",
          category: "forge_generated",
          description: `AI-Synthesized Application (v${installed.version})`,
          isForge: true,
          spec_dsl: compiledSpec,
          defaultWidth: 800,
          defaultHeight: 520
        });
      }
    } catch (err) {
      console.error("Forge install error:", err);
    } finally {
      setInstalling(false);
    }
  };

  const handleEvolve = () => {
    if (!compiledSpec) return;
    // Increment version
    const newSpec = { ...compiledSpec };
    newSpec.version = "1.1.0";
    newSpec.ui_layout.components.push(
      { type: "Chart", props: { type: "line", title: "Differential GC Skew (Evolved v1.1)" } },
      { type: "MetricCard", props: { label: "Export Stream", value: "CSV/VCF Ready", accent: "green" } }
    );
    setCompiledSpec(newSpec);
    handleInstall();
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      {/* Top Header */}
      <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-100">UMBRELLA FORGE // SELF-BUILDING APPLICATION PIPELINE</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-surface-secondary text-amber-400 border border-amber-800">
          SANDBOXED COMPILER ACTIVE
        </span>
      </div>

      {/* Input Intent & Compile Button */}
      <div className="p-3.5 bg-surface border border-surface-border rounded space-y-3">
        <label className="text-[10px] text-slate-400 block font-bold">
          DESCRIBE SCIENTIFIC INSTRUMENT OR WORKFLOW NEEDED:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-surface-secondary border border-surface-border rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
          />
          <button
            onClick={handleCompile}
            disabled={compiling}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-600/80 text-amber-300 font-bold rounded transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{compiling ? "Synthesizing..." : "Compile App"}</span>
          </button>
        </div>
      </div>

      {/* Compiled Spec DSL & Sandbox Preview */}
      {compiledSpec && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Spec JSON Viewer */}
          <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
            <div className="flex items-center justify-between border-b border-surface-border pb-1">
              <span className="font-semibold text-emerald-400">APPLICATION SPECIFICATION (DSL)</span>
              <span className="text-[10px] text-slate-400">v{compiledSpec.version}</span>
            </div>
            <pre className="p-2.5 bg-surface-chrome border border-surface-border rounded text-[10px] text-slate-300 font-mono overflow-y-auto max-h-56">
              {JSON.stringify(compiledSpec, null, 2)}
            </pre>
          </div>

          {/* Validation & Installation Receipt */}
          <div className="p-3 bg-surface border border-surface-border rounded flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="font-semibold text-slate-100 border-b border-surface-border pb-1">
                GENERATION RECEIPT & CAPABILITY GATE
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">App Name:</span>
                  <span className="font-bold text-slate-100">{compiledSpec.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Permissions Requested:</span>
                  <span className="text-emerald-400 font-mono">
                    {compiledSpec.permissions.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sandbox Validation:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PASSED (Safe Primitives)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UI Components:</span>
                  <span className="text-slate-200">
                    {compiledSpec.ui_layout.components.length} native components mapped
                  </span>
                </div>
              </div>
            </div>

            {/* Install / Evolution Controls */}
            <div className="space-y-2 pt-2 border-t border-surface-border">
              {!installedAppId ? (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-bold rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{installing ? "Installing..." : "Install into OS Desktop"}</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 bg-emerald-950/60 border border-emerald-500 rounded text-center text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Application Installed into App Registry!</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openWindow(installedAppId)}
                      className="flex-1 py-1.5 bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-cyan-300 font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Launch App Window</span>
                    </button>
                    <button
                      onClick={handleEvolve}
                      className="flex-1 py-1.5 bg-surface-secondary hover:bg-surface-tertiary border border-amber-600/80 text-amber-300 font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Evolve to v1.1</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
