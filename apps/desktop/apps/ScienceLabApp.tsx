"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Activity,
  Dna,
  ShieldCheck,
  Zap,
  Download,
  Flame,
  Droplets,
  Radio,
  Sliders,
  CheckCircle2
} from "lucide-react";
import { useDesktopStore } from "../lib/store";

interface StressConfig {
  name: string;
  type: string;
  icon: any;
  primaryMechanism: string;
  targetLoci: string;
  repairEnzyme: string;
  asciiVisual: string;
  description: string;
}

const STRESS_PROFILES: Record<string, StressConfig> = {
  Oxidative: {
    name: "Oxidative Radicals (H2O2 / ROS)",
    type: "Reactive Oxygen Species",
    icon: Zap,
    primaryMechanism: "8-oxo-7,8-dihydroguanine (8-oxoG) adducts & single-strand nicks",
    targetLoci: "GC-rich promoters, gyrA QRDR locus, rpoB catalytic cleft",
    repairEnzyme: "MutM / MutY formamidopyrimidine-DNA glycosylase & OxyR regulon",
    description: "Hydroxyl radicals oxidize deoxyguanosine residues causing G:C to T:A transversions.",
    asciiVisual: `      .------------------------.
     /        CELL MATRIX       \\
    |   [DNA] ====||==== [DNA]   |
    |     * * ROS STRESS * *     | ---> H2O2 / OH* Free Radical Flux
    |        \\_  MutM BER  _/    |
     \\                          /
      '------------------------'`
  },
  Thermal: {
    name: "Thermal Shock (42°C-50°C)",
    type: "Heat Denaturation",
    icon: Flame,
    primaryMechanism: "Secondary protein unfolding, aggregate formation, replication fork stall",
    targetLoci: "DnaA origin of replication (oriC), gyrB ATP binding domain",
    repairEnzyme: "DnaK-DnaJ-GrpE chaperone system & Lon/Clp protease activation",
    description: "Thermal denaturation disrupts membrane lipid bilayers and destabilizes DNA polymerase complexes.",
    asciiVisual: `      .------------------------.
     /        CELL MATRIX       \\
    |   ~~ DNA DENATURATION ~~   |
    |    ^^^^ HEAT FLUX ^^^^     | ---> Heat Dissipation (46.5°C)
    |        { DnaK/GroEL }      |
     \\                          /
      '------------------------'`
  },
  Osmotic: {
    name: "Osmotic Hypertonicity (1.5M NaCl)",
    type: "Desiccation & Plasmolysis",
    icon: Droplets,
    primaryMechanism: "Water efflux, cell wall plasmolysis, cytoplasmic ionic compaction",
    targetLoci: "kdpFABC potassium transporter, ompC/ompF porin gating genes",
    repairEnzyme: "ProU glycine betaine / proline osmoprotectant transporter",
    description: "High osmolarity triggers turgor pressure collapse and induces transient DNA supercoiling shifts.",
    asciiVisual: `      .------------------------.
     /     > CELL MEMBRANE <    \\
    |   -> [COMPACTED DNA] <-    |
    |    << WATER EFFLUX >>      | ---> Osmotic Pressure: 1.5M NaCl
    |       [ Betaine Pump ]     |
     \\                          /
      '------------------------'`
  },
  HeavyMetal: {
    name: "Heavy Metal Ions (Cd2+ / Cu2+)",
    type: "Cytotoxicity & Thiol Binding",
    icon: FlaskConical,
    primaryMechanism: "Disruption of iron-sulfur clusters, zinc finger displacement",
    targetLoci: "cpxAR envelope stress locus, copA P-type ATPase, cusCFBA efflux",
    repairEnzyme: "Glutathione S-transferase & metallothionein chelation",
    description: "Divalent cations displace native cofactors, causing enzyme inactivation and aberrant DNA crosslinks.",
    asciiVisual: `      .------------------------.
     /        CELL MATRIX       \\
    |   [DNA] --[Cd2+]-- [DNA]   |
    |     # THIOL ADDUCTS #      | ---> Heavy Metal Influx (50 uM)
    |       < CopA Efflux >      |
     \\                          /
      '------------------------'`
  },
  Radiation: {
    name: "Ionizing Radiation (5-25 Gy)",
    type: "Biophysical DNA Lesions",
    icon: Radio,
    primaryMechanism: "Clustered double-strand breaks (DSBs) & base excision nicks",
    targetLoci: "Random genomic coordinates, replication forks, plasmid DNA",
    repairEnzyme: "RecA / RecBCD homologous recombination & LexA SOS cleavage",
    description: "Direct ionization and water radiolysis create multi-hit complex double-strand DNA ruptures.",
    asciiVisual: `      .------------------------.
     /        CELL MATRIX       \\
    |   ===[DSB]===  ===[DSB]=== |
    |     >> 15 Gy IONIZING <<   | ---> Low-LET Compton Scattering
    |       \\_ RecBCD / SOS _/   |
     \\                          /
      '------------------------'`
  }
};

export function ScienceLabApp() {
  const { openWindow } = useDesktopStore();
  const [stressKey, setStressKey] = useState<string>("Oxidative");
  const [intensity, setIntensity] = useState<number>(0.65);
  const [durationMin, setDurationMin] = useState<number>(30);
  const [repairBoost, setRepairBoost] = useState<boolean>(true);
  const [showAscii, setShowAscii] = useState<boolean>(true);

  // Dynamic Simulation state
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simTimeStep, setSimTimeStep] = useState<number>(100); // 0 to 100% of duration
  const timerRef = useRef<any>(null);

  const profile = STRESS_PROFILES[stressKey] || STRESS_PROFILES.Oxidative;

  // Kinetic Calculations based on time step and parameters
  const effectiveProgress = simTimeStep / 100;
  const baseDmg = intensity * 45 * effectiveProgress;
  const repairMitigation = repairBoost ? 12 * effectiveProgress : 0;
  
  const rawIntegrity = 100 - baseDmg + repairMitigation;
  const integrity = Math.max(8, Math.min(100, Math.round(rawIntegrity)));
  
  const stressVal = Math.min(100, Math.round(intensity * 90 * (0.4 + 0.6 * effectiveProgress)));
  const repairVal = Math.min(100, Math.round((intensity * 75 + (repairBoost ? 15 : 0)) * effectiveProgress));
  const viability = Math.max(5, Math.min(100, Math.round(100 - intensity * 60 * effectiveProgress)));

  // Simulation Timer Hook
  useEffect(() => {
    if (simRunning) {
      timerRef.current = setInterval(() => {
        setSimTimeStep((prev) => {
          if (prev >= 100) {
            setSimRunning(false);
            return 100;
          }
          return prev + 5;
        });
      }, 350);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [simRunning]);

  const handleStartSim = () => {
    if (simTimeStep >= 100) {
      setSimTimeStep(0);
    }
    setSimRunning(true);
  };

  const handlePauseSim = () => {
    setSimRunning(false);
  };

  const handleResetSim = () => {
    setSimRunning(false);
    setSimTimeStep(0);
  };

  // Phenotypic state label
  const getSurvivalStatus = () => {
    if (integrity > 80 && viability > 75) {
      return { text: "PHYSIOLOGICALLY HOMEOSTATIC", color: "text-emerald-400 bg-emerald-950/80 border-emerald-500" };
    }
    if (integrity > 55 && viability > 45) {
      return { text: "ACUTE STRESS (REPAIR COMPENSATED)", color: "text-amber-400 bg-amber-950/80 border-amber-500" };
    }
    if (integrity > 30) {
      return { text: "CRITICAL GENOTOXIC BURDEN", color: "text-orange-400 bg-orange-950/80 border-orange-500" };
    }
    return { text: "LETHAL CELLULAR LYSIS", color: "text-red-400 bg-red-950/80 border-red-500" };
  };

  const status = getSurvivalStatus();

  const handleExportJSON = () => {
    const runData = {
      model: "ScienceLab_StochasticStressSimulator_v2.4",
      stressAgent: profile.name,
      stressClass: profile.type,
      intensity,
      durationMinutes: durationMin,
      repairSystemBoost: repairBoost,
      simProgressPercent: simTimeStep,
      results: {
        dnaIntegrityPercent: integrity,
        reactiveStressFluxPercent: stressVal,
        repairBurdenPercent: repairVal,
        colonyViabilityPercent: viability,
        phenotypeStatus: status.text
      },
      targetLoci: profile.targetLoci,
      primaryRepairEnzyme: profile.repairEnzyme,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(runData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SCIENCE_LAB_SIMULATION_${stressKey}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      {/* Top Header Bar */}
      <div className="p-3 bg-surface border border-surface-border rounded flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-500/70 flex items-center justify-center text-emerald-400">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-wide">
                SCIENCE LAB // CELLULAR STRESS & DNA BREAKAGE SIMULATOR
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                STOCHASTIC ENGINE
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              CELLULAR MEMBRANE INTEGRITY, STRAND NICKING, AND SOS REPAIR INDUCTION
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAscii(!showAscii)}
            className="text-[11px] px-2.5 py-1 rounded bg-surface-secondary text-slate-300 border border-surface-border hover:border-emerald-500/50 hover:text-emerald-300 transition-all"
          >
            {showAscii ? "Hide ASCII Cell" : "Show ASCII Cell"}
          </button>
          <button
            onClick={handleExportJSON}
            className="text-[11px] px-2.5 py-1 rounded bg-surface-secondary text-slate-300 border border-surface-border hover:border-cyan-500/50 hover:text-cyan-300 flex items-center gap-1 transition-all"
          >
            <Download className="w-3 h-3 text-cyan-400" /> Export Run
          </button>
          <button
            onClick={() => openWindow("genome-competitor")}
            className="text-[11px] px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 transition-all"
          >
            <Dna className="w-3 h-3" /> Competitor
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters vs Model Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Simulation Parameters */}
        <div className="p-3.5 bg-surface border border-surface-border rounded space-y-3.5">
          <div className="flex items-center justify-between border-b border-surface-border pb-1.5">
            <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" /> SIMULATION PARAMETERS
            </span>
            <span className="text-[10px] text-slate-400">MODEL ID: SL-2026-X</span>
          </div>

          <div className="space-y-3">
            {/* Stress agent */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">
                ENVIRONMENTAL STRESS AGENT
              </label>
              <select
                value={stressKey}
                onChange={(e) => {
                  setStressKey(e.target.value);
                  setSimTimeStep(0);
                  setSimRunning(false);
                }}
                className="w-full bg-surface-secondary border border-surface-border rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(STRESS_PROFILES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Intensity Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                <span className="font-bold">STRESS CONCENTRATION / INTENSITY:</span>
                <span className="text-emerald-400 font-bold">{(intensity * 100).toFixed(0)}% ({intensity.toFixed(2)})</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.00"
                step="0.05"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>Sub-inhibitory (0.1)</span>
                <span>IC50 (0.5)</span>
                <span>Supralethal (1.0)</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                <span className="font-bold">EXPOSURE DURATION:</span>
                <span className="text-cyan-400 font-bold">{durationMin} minutes</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMin(mins)}
                    className={`py-1 rounded text-[11px] font-mono transition-all ${
                      durationMin === mins
                        ? "bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold"
                        : "bg-surface-secondary text-slate-400 border border-surface-border hover:text-slate-200"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Repair system toggle */}
            <div className="p-2 bg-surface-secondary border border-surface-border rounded flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-200">
                  Adaptive Repair Induction
                </div>
                <div className="text-[9px] text-slate-400">
                  {profile.repairEnzyme}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRepairBoost(!repairBoost)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  repairBoost
                    ? "bg-emerald-950 border border-emerald-500 text-emerald-300"
                    : "bg-surface-chrome border border-surface-border text-slate-500"
                }`}
              >
                {repairBoost ? "ENABLED" : "MUTANT (NULL)"}
              </button>
            </div>

            {/* Simulation Playback Controls */}
            <div className="pt-1 flex items-center gap-2">
              {simRunning ? (
                <button
                  type="button"
                  onClick={handlePauseSim}
                  className="flex-1 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-1.5 text-xs shadow-sm transition-all"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartSim}
                  className="flex-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 text-xs shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Run Kinetic Simulation
                </button>
              )}

              <button
                type="button"
                onClick={handleResetSim}
                className="px-3 py-1.5 rounded bg-surface-secondary border border-surface-border hover:text-slate-100 text-slate-400 flex items-center justify-center transition-all"
                title="Reset Simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time progress bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>SIMULATION PROGRESS</span>
                <span>{(durationMin * (simTimeStep / 100)).toFixed(1)} / {durationMin} min ({simTimeStep}%)</span>
              </div>
              <div className="w-full bg-surface-chrome h-1.5 rounded overflow-hidden">
                <div
                  style={{ width: `${simTimeStep}%` }}
                  className="bg-emerald-500 h-full transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Simulation Output & Kinetics */}
        <div className="p-3.5 bg-surface border border-surface-border rounded space-y-3.5">
          <div className="flex items-center justify-between border-b border-surface-border pb-1.5">
            <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> KINETIC BIOPHYSICAL READOUT
            </span>
            <span className="text-[10px] text-slate-400">CONFIDENCE: 0.91</span>
          </div>

          {/* Survival status badge */}
          <div className={`p-2 rounded border flex items-center justify-between text-[11px] font-bold ${status.color}`}>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> CELL STATE:
            </span>
            <span>{status.text}</span>
          </div>

          {/* Metric bars */}
          <div className="space-y-2.5 text-[11px]">
            {/* DNA Integrity */}
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">DNA Double-Strand Integrity:</span>
                <span className={`font-bold ${integrity > 70 ? "text-emerald-400" : integrity > 40 ? "text-amber-400" : "text-red-400"}`}>
                  {integrity}%
                </span>
              </div>
              <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden border border-surface-border/50">
                <div
                  style={{ width: `${integrity}%` }}
                  className={`h-full transition-all duration-300 ${
                    integrity > 70 ? "bg-emerald-500" : integrity > 40 ? "bg-amber-500" : "bg-red-500"
                  }`}
                />
              </div>
            </div>

            {/* Reactive Stress Flux */}
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Reactive Stress Signal:</span>
                <span className="text-amber-400 font-bold">{stressVal}%</span>
              </div>
              <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden border border-surface-border/50">
                <div
                  style={{ width: `${stressVal}%` }}
                  className="bg-amber-500 h-full transition-all duration-300"
                />
              </div>
            </div>

            {/* Cellular Repair Load */}
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Repair Pathway Burden:</span>
                <span className="text-cyan-400 font-bold">{repairVal}%</span>
              </div>
              <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden border border-surface-border/50">
                <div
                  style={{ width: `${repairVal}%` }}
                  className="bg-cyan-500 h-full transition-all duration-300"
                />
              </div>
            </div>

            {/* Colony Viability */}
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Colony Survival Viability:</span>
                <span className={`font-bold ${viability > 60 ? "text-emerald-400" : "text-red-400"}`}>
                  {viability}%
                </span>
              </div>
              <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden border border-surface-border/50">
                <div
                  style={{ width: `${viability}%` }}
                  className={`h-full transition-all duration-300 ${
                    viability > 60 ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Molecular Targets Info Box */}
          <div className="p-2.5 bg-surface-secondary border border-surface-border rounded space-y-1.5 text-[10px]">
            <div>
              <span className="text-slate-400 uppercase font-bold block">Biochemical Mechanism:</span>
              <span className="text-slate-200">{profile.primaryMechanism}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold block">Vulnerable Genomic Loci:</span>
              <span className="text-cyan-300">{profile.targetLoci}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic ASCII Cellular State Frame */}
      {showAscii && (
        <div className="p-3 bg-surface-chrome border border-surface-border rounded font-mono text-[10px] text-emerald-400/90 whitespace-pre overflow-x-auto shadow-inner">
{`FRAME ${Math.round(simTimeStep * 1.42).toString().padStart(3, "0")} // CELLULAR BIOPHYSICAL MATRIX
AGENT: ${profile.name.toUpperCase()} // TIME: ${(durationMin * (simTimeStep / 100)).toFixed(1)}m / ${durationMin}m

${profile.asciiVisual}

DNA INTEGRITY [${"#".repeat(Math.max(0, Math.round(integrity / 10)))}${"-".repeat(Math.max(0, 10 - Math.round(integrity / 10)))}] ${integrity}%
REPAIR BURDEN [${"#".repeat(Math.max(0, Math.round(repairVal / 10)))}${"-".repeat(Math.max(0, 10 - Math.round(repairVal / 10)))}] ${repairVal}%
SURVIVAL PROB [${"#".repeat(Math.max(0, Math.round(viability / 10)))}${"-".repeat(Math.max(0, 10 - Math.round(viability / 10)))}] ${viability}%`}
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-2.5 bg-surface border border-surface-border rounded text-[10px] text-slate-400 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>
          MODEL DISCLAIMER: Outputs are computational biophysical approximations derived from stochastic kinetics.
        </span>
      </div>
    </div>
  );
}
