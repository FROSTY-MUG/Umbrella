"use client";

import React, { useState, useEffect } from "react";
import { Activity, Play, CheckCircle, AlertTriangle, ChevronRight, Zap, RefreshCw, Layers, ShieldAlert, FileText, Cpu, Database } from "lucide-react";
import { AsciiHelixSynthesizer } from "../components/AsciiHelixSynthesizer";

export function BenchmarkDnaApp() {
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("STANDBY");
  const [results, setResults] = useState<{
    sequencing_speed: number;
    variant_accuracy: number;
    sim_latency: number;
    render_fps: number;
  } | null>(null);

  const startBenchmark = () => {
    setIsBenchmarking(true);
    setProgress(0);
    setResults(null);
    setStage("INITIALIZING HARDWARE VECTORS");

    let p = 0;
    const interval = setInterval(() => {
      p += 2.5;
      setProgress(p);

      if (p < 25) setStage("MEASURING SEQUENCING THROUGHPUT");
      else if (p < 50) setStage("VALIDATING VARIANT CALLING HEURISTICS");
      else if (p < 75) setStage("TESTING SIMULATION LATENCY");
      else if (p < 95) setStage("BENCHMARKING STRUCTURAL RENDERER");
      else setStage("FINALIZING REPORT");

      if (p >= 100) {
        clearInterval(interval);
        setIsBenchmarking(false);
        setResults({
          sequencing_speed: 14205, // MB/s
          variant_accuracy: 99.994, // %
          sim_latency: 12.4, // ms
          render_fps: 60 // fps
        });
      }
    }, 1500); // Takes 60 seconds total: 100 / 2.5 = 40 ticks, 40 * 1500ms = 60s
  };

  return (
    <div className="h-full flex flex-col bg-black text-gray-200 font-mono text-xs select-none overflow-hidden">
      {/* OS Banner */}
      <div className="p-3 bg-[#0a0a0c] border-b border-red-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 border border-red-600 bg-red-900/20 text-red-500">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-[0.1em]">DNA BENCHMARK <span className="text-red-500">SYSTEM STRESS TEST</span></div>
            <div className="text-[10px] text-gray-500">UMBRELLA COMPUTATIONAL DIAGNOSTICS</div>
          </div>
        </div>

        <button
          onClick={startBenchmark}
          disabled={isBenchmarking}
          className="px-4 py-2 bg-red-900/20 hover:bg-red-700 border border-red-700 text-red-500 hover:text-white font-bold tracking-[0.2em] uppercase transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isBenchmarking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {isBenchmarking ? "BENCHMARKING..." : "RUN DIAGNOSTIC"}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* LEFT COLUMN: SPECS & RESULTS */}
        <div className="col-span-4 border-r border-red-900/30 bg-[#09090b] flex flex-col p-4 space-y-4">
          <div className="p-3 border border-red-900/30 bg-black space-y-2">
             <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest border-b border-red-900/30 pb-2 mb-2">SYSTEM CAPABILITIES</div>
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-gray-500">ENGINE</span>
               <span className="text-white">Umbrella BioCore v9.2</span>
             </div>
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-gray-500">COMPUTE TARGET</span>
               <span className="text-white">WebGPU / WebGL2 Fallback</span>
             </div>
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-gray-500">HEURISTICS</span>
               <span className="text-white">Neural-Symbolic GenMod</span>
             </div>
          </div>

          <div className="flex-1 p-3 border border-red-900/30 bg-black flex flex-col">
            <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest border-b border-red-900/30 pb-2 mb-4">DIAGNOSTIC RESULTS</div>
            
            {!results && !isBenchmarking && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-2">
                <Activity className="w-8 h-8 opacity-50" />
                <div className="tracking-widest text-[9px] uppercase">Awaiting Benchmark Execution</div>
              </div>
            )}

            {isBenchmarking && (
              <div className="flex-1 flex flex-col space-y-6 justify-center">
                <div className="text-center text-red-500 font-bold tracking-[0.2em] animate-pulse">
                  {stage}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                    <span>PROGRESS</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-black border border-red-900/30 overflow-hidden">
                    <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {results && !isBenchmarking && (
              <div className="space-y-4">
                <div className="p-2 border border-red-900/30 bg-red-900/10 flex justify-between items-center">
                  <span className="text-gray-400 text-[9px] tracking-widest">SEQUENCING SPEED</span>
                  <span className="text-white font-bold">{results.sequencing_speed.toLocaleString()} MB/s</span>
                </div>
                <div className="p-2 border border-red-900/30 bg-red-900/10 flex justify-between items-center">
                  <span className="text-gray-400 text-[9px] tracking-widest">VARIANT CALLING</span>
                  <span className="text-white font-bold">{results.variant_accuracy}% ACCURACY</span>
                </div>
                <div className="p-2 border border-red-900/30 bg-red-900/10 flex justify-between items-center">
                  <span className="text-gray-400 text-[9px] tracking-widest">SIMULATION LATENCY</span>
                  <span className="text-white font-bold">{results.sim_latency} ms</span>
                </div>
                <div className="p-2 border border-red-900/30 bg-red-900/10 flex justify-between items-center">
                  <span className="text-gray-400 text-[9px] tracking-widest">RENDER PIPELINE</span>
                  <span className="text-white font-bold">{results.render_fps} FPS SUSTAINED</span>
                </div>

                <div className="mt-8 p-3 bg-red-900/20 border border-red-900/50 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <div className="text-red-500 font-bold tracking-widest text-[10px]">ALL SYSTEMS NOMINAL</div>
                    <div className="text-gray-400 text-[9px] mt-1">Hardware acceleration active. Simulation thresholds within Umbrella acceptable parameters.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SYNTHESIZER / VISUALIZER */}
        <div className="col-span-8 bg-black flex flex-col relative overflow-hidden">
          <div className="p-3 border-b border-red-900/30 bg-[#09090b] flex justify-between items-center z-10">
            <span className="text-[10px] text-gray-500 tracking-widest font-bold">ASCII STRAND SYNTHESIZER (60s COMPILE)</span>
            {isBenchmarking && <span className="text-[9px] text-red-500 font-bold animate-pulse">SYNTHESIZING...</span>}
          </div>

          <div className="flex-1 relative bg-black">
            <AsciiHelixSynthesizer isRunning={isBenchmarking} progress={progress} />
          </div>
        </div>

      </div>
    </div>
  );
}
