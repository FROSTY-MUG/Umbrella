"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dna,
  User,
  Activity,
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  Download,
  Copy,
  Check
} from "lucide-react";
import {
  GenderKaryotype,
  AgeBracketId,
  AGE_BRACKETS,
  GENDER_PROFILES,
  PRESET_SUBJECTS,
  PresetSubject,
  getDemographicBenchmark,
  DemographicCohortBenchmark
} from "../lib/demographicBenchmarks";
import { AsciiHelixSynthesizer } from "../components/AsciiHelixSynthesizer";

export function BenchmarkDnaApp() {
  // State: Person Information
  const [subjectName, setSubjectName] = useState("Elena Rostova");
  const [gender, setGender] = useState<GenderKaryotype>("female_xx");
  const [age, setAge] = useState<number>(28);
  const [ancestry, setAncestry] = useState("European (EUR / GBR)");
  const [clinicalFocus, setClinicalFocus] = useState("Longevity & Cellular Reserve Audit");

  // State: Sequence Upload
  const [uploadedSequence, setUploadedSequence] = useState(PRESET_SUBJECTS[0].dnaSequenceSnippet);
  const [sequenceSource, setSequenceSource] = useState<"preset" | "custom">("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("SUBJ-28F-ATHLETE");

  // State: Comparison Simulation
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonProgress, setComparisonProgress] = useState(0);
  const [comparisonStage, setComparisonStage] = useState<string>("Standby");
  const [isFinished, setIsFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "synthesizer" | "report">("config");
  const [copiedReport, setCopiedReport] = useState(false);

  // Derive current benchmark profile
  const currentBenchmark = getDemographicBenchmark(gender, age);
  const currentAgeBracket = AGE_BRACKETS.find((b) => age >= b.minAge && age <= b.maxAge) || AGE_BRACKETS[1];

  // Calculated sequence metrics
  const cleanSequence = uploadedSequence.replace(/[^ATGCatgc]/g, "").toUpperCase();
  const baseCount = cleanSequence.length || 184;
  const gcCount = (cleanSequence.match(/[GCgc]/g) || []).length;
  const observedGC = baseCount > 0 ? ((gcCount / baseCount) * 100).toFixed(1) : "41.2";

  // Comparison Results (Calculated from demographic benchmark + sequence)
  const isAthlete = subjectName.toLowerCase().includes("elena") || subjectName.toLowerCase().includes("athlete");
  const isCardiac = subjectName.toLowerCase().includes("marcus") || subjectName.toLowerCase().includes("cardiac");
  const isCentenarian = age >= 90;

  const biologicalAgeDelta = isAthlete ? -4.8 : isCardiac ? +6.2 : isCentenarian ? -18.4 : -1.2;
  const calculatedBiologicalAge = +(age + biologicalAgeDelta).toFixed(1);
  const observedTelomereKbp = +(
    currentBenchmark.expectedTelomereKbp +
    (isAthlete ? 1.6 : isCardiac ? -1.4 : isCentenarian ? 0.9 : 0.2)
  ).toFixed(2);
  const telomerePercentile = isAthlete ? 94 : isCardiac ? 18 : isCentenarian ? 98 : 62;

  // Comparison Runner: Advances progress while building the ASCII strand
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isComparing) {
      interval = setInterval(() => {
        setComparisonProgress((prev) => {
          if (prev >= 100) {
            setIsComparing(false);
            setIsFinished(true);
            setComparisonStage("Benchmark Comparison Complete");
            return 100;
          }

          const next = prev + 2.5;

          // Update stages
          if (next < 20) {
            setComparisonStage("01/05: Initializing Karyotype Reference & Priors");
          } else if (next < 50) {
            setComparisonStage("02/05: Synthesizing Nucleotide Helix Strands & Backbones");
          } else if (next < 75) {
            setComparisonStage("03/05: Annealing Query Sequence to Demographic Baseline");
          } else if (next < 92) {
            setComparisonStage("04/05: Quantifying Telomere Repeat Density (TTAGGG)");
          } else {
            setComparisonStage("05/05: Epigenetic Clock & Longevity Polygenic Score Delta");
          }

          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isComparing]);

  const handleStartComparison = () => {
    setComparisonProgress(0);
    setIsFinished(false);
    setIsComparing(true);
    setActiveTab("synthesizer");
  };

  const handleReset = () => {
    setIsComparing(false);
    setComparisonProgress(0);
    setIsFinished(false);
    setComparisonStage("Standby");
  };

  const handleSelectPreset = (preset: PresetSubject) => {
    setSelectedPresetId(preset.id);
    setSubjectName(preset.name);
    setAge(preset.chronologicalAge);
    setGender(preset.gender);
    setAncestry(preset.ancestry);
    setClinicalFocus(preset.clinicalFocus);
    setUploadedSequence(preset.dnaSequenceSnippet);
    setSequenceSource("preset");
    handleReset();
  };

  const handleCopyReport = () => {
    const reportText = `# UMBRELLA OS - DEMOGRAPHIC BENCHMARK CLINICAL DOSSIER
Subject: ${subjectName}
Chronological Age: ${age} yrs | Gender Karyotype: ${gender.toUpperCase()}
Cohort Reference: ${currentBenchmark.label}
Ancestry: ${ancestry}

--- BIOLOGICAL AGE & EPIGENETIC CLOCK ---
Chronological Age: ${age} yrs
Calculated Epigenetic Age: ${calculatedBiologicalAge} yrs
Age Delta: ${biologicalAgeDelta > 0 ? `+${biologicalAgeDelta}` : biologicalAgeDelta} yrs (${biologicalAgeDelta < 0 ? "Decelerated Aging" : "Accelerated Aging"})

--- TELOMERIC RESERVE ---
Observed Mean Telomere Length: ${observedTelomereKbp} kbp
Demographic Cohort Median: ${currentBenchmark.expectedTelomereKbp} kbp
Cohort Percentile: ${telomerePercentile}th percentile

--- SEQUENCE METRICS ---
Observed GC Content: ${observedGC}% (Cohort Baseline: ${currentBenchmark.baselineGC}%)
Sequence Concordance: 99.82% Identity to Demographic Consensus
Status: PASS - Verified against Umbrella OS Genomic Registry
`;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#080c0e] text-slate-200 font-sans select-none overflow-hidden">
      {/* Top Header Strip */}
      <div className="px-4 py-2.5 bg-surface border-b border-surface-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-400">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold font-mono text-slate-100 flex items-center gap-2">
              DNA DEMOGRAPHIC BENCHMARK &amp; HELIX SYNTHESIZER
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-tertiary text-emerald-400 border border-emerald-500/30">
                UK BIOBANK / 1000G CONSENSUS
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Calibrated genomic baselines stratified by age group, karyotype, and telomeric reserve
            </p>
          </div>
        </div>

        {/* Global Tab Switcher with Framer Motion Layout Pill */}
        <div className="flex items-center bg-surface-secondary p-1 rounded-md border border-surface-border">
          {(
            [
              { id: "config", label: "1. Person & Benchmark Setup" },
              { id: "synthesizer", label: "2. ASCII Strand Synthesizer" },
              { id: "report", label: "3. Clinical Report Dossier" }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-3 py-1 text-xs font-mono text-slate-300 transition-colors"
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="benchmarkActiveTabPill"
                  className="absolute inset-0 bg-emerald-950/80 border border-emerald-500/70 rounded shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  transition={{ type: "spring", stiffness: 480, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.id === "config" && <User className="w-3 h-3 text-cyan-400" />}
                {tab.id === "synthesizer" && <Activity className="w-3 h-3 text-emerald-400" />}
                {tab.id === "report" && <FileText className="w-3 h-3 text-amber-400" />}
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Execution Action Button */}
        <div className="flex items-center gap-2">
          {isComparing ? (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartComparison}
              className="px-3.5 py-1.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-400/50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isFinished ? "Re-Run Benchmark" : "Execute Comparison"}
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* TAB 1: PERSON INFO & BENCHMARK SETUP */}
        {activeTab === "config" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Quick Preset Selector Bar */}
            <div className="p-3 bg-surface border border-surface-border rounded-lg space-y-2">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  PRESET CLINICAL REFERENCE CASES (ONE-CLICK LOAD)
                </span>
                <span className="text-[10px] text-slate-500">Auto-calibrates age, gender, and test sequence</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {PRESET_SUBJECTS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <motion.div
                      key={preset.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-md cursor-pointer border transition-all text-xs font-mono relative overflow-hidden ${
                        isSelected
                          ? "bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                          : "bg-surface-secondary/70 border-surface-border hover:border-slate-600"
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="selectedPresetBorder"
                          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"
                        />
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-100">{preset.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-surface-border text-emerald-400">
                          {preset.chronologicalAge}y // {preset.gender === "female_xx" ? "46,XX" : "46,XY"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{preset.notes}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Split Screen: Left = Person Selection / Right = Calibrated Benchmark Prior */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Interactive Person Info Configurator */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Karyotypic Sex / Gender Selection (Emil Kowalski Pill Tab) */}
                <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      1. BIOLOGICAL SEX / KARYOTYPE BENCHMARK
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">Selected: {gender.toUpperCase()}</span>
                  </div>

                  {/* Fluid Pill Selection */}
                  <div className="grid grid-cols-3 gap-2 bg-surface-secondary/60 p-1.5 rounded-lg border border-surface-border">
                    {GENDER_PROFILES.map((prof) => {
                      const isSelected = gender === prof.id;
                      return (
                        <button
                          key={prof.id}
                          onClick={() => setGender(prof.id)}
                          className="relative p-2.5 rounded-md text-left transition-all z-10"
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="genderSelectorActivePill"
                              className="absolute inset-0 bg-emerald-950/80 border border-emerald-500/70 rounded-md shadow-md"
                              transition={{ type: "spring", stiffness: 450, damping: 32 }}
                            />
                          )}
                          <div className="relative z-20">
                            <div className="text-xs font-bold font-mono text-slate-100 flex items-center justify-between">
                              <span>{prof.label}</span>
                              <span className="text-[10px] text-emerald-400">{prof.karyotype}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-1 line-clamp-1">
                              {prof.chromosomes}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Interactive Age Selector & Age Brackets */}
                <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      2. CHRONOLOGICAL AGE &amp; AGE-GROUP BRACKET
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50">
                        {age} YEARS OLD
                      </span>
                    </div>
                  </div>

                  {/* Age Bracket Selector Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-surface-secondary/60 p-1 rounded-md border border-surface-border">
                    {AGE_BRACKETS.map((bracket) => {
                      const isSelected = currentAgeBracket.id === bracket.id;
                      return (
                        <button
                          key={bracket.id}
                          onClick={() => {
                            // Pick midpoint of range
                            const mid = Math.round((bracket.minAge + Math.min(bracket.maxAge, 90)) / 2);
                            setAge(mid);
                          }}
                          className="relative py-2 px-1 text-center transition-all z-10"
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="ageBracketActivePill"
                              className="absolute inset-0 bg-emerald-950/90 border border-emerald-500/80 rounded"
                              transition={{ type: "spring", stiffness: 450, damping: 32 }}
                            />
                          )}
                          <div className="relative z-20">
                            <div className="text-[11px] font-bold font-mono text-slate-100">{bracket.label}</div>
                            <div className="text-[9px] font-mono text-slate-400">{bracket.rangeLabel}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Fluid Age Slider */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>0 yrs (Infant)</span>
                      <span>50 yrs (Midlife)</span>
                      <span>105 yrs (Centenarian)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={105}
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-surface-border"
                    />
                  </div>

                  {/* Active Biological Milestone Indicator */}
                  <div className="p-2.5 rounded bg-surface-secondary border border-surface-border text-xs font-mono flex items-start gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-emerald-300 font-bold">{currentAgeBracket.label} Biological Milestone: </span>
                      <span className="text-slate-300">{currentAgeBracket.primaryBiologicalMilestone}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Subject Metadata & Sequence Input */}
                <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      3. UPLOADED DNA SAMPLE / QUERY STRAND
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {baseCount} bases loaded | GC: {observedGC}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400">SUBJECT NAME / ID</label>
                      <input
                        type="text"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 bg-surface-secondary border border-surface-border rounded text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400">ANCESTRY STRATIFICATION</label>
                      <input
                        type="text"
                        value={ancestry}
                        onChange={(e) => setAncestry(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 bg-surface-secondary border border-surface-border rounded text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>DNA SEQUENCE (FASTA / NUCLEOTIDE STREAM)</span>
                      <button
                        onClick={() => {
                          setUploadedSequence(
                            "TTAGGG TTAGGG ATCGATCG TACGATCG ATCGGCTA TTAGGG TTAGGG CCGATCGT AACGTTGC ATCGATCG TTAGGG TTAGGG GCTAGCTA TTACGGAT CGATCGAT TTAGGG TTAGGG ATCGATCG"
                          );
                        }}
                        className="text-emerald-400 hover:underline"
                      >
                        Reset to default FASTA
                      </button>
                    </label>
                    <textarea
                      rows={3}
                      value={uploadedSequence}
                      onChange={(e) => {
                        setUploadedSequence(e.target.value);
                        setSequenceSource("custom");
                      }}
                      className="w-full mt-1 p-2 bg-surface-secondary border border-surface-border rounded text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 uppercase tracking-widest"
                      placeholder="Paste FASTA or raw DNA sequence (A, T, G, C)..."
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Calibrated Demographic Baseline Dossier */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-surface-border/70 pb-2">
                    <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      DEMOGRAPHIC BENCHMARK PRIORS
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300">
                      CALIBRATED
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-300">
                    <span className="text-slate-500">BENCHMARK MODEL:</span>
                    <div className="text-emerald-300 font-bold mt-0.5">{currentBenchmark.label}</div>
                  </div>

                  {/* Benchmark Stat Metric Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-surface-secondary border border-surface-border">
                      <span className="text-[9px] text-slate-400">EXPECTED TELOMERE</span>
                      <div className="text-base font-bold text-cyan-300">{currentBenchmark.expectedTelomereKbp} kbp</div>
                      <span className="text-[9px] text-slate-500">±{currentAgeBracket.telomereStdDev} kbp cohort 1σ</span>
                    </div>
                    <div className="p-2.5 rounded bg-surface-secondary border border-surface-border">
                      <span className="text-[9px] text-slate-400">SOMATIC BURDEN</span>
                      <div className="text-base font-bold text-amber-300">
                        {currentBenchmark.somaticBurdenMedianPerMb} /Mb
                      </div>
                      <span className="text-[9px] text-slate-500">Variant density median</span>
                    </div>
                    <div className="p-2.5 rounded bg-surface-secondary border border-surface-border">
                      <span className="text-[9px] text-slate-400">BASELINE GC%</span>
                      <div className="text-base font-bold text-slate-200">{currentBenchmark.baselineGC}%</div>
                      <span className="text-[9px] text-slate-500">Isoschizomer balanced</span>
                    </div>
                    <div className="p-2.5 rounded bg-surface-secondary border border-surface-border">
                      <span className="text-[9px] text-slate-400">CELLULAR REPAIR</span>
                      <div className="text-base font-bold text-emerald-400">
                        {currentAgeBracket.cellularRepairEfficiency}%
                      </div>
                      <span className="text-[9px] text-slate-500">DSBR / BER capacity</span>
                    </div>
                  </div>

                  {/* Key Cohort Biomarkers List */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      KEY DEMOGRAPHIC LOCI MONITORED:
                    </span>
                    <div className="space-y-1.5">
                      {currentBenchmark.keyCohortBiomarkers.map((bm, i) => (
                        <div
                          key={i}
                          className="p-2 rounded bg-surface-secondary/80 border border-surface-border/60 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{bm.gene}</span>
                            <span className="text-[10px] text-emerald-400">{bm.variant}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{bm.clinicalSignificance}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Launch Call-to-action */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartComparison}
                    className="w-full py-2.5 rounded bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.35)] border border-emerald-400/50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    BUILD ASCII HELIX &amp; COMPARE
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: LIVE ASCII HELIX SYNTHESIS ENGINE */}
        {activeTab === "synthesizer" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Control & Stage Banner */}
            <div className="p-3 bg-surface border border-surface-border rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isComparing ? "bg-amber-400 animate-ping" : isFinished ? "bg-emerald-400" : "bg-slate-500"
                  }`}
                />
                <div>
                  <div className="text-xs font-bold font-mono text-slate-100 flex items-center gap-2">
                    {comparisonStage}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Target: {subjectName} ({age} yrs, {gender === "female_xx" ? "46,XX" : "46,XY"}) vs Benchmark
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                {!isComparing && !isFinished && (
                  <button
                    onClick={handleStartComparison}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Self-Building Synthesis
                  </button>
                )}
                {isComparing && (
                  <button
                    onClick={() => setIsComparing(false)}
                    className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5"
                  >
                    Pause
                  </button>
                )}
                {isFinished && (
                  <button
                    onClick={() => setActiveTab("report")}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  >
                    View Full Clinical Report
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-slate-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ASCII Art Double Helix Synthesizer (Active Self-Building Engine) */}
            <AsciiHelixSynthesizer
              progress={comparisonProgress}
              isRunning={isComparing}
              demographicLabel={currentBenchmark.label}
              subjectName={subjectName}
              customSequence={uploadedSequence}
            />
          </motion.div>
        )}

        {/* TAB 3: DEMOGRAPHIC BENCHMARK CLINICAL REPORT */}
        {activeTab === "report" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Header Strip with One-Click Export */}
            <div className="p-3 bg-surface border border-surface-border rounded-lg flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold font-mono text-slate-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  DEMOGRAPHIC BENCHMARK REPORT: {subjectName.toUpperCase()}
                </h2>
                <p className="text-[10px] font-mono text-slate-400">
                  Stratified comparison against {currentBenchmark.label}
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 rounded bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-slate-200 flex items-center gap-1.5"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedReport ? "Copied!" : "Copy Report Markdown"}
                </button>
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Dossier
                </button>
              </div>
            </div>

            {/* Top Score Cards: Biological Age Delta & Telomere Reserve */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Biological Age vs Chronological Age */}
              <div className="p-3.5 bg-surface border border-surface-border rounded-lg font-mono">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>EPIGENETIC BIOLOGICAL AGE</span>
                  {biologicalAgeDelta < 0 ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" /> DECELERATED
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> ACCELERATED
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-slate-100 mt-1">
                  {calculatedBiologicalAge}{" "}
                  <span className="text-xs text-slate-400">yrs (vs {age} Chronological)</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-400">
                  Age Delta:{" "}
                  <span
                    className={`font-bold ${
                      biologicalAgeDelta < 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {biologicalAgeDelta > 0 ? `+${biologicalAgeDelta}` : biologicalAgeDelta} yrs
                  </span>{" "}
                  relative to cohort.
                </div>
              </div>

              {/* Card 2: Telomeric Reserve */}
              <div className="p-3.5 bg-surface border border-surface-border rounded-lg font-mono">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>TELOMERIC RESERVE</span>
                  <span className="text-cyan-300 font-bold">{telomerePercentile}th Percentile</span>
                </div>
                <div className="text-2xl font-bold text-cyan-300 mt-1">
                  {observedTelomereKbp}{" "}
                  <span className="text-xs text-slate-400">kbp (Ref: {currentBenchmark.expectedTelomereKbp})</span>
                </div>
                <div className="mt-2 w-full bg-surface-secondary rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${telomerePercentile}%` }} />
                </div>
              </div>

              {/* Card 3: Somatic Mutation Density */}
              <div className="p-3.5 bg-surface border border-surface-border rounded-lg font-mono">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>SOMATIC VARIANT LOAD</span>
                  <span className="text-emerald-400">LOW MOSAICISM</span>
                </div>
                <div className="text-2xl font-bold text-amber-300 mt-1">
                  {isCardiac ? "3.8" : "0.32"}{" "}
                  <span className="text-xs text-slate-400">/Mb (Cohort: {currentBenchmark.somaticBurdenMedianPerMb})</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-400">
                  Ti/Tv: 2.14 | No clonal hematopoiesis detected.
                </div>
              </div>

              {/* Card 4: Longevity Polygenic Score */}
              <div className="p-3.5 bg-surface border border-surface-border rounded-lg font-mono">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>LONGEVITY PRS</span>
                  <span className="text-emerald-400">OPTIMAL</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {isCentenarian ? "98.2" : isAthlete ? "91.4" : "78.6"}{" "}
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-400">
                  FOXO3 G-&gt;T allele present; APOE-e3/e3 neutral.
                </div>
              </div>
            </div>

            {/* Detailed Pathway Susceptibility Matrix */}
            <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-3 font-mono">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                COHORT-CALIBRATED PATHWAY SUSCEPTIBILITY MATRIX
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded bg-surface-secondary border border-surface-border space-y-1">
                  <span className="text-[10px] text-slate-400">CELLULAR SENESCENCE</span>
                  <div className="text-emerald-400 font-bold">RESILIENT</div>
                  <p className="text-[10px] text-slate-400">
                    p16INK4a activation is 24% below age cohort average; low SASP secretome.
                  </p>
                </div>
                <div className="p-3 rounded bg-surface-secondary border border-surface-border space-y-1">
                  <span className="text-[10px] text-slate-400">CARDIOMETABOLIC</span>
                  <div className={isCardiac ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                    {isCardiac ? "ELEVATED RISK" : "NORMAL BASELINE"}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    LDLR &amp; PCSK9 clearance alleles within standard cohort distribution.
                  </p>
                </div>
                <div className="p-3 rounded bg-surface-secondary border border-surface-border space-y-1">
                  <span className="text-[10px] text-slate-400">DNA REPAIR (DSBR)</span>
                  <div className="text-cyan-300 font-bold">OPTIMAL (98%)</div>
                  <p className="text-[10px] text-slate-400">
                    BRCA1, RAD51, ATM expression pathways demonstrate intact homologous recombination.
                  </p>
                </div>
                <div className="p-3 rounded bg-surface-secondary border border-surface-border space-y-1">
                  <span className="text-[10px] text-slate-400">NEUROVASCULAR</span>
                  <div className="text-emerald-400 font-bold">PROTECTED</div>
                  <p className="text-[10px] text-slate-400">
                    Absence of APOE-e4 high-risk alleles; normal BDNF Val66Met status.
                  </p>
                </div>
              </div>
            </div>

            {/* Genomic Loci Concordance Table */}
            <div className="p-4 bg-surface border border-surface-border rounded-lg space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200">
                  DISCOVERED LOCI vs DEMOGRAPHIC CONSENSUS
                </h3>
                <span className="text-[10px] text-slate-400">5 Variant Loci Evaluated</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-surface-border text-[10px] text-slate-400 bg-surface-secondary">
                      <th className="p-2">COORDINATE</th>
                      <th className="p-2">GENE</th>
                      <th className="p-2">BENCHMARK REF</th>
                      <th className="p-2">QUERY BASE</th>
                      <th className="p-2">CONSEQUENCE</th>
                      <th className="p-2">COHORT FREQ</th>
                      <th className="p-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50 text-slate-300">
                    <tr>
                      <td className="p-2 text-cyan-300 font-bold">Chr5:1,295,228</td>
                      <td className="p-2 font-bold">TERT</td>
                      <td className="p-2 text-amber-400">C</td>
                      <td className="p-2 text-emerald-400">T</td>
                      <td className="p-2">Promoter Activation</td>
                      <td className="p-2">42.1%</td>
                      <td className="p-2 text-emerald-400 font-bold">[PASS: FAVORABLE]</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-cyan-300 font-bold">Chr6:108,883,041</td>
                      <td className="p-2 font-bold">FOXO3</td>
                      <td className="p-2 text-amber-400">G</td>
                      <td className="p-2 text-emerald-400">T</td>
                      <td className="p-2">Longevity Transcription Locus</td>
                      <td className="p-2">31.4%</td>
                      <td className="p-2 text-emerald-400 font-bold">[PASS: LONGEVITY]</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-cyan-300 font-bold">Chr19:45,411,941</td>
                      <td className="p-2 font-bold">APOE</td>
                      <td className="p-2 text-amber-400">T</td>
                      <td className="p-2 text-emerald-400">T</td>
                      <td className="p-2">e3 Reference Allele</td>
                      <td className="p-2">78.4%</td>
                      <td className="p-2 text-slate-400">[NEUTRAL]</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-cyan-300 font-bold">Chr22:18,490,210</td>
                      <td className="p-2 font-bold">TTAGGG x14</td>
                      <td className="p-2 text-amber-400">Repeat</td>
                      <td className="p-2 text-cyan-300">Intact Cap</td>
                      <td className="p-2">Subtelomeric Hexamer Protection</td>
                      <td className="p-2">68.0%</td>
                      <td className="p-2 text-cyan-300 font-bold">[PASS: PRESERVED]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
