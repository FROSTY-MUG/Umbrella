"use client";

import React, { useState } from "react";
import { Wrench, Play, CheckCircle2, AlertTriangle, Code, Cpu, Database, ChevronRight, Download } from "lucide-react";
import { useDesktopStore } from "../lib/store";

interface ForgePipelineStage {
  id: string;
  label: string;
  status: "WAITING" | "RUNNING" | "COMPLETED" | "ERROR";
  log?: string;
}

export function UmbrellaForgeApp() {
  const [prompt, setPrompt] = useState("");
  const [isForging, setIsForging] = useState(false);
  const { registerForgeApp } = useDesktopStore();
  
  const [pipeline, setPipeline] = useState<ForgePipelineStage[]>([
    { id: "stage-1", label: "INTENT PARSING & ARCHITECTURE SPEC", status: "WAITING" },
    { id: "stage-2", label: "PERMISSION BOUNDARY ANALYSIS", status: "WAITING" },
    { id: "stage-3", label: "REACT COMPONENT GENERATION", status: "WAITING" },
    { id: "stage-4", label: "SANDBOX VALIDATION", status: "WAITING" },
    { id: "stage-5", label: "OS REGISTRY INJECTION", status: "WAITING" }
  ]);

  const [generatedAppDef, setGeneratedAppDef] = useState<any>(null);

  const startForge = () => {
    if (!prompt.trim() || isForging) return;
    setIsForging(true);
    setGeneratedAppDef(null);
    setPipeline(p => p.map(s => ({ ...s, status: "WAITING", log: "" })));

    let currentStage = 0;
    const interval = setInterval(() => {
      setPipeline(prev => {
        const next = [...prev];
        if (currentStage > 0 && currentStage <= next.length) {
          next[currentStage - 1].status = "COMPLETED";
        }
        if (currentStage < next.length) {
          next[currentStage].status = "RUNNING";
          
          // Add some fake logs for the cinematic effect
          if (next[currentStage].id === "stage-1") next[currentStage].log = "Extracting entities: [Sample, Variant, Cluster]...";
          if (next[currentStage].id === "stage-3") next[currentStage].log = "Compiling JSX AST...";
          if (next[currentStage].id === "stage-4") next[currentStage].log = "Verifying read-only data boundaries...";
        }
        return next;
      });

      currentStage++;

      if (currentStage > pipeline.length) {
        clearInterval(interval);
        setIsForging(false);
        
        // Mock the generated app definition
        const newApp = {
          id: `forge-app-${Date.now()}`,
          name: "Generated Data Cluster",
          title: "Custom Sample Clustering",
          icon: "Database",
          isForge: true,
          sourceSpec: prompt,
          version: "1.0.0",
          components: [
            { type: "header", props: { title: "Custom Analysis View" } },
            { type: "dataTable", props: { columns: ["Sample", "Cluster", "Distance"], data: [["SAMPLE-102", "A", "0.01"], ["SAMPLE-099", "B", "0.45"]] } }
          ]
        };
        setGeneratedAppDef(newApp);
      }
    }, 1500);
  };

  const handleInstall = () => {
    if (generatedAppDef) {
      registerForgeApp(generatedAppDef);
      alert("App securely registered in Umbrella OS App Drawer.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-[#e5e5e5] font-mono text-xs select-none">
      {/* OS Banner */}
      <div className="p-3 bg-[#121415] border-b border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 border border-[#4d5c44] bg-[#4d5c44]/10 text-[#4d5c44]">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-widest">UMBRELLA FORGE</div>
            <div className="text-[10px] text-gray-500">DYNAMIC APPLICATION SYNTHESIZER // SANDBOXED</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 overflow-hidden">
        
        {/* LEFT COLUMN: Input & Pipeline */}
        <div className="border-r border-white/15 bg-[#050505] flex flex-col">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-[#f59e0b] font-bold uppercase tracking-widest">Scientific Requirements</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isForging}
                placeholder="E.g., Create an application that clusters these samples by AMR profile and genome similarity..."
                className="w-full h-32 p-3 bg-[#121415] border border-white/20 text-white outline-none focus:border-[#f59e0b] resize-none custom-scrollbar placeholder-gray-600 disabled:opacity-50"
              />
            </div>
            
            <button
              onClick={startForge}
              disabled={!prompt.trim() || isForging}
              className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold text-[10px] tracking-widest uppercase disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              <Cpu className="w-4 h-4" />
              {isForging ? "SYNTHESIZING APPLICATION..." : "INITIALIZE FORGE"}
            </button>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Generation Pipeline</div>
              <div className="space-y-3">
                {pipeline.map((stage) => (
                  <div key={stage.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={stage.status === "RUNNING" ? "text-white font-bold" : "text-gray-500"}>
                        {stage.label}
                      </span>
                      {stage.status === "WAITING" && <span className="text-gray-600">[WAIT]</span>}
                      {stage.status === "RUNNING" && <span className="text-[#f59e0b] animate-pulse">[RUNNING]</span>}
                      {stage.status === "COMPLETED" && <span className="text-emerald-500">[DONE]</span>}
                    </div>
                    {stage.log && (
                      <div className="text-[9px] text-gray-600 ml-2 border-l border-gray-700 pl-2">
                        {stage.log}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Validation & Registry */}
        <div className="bg-[#0a0c0d] p-6 flex flex-col justify-center items-center relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          {!generatedAppDef ? (
            <div className="text-gray-600 text-[10px] tracking-widest uppercase z-10 flex flex-col items-center gap-4">
              <Code className="w-12 h-12 text-gray-800" />
              <span>AWAITING SYNTHESIS SPECIFICATION</span>
            </div>
          ) : (
            <div className="w-full max-w-md bg-[#121415] border border-white/20 shadow-2xl z-10 flex flex-col">
              <div className="p-3 border-b border-white/20 bg-[#1a1c1d] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold tracking-widest text-white uppercase">SYNTHESIS COMPLETE</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest">APP IDENTIFIER</div>
                  <div className="text-white font-bold">{generatedAppDef.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest">SECURITY SANDBOX</div>
                  <div className="text-emerald-500 text-[10px] flex items-center gap-1"><Shield className="w-3 h-3"/> PASS: Read-Only Data Isolation</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest">DEPENDENCIES</div>
                  <div className="text-gray-300 text-[10px]">@umbrella/data-table, @umbrella/core-ui</div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <button 
                    onClick={handleInstall}
                    className="w-full py-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-[10px] tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Install to OS Registry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
