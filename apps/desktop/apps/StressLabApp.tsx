"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Play, RotateCcw, AlertTriangle, Layers, Download, CheckCircle2 } from "lucide-react";

interface GrowthPoint {
  time_hours: number;
  od600: number;
  log10_cfu_ml: number;
  viability_percent: number;
}

interface StressGene {
  gene: string;
  protein: string;
  fold_induction: number;
  pathway: string;
}

export function StressLabApp() {
  const [strain, setStrain] = useState("Escherichia coli K-12 MG1655");
  const [stressType, setStressType] = useState<"oxidative" | "thermal" | "antibiotic" | "osmotic">("oxidative");
  const [intensity, setIntensity] = useState(0.65);
  const [durationHours, setDurationHours] = useState(8.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
  const [inducedGenes, setInducedGenes] = useState<StressGene[]>([]);
  const [morphology, setMorphology] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("http://localhost:8000/api/stress/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strain_name: strain,
          stress_type: stressType,
          intensity,
          duration_hours: durationHours
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGrowthData(data.growth_curve || []);
        setInducedGenes(data.induced_stress_genes || []);
        setMorphology(data.cellular_morphology || null);
      } else {
        throw new Error("Simulation endpoint failed");
      }
    } catch (err) {
      // Fallback local mathematical model
      const points: GrowthPoint[] = [];
      const mu = 0.85 * Math.max(0.05, 1.0 - intensity * 0.8);
      const lag = 1.0 + intensity * 4.0;
      const A = Math.max(0.2, 1.8 * (1.0 - intensity * 0.7));

      for (let t = 0; t <= durationHours; t += 0.5) {
        const od = t < lag ? 0.05 : 0.05 + A * Math.exp(-Math.exp((mu * Math.E / A) * (lag - t) + 1));
        points.push({
          time_hours: t,
          od600: +od.toFixed(3),
          log10_cfu_ml: +(5.0 + (od / 1.8) * 4.0).toFixed(2),
          viability_percent: +Math.max(5, 100 - intensity * 65).toFixed(1)
        });
      }
      setGrowthData(points);
      setInducedGenes([
        { gene: "katG", protein: "Catalase-peroxidase", fold_induction: +(1 + intensity * 12).toFixed(1), pathway: "OxyR Regulon" },
        { gene: "groEL", protein: "60 kDa Chaperonin", fold_induction: +(1 + intensity * 15).toFixed(1), pathway: "Heat Shock" },
        { gene: "recA", protein: "Recombinase A", fold_induction: +(1 + intensity * 18).toFixed(1), pathway: "SOS Response" }
      ]);
      setMorphology({
        cellular_elongation_index: +(1.0 + intensity * 2.5).toFixed(2),
        membrane_permeability_ratio: +(1.0 + intensity * 3.2).toFixed(2),
        phenotypic_fate: intensity > 0.7 ? "Cellular Filamentation & Quorum Arrest" : "Adaptive Homeostasis"
      });
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [stressType, intensity, durationHours]);

  // Render 2D/3D Cellular Morphology Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.fillStyle = "#06090a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw simulated bacterial cells (Bacillus rods)
      const cellCount = Math.max(6, Math.round(24 * (1.0 - intensity * 0.5)));
      const elongation = morphology?.cellular_elongation_index || (1.0 + intensity * 2.5);

      for (let i = 0; i < cellCount; i++) {
        const seedX = (i * 73 + frame * 0.2) % (canvas.width - 60) + 30;
        const seedY = (i * 47 + Math.sin(frame * 0.02 + i) * 10) % (canvas.height - 40) + 20;
        const width = 16 * elongation;
        const height = 8;

        ctx.save();
        ctx.translate(seedX, seedY);
        ctx.rotate((i * 35 * Math.PI) / 180 + Math.sin(frame * 0.03 + i) * 0.1);

        // Color shifts from healthy green to stress yellow/red
        const strokeColor = intensity > 0.7 ? "#ef4444" : intensity > 0.4 ? "#f59e0b" : "#10b981";
        const fillColor = intensity > 0.7 ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)";

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;

        // Rounded bacterial rod capsule
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(-width / 2, -height / 2, width, height, 4);
        } else {
          ctx.rect(-width / 2, -height / 2, width, height);
        }
        ctx.fill();
        ctx.stroke();

        // Membrane stress vesicles / inclusion dots
        if (intensity > 0.4) {
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(-width / 4, 0, 1.5, 0, Math.PI * 2);
          ctx.arc(width / 4, 0, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [intensity, morphology]);

  return (
    <div className="h-full flex flex-col bg-[#0a0d0e] text-slate-200 font-mono text-xs select-none overflow-hidden">
      {/* Top Banner */}
      <div className="p-3 bg-[#0d1215] border-b border-white/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#f59e0b]/20 border border-[#f59e0b] text-[#f59e0b]">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              BACTERIAL STRESS SIMULATION LAB // PHENOTYPIC KINETICS
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-black font-bold">
                COMPUTATIONAL MODEL
              </span>
            </div>
            <div className="text-[10px] text-neutral-400">
              Evaluates bacterial adaptive growth curves, stress gene transcription, and cellular morphology under challenge
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            className="px-3 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Recompute Simulation
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Challenge Parameters */}
        <div className="lg:col-span-4 border-r border-white/15 p-4 flex flex-col gap-4 overflow-y-auto bg-[#070a0b] custom-scrollbar">
          {/* Target Strain */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#f59e0b] uppercase font-bold">TARGET BACTERIAL STRAIN</label>
            <select
              value={strain}
              onChange={(e) => setStrain(e.target.value)}
              className="w-full bg-[#12171a] border border-white/20 rounded p-2 text-white font-mono focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="Escherichia coli K-12 MG1655">Escherichia coli K-12 MG1655 (Model)</option>
              <option value="Pseudomonas putida KT2440">Pseudomonas putida KT2440 (Soil/Stress)</option>
              <option value="Bacillus subtilis 168">Bacillus subtilis 168 (Spore Former)</option>
              <option value="Staphylococcus carnosus TM300">Staphylococcus carnosus TM300</option>
            </select>
          </div>

          {/* Stress Modality */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-400 uppercase font-bold">STRESS MODALITY</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "oxidative", label: "OXIDATIVE (H2O2)" },
                  { id: "thermal", label: "THERMAL SHOCK" },
                  { id: "antibiotic", label: "ANTIBIOTIC MIC" },
                  { id: "osmotic", label: "OSMOTIC (NaCl)" }
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setStressType(m.id)}
                  className={`p-2 rounded text-left border transition-all ${
                    stressType === m.id
                      ? "bg-white text-black font-bold border-white shadow"
                      : "bg-[#0f1417] text-neutral-300 border-white/15 hover:border-white/40"
                  }`}
                >
                  <div className="text-[10px] uppercase">{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Stress Intensity Slider */}
          <div className="space-y-1.5 p-3 rounded bg-[#0f1417] border border-white/15">
            <div className="flex justify-between text-[10px]">
              <span className="text-neutral-400 font-bold">STRESS INTENSITY:</span>
              <span className="text-[#f59e0b] font-bold">{(intensity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full accent-[#f59e0b] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>Mild Challenge</span>
              <span>Sub-lethal</span>
              <span>Severe / Cytolytic</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-1.5 p-3 rounded bg-[#0f1417] border border-white/15">
            <div className="flex justify-between text-[10px]">
              <span className="text-neutral-400 font-bold">EXPOSURE DURATION:</span>
              <span className="text-white font-bold">{durationHours} Hours</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="24.0"
              step="1.0"
              value={durationHours}
              onChange={(e) => setDurationHours(parseFloat(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
          </div>

          {/* Phenotypic Fate Card */}
          <div className="p-3 rounded bg-[#141a1d] border border-white/20 space-y-1">
            <span className="text-[9px] text-[#f59e0b] uppercase font-bold">PREDICTED CELLULAR FATE</span>
            <div className="text-xs font-bold text-white">
              {morphology?.phenotypic_fate || "Adaptive Homeostasis"}
            </div>
            <div className="text-[10px] text-neutral-400">
              Elongation Factor: {morphology?.cellular_elongation_index}x | Membrane Permeability: {morphology?.membrane_permeability_ratio}x
            </div>
          </div>
        </div>

        {/* Right Column: Visual Outputs (Growth Curve + 2D/3D Canvas + Gene Matrix) */}
        <div className="lg:col-span-8 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[#0a0d0e]">
          {/* Top Visualizer Canvas: Live Bacterial Cell Morphology */}
          <div className="p-4 rounded bg-[#0f1417] border border-white/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-[#f59e0b]" />
                REAL-TIME CELLULAR MORPHOLOGY &amp; FILAMENTATION CANVAS
              </span>
              <span className="text-[10px] text-neutral-400">Fluorescence Phase Contrast (Simulated)</span>
            </div>

            <canvas
              ref={canvasRef}
              width={640}
              height={140}
              className="w-full h-[140px] rounded border border-white/15 bg-black"
            />
          </div>

          {/* Growth Kinetics Timeline (Gompertz Growth Curve Table / Preview) */}
          <div className="p-4 rounded bg-[#0f1417] border border-white/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">
                GOMPERTZ POPULATION GROWTH KINETICS (OD600)
              </span>
              <span className="text-[10px] text-[#f59e0b] font-bold">
                Max Carrying Capacity: {growthData[growthData.length - 1]?.od600 || 1.2} OD
              </span>
            </div>

            {/* Micro Sparkline / Bar Graph */}
            <div className="h-24 w-full bg-black/60 rounded border border-white/10 p-2 flex items-end gap-1 overflow-x-auto">
              {growthData.map((pt, idx) => {
                const heightPercent = Math.min(100, Math.round((pt.od600 / 2.0) * 100));
                return (
                  <div
                    key={idx}
                    title={`T: ${pt.time_hours}h | OD: ${pt.od600} | Viability: ${pt.viability_percent}%`}
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                    className={`flex-1 min-w-[8px] rounded-t transition-all ${
                      pt.viability_percent < 40 ? "bg-red-500" : pt.viability_percent < 75 ? "bg-[#f59e0b]" : "bg-white"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Transcriptional Stress Gene Induction Matrix */}
          <div className="p-4 rounded bg-[#0f1417] border border-white/20 space-y-3">
            <span className="text-xs font-bold text-white uppercase">
              TRANSCRIPTIONAL STRESS REGULON INDUCTION (FOLD CHANGE)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {inducedGenes.map((gene, idx) => (
                <div key={idx} className="p-2.5 rounded bg-black/60 border border-white/15 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{gene.gene}</span>
                    <span className="text-[10px] font-bold text-[#f59e0b]">+{gene.fold_induction}x</span>
                  </div>
                  <div className="text-[10px] text-neutral-300">{gene.protein}</div>
                  <div className="text-[9px] text-neutral-500">{gene.pathway}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
