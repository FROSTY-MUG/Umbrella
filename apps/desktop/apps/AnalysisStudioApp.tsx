"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  LineChart,
  Table,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  Layers,
  ArrowUpDown,
  PieChart,
  HelpCircle,
  Database
} from "lucide-react";

interface DrugData {
  drug: string;
  class: string;
  resistant: number; // percentage
  intermediate: number;
  susceptible: number;
  count: number;
  clsiBreakpoint: string;
}

interface MarkerData {
  gene: string;
  class: string;
  type: "PLASMID" | "CHROMOSOMAL";
  frequency: number; // percentage
  isolates: number;
  oddsRatio: number;
}

interface ParquetFeature {
  name: string;
  category: "AMR_GENE" | "SNP_MUTATION" | "GENOMIC_METRIC" | "VIRULENCE";
  type: string;
  nonZero: number;
  sparsity: string;
  mean: string;
  importance: number;
}

const DRUG_PANELS: Record<string, DrugData[]> = {
  "all-isolates": [
    { drug: "Ciprofloxacin", class: "Fluoroquinolone", resistant: 68.4, intermediate: 4.2, susceptible: 27.4, count: 1500, clsiBreakpoint: ">= 1 ug/mL" },
    { drug: "Meropenem", class: "Carbapenem", resistant: 42.1, intermediate: 6.8, susceptible: 51.1, count: 1500, clsiBreakpoint: ">= 4 ug/mL" },
    { drug: "Ceftriaxone", class: "3rd Gen Cephalosporin", resistant: 74.8, intermediate: 3.1, susceptible: 22.1, count: 1500, clsiBreakpoint: ">= 4 ug/mL" },
    { drug: "Gentamicin", class: "Aminoglycoside", resistant: 38.5, intermediate: 5.5, susceptible: 56.0, count: 1500, clsiBreakpoint: ">= 16 ug/mL" },
    { drug: "Colistin", class: "Polymyxin", resistant: 12.3, intermediate: 2.1, susceptible: 85.6, count: 1500, clsiBreakpoint: "> 2 ug/mL" },
    { drug: "Pip/Tazo", class: "Beta-lactam Combo", resistant: 51.2, intermediate: 8.4, susceptible: 40.4, count: 1500, clsiBreakpoint: ">= 128/4 ug/mL" }
  ],
  "kp-panel": [
    { drug: "Ciprofloxacin", class: "Fluoroquinolone", resistant: 82.5, intermediate: 2.5, susceptible: 15.0, count: 480, clsiBreakpoint: ">= 1 ug/mL" },
    { drug: "Meropenem", class: "Carbapenem", resistant: 61.3, intermediate: 7.2, susceptible: 31.5, count: 480, clsiBreakpoint: ">= 4 ug/mL" },
    { drug: "Ceftriaxone", class: "3rd Gen Cephalosporin", resistant: 89.2, intermediate: 1.8, susceptible: 9.0, count: 480, clsiBreakpoint: ">= 4 ug/mL" },
    { drug: "Gentamicin", class: "Aminoglycoside", resistant: 48.0, intermediate: 4.0, susceptible: 48.0, count: 480, clsiBreakpoint: ">= 16 ug/mL" },
    { drug: "Colistin", class: "Polymyxin", resistant: 18.6, intermediate: 1.4, susceptible: 80.0, count: 480, clsiBreakpoint: "> 2 ug/mL" },
    { drug: "Pip/Tazo", class: "Beta-lactam Combo", resistant: 68.4, intermediate: 6.6, susceptible: 25.0, count: 480, clsiBreakpoint: ">= 128/4 ug/mL" }
  ],
  "ab-panel": [
    { drug: "Ciprofloxacin", class: "Fluoroquinolone", resistant: 91.0, intermediate: 1.0, susceptible: 8.0, count: 320, clsiBreakpoint: ">= 1 ug/mL" },
    { drug: "Meropenem", class: "Carbapenem", resistant: 78.4, intermediate: 4.6, susceptible: 17.0, count: 320, clsiBreakpoint: ">= 4 ug/mL" },
    { drug: "Ceftriaxone", class: "3rd Gen Cephalosporin", resistant: 94.0, intermediate: 2.0, susceptible: 4.0, count: 320, clsiBreakpoint: ">= 4 ug/mL" },
    { drug: "Gentamicin", class: "Aminoglycoside", resistant: 65.2, intermediate: 3.8, susceptible: 31.0, count: 320, clsiBreakpoint: ">= 16 ug/mL" },
    { drug: "Colistin", class: "Polymyxin", resistant: 9.2, intermediate: 0.8, susceptible: 90.0, count: 320, clsiBreakpoint: "> 2 ug/mL" },
    { drug: "Pip/Tazo", class: "Beta-lactam Combo", resistant: 84.1, intermediate: 5.9, susceptible: 10.0, count: 320, clsiBreakpoint: ">= 128/4 ug/mL" }
  ]
};

const MARKER_DATA: MarkerData[] = [
  { gene: "blaKPC-2", class: "Carbapenemase (Ambler Class A)", type: "PLASMID", frequency: 44.2, isolates: 663, oddsRatio: 14.8 },
  { gene: "blaNDM-1", class: "Metallo-beta-lactamase (Class B)", type: "PLASMID", frequency: 28.5, isolates: 428, oddsRatio: 22.4 },
  { gene: "blaOXA-48", class: "Oxacillinase Carbapenemase (Class D)", type: "PLASMID", frequency: 19.8, isolates: 297, oddsRatio: 8.6 },
  { gene: "gyrA_S83L", class: "DNA Gyrase QRDR Mutation", type: "CHROMOSOMAL", frequency: 65.0, isolates: 975, oddsRatio: 18.2 },
  { gene: "parC_S80I", class: "Topoisomerase IV QRDR Mutation", type: "CHROMOSOMAL", frequency: 58.4, isolates: 876, oddsRatio: 15.6 },
  { gene: "armA", class: "16S rRNA Methyltransferase", type: "PLASMID", frequency: 24.1, isolates: 362, oddsRatio: 19.3 },
  { gene: "mcr-1", class: "Phosphoethanolamine Transferase", type: "PLASMID", frequency: 8.4, isolates: 126, oddsRatio: 11.2 },
  { gene: "tet(X4)", class: "Tigecycline Flavin Monooxygenase", type: "PLASMID", frequency: 6.2, isolates: 93, oddsRatio: 16.5 }
];

const PARQUET_FEATURES: ParquetFeature[] = [
  { name: "has_blaKPC", category: "AMR_GENE", type: "int8", nonZero: 663, sparsity: "55.8%", mean: "0.442", importance: 0.94 },
  { name: "has_blaNDM", category: "AMR_GENE", type: "int8", nonZero: 428, sparsity: "71.5%", mean: "0.285", importance: 0.91 },
  { name: "has_gyrA_S83L", category: "SNP_MUTATION", type: "int8", nonZero: 975, sparsity: "35.0%", mean: "0.650", importance: 0.88 },
  { name: "has_parC_S80I", category: "SNP_MUTATION", type: "int8", nonZero: 876, sparsity: "41.6%", mean: "0.584", importance: 0.85 },
  { name: "has_armA", category: "AMR_GENE", type: "int8", nonZero: 362, sparsity: "75.9%", mean: "0.241", importance: 0.79 },
  { name: "has_mcr1", category: "AMR_GENE", type: "int8", nonZero: 126, sparsity: "91.6%", mean: "0.084", importance: 0.76 },
  { name: "gc_fraction", category: "GENOMIC_METRIC", type: "float64", nonZero: 1500, sparsity: "0.0%", mean: "0.534", importance: 0.62 },
  { name: "genome_length_bp", category: "GENOMIC_METRIC", type: "int64", nonZero: 1500, sparsity: "0.0%", mean: "5,321,440", importance: 0.58 },
  { name: "contig_n50_bp", category: "GENOMIC_METRIC", type: "int64", nonZero: 1500, sparsity: "0.0%", mean: "284,500", importance: 0.54 },
  { name: "plasmid_replicon_count", category: "GENOMIC_METRIC", type: "int8", nonZero: 1320, sparsity: "12.0%", mean: "3.42", importance: 0.71 }
];

export function AnalysisStudioApp() {
  const [cohort, setCohort] = useState<string>("all-isolates");
  const [activeTab, setActiveTab] = useState<"phenotypes" | "markers" | "correlation" | "parquet">("phenotypes");
  const [selectedDrug, setSelectedDrug] = useState<string>("Meropenem");
  const [minPrevalence, setMinPrevalence] = useState<number>(0);
  const [tableSearch, setTableSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const drugs = DRUG_PANELS[cohort] || DRUG_PANELS["all-isolates"];

  const filteredMarkers = useMemo(() => {
    return MARKER_DATA.filter((m) => m.frequency >= minPrevalence);
  }, [minPrevalence]);

  const filteredFeatures = useMemo(() => {
    return PARQUET_FEATURES.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        f.category.toLowerCase().includes(tableSearch.toLowerCase());
      const matchCat = categoryFilter === "ALL" || f.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [tableSearch, categoryFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const header = "Feature_Name,Category,Type,Non_Zero_Count,Sparsity,Mean_Value,Importance_Score\n";
    const rows = PARQUET_FEATURES.map(
      (f) => `"${f.name}","${f.category}","${f.type}",${f.nonZero},"${f.sparsity}","${f.mean}",${f.importance}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `UMBRELLA_PARQUET_FEATURES_${cohort}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const data = {
      cohort,
      timestamp: new Date().toISOString(),
      drugSusceptibility: drugs,
      amrMarkers: filteredMarkers,
      featureMatrix: PARQUET_FEATURES
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `UMBRELLA_COHORT_ANALYSIS_${cohort}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      {/* Top Header Bar */}
      <div className="p-3 bg-surface border border-surface-border rounded flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-500/70 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-wide">
                ANALYSIS STUDIO // TABULAR ANALYTICS & COHORT CHARTS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                PARQUET ENGINE
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              MICROBIAL PHENOTYPIC SUSCEPTIBILITY & AMR RESISTOME DISTRIBUTIONS
            </div>
          </div>
        </div>

        {/* Cohort Selector & Exports */}
        <div className="flex items-center gap-2">
          <select
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
            className="bg-surface-secondary border border-surface-border rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all-isolates">Global BV-BRC Cohort (n=1,500)</option>
            <option value="kp-panel">K. pneumoniae Carbapenem Panel (n=480)</option>
            <option value="ab-panel">A. baumannii Surveillance (n=320)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 rounded bg-surface-secondary border border-surface-border hover:border-cyan-500 hover:text-cyan-300 text-slate-300 text-[11px] flex items-center gap-1 transition-all"
            title="Export CSV"
          >
            <Download className="w-3 h-3 text-cyan-400" /> CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-2.5 py-1 rounded bg-surface-secondary border border-surface-border hover:border-emerald-500 hover:text-emerald-300 text-slate-300 text-[11px] flex items-center gap-1 transition-all"
            title="Export JSON"
          >
            <Download className="w-3 h-3 text-emerald-400" /> JSON
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 bg-surface border border-surface-border rounded space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Total Isolates</div>
          <div className="text-base font-bold text-slate-100">
            {cohort === "all-isolates" ? "1,500" : cohort === "kp-panel" ? "480" : "320"}
          </div>
          <div className="text-[9px] text-emerald-400">Stratified 5-Fold Partition</div>
        </div>

        <div className="p-2.5 bg-surface border border-surface-border rounded space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Phenotype Resistance</div>
          <div className="text-base font-bold text-red-400">
            {cohort === "all-isolates" ? "64.2%" : cohort === "kp-panel" ? "78.5%" : "83.1%"}
          </div>
          <div className="text-[9px] text-slate-400">Non-susceptible baseline</div>
        </div>

        <div className="p-2.5 bg-surface border border-surface-border rounded space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">MDR Co-Resistance</div>
          <div className="text-base font-bold text-amber-400">
            {cohort === "all-isolates" ? "41.8%" : cohort === "kp-panel" ? "62.4%" : "74.0%"}
          </div>
          <div className="text-[9px] text-slate-400">&gt;= 3 antimicrobial classes</div>
        </div>

        <div className="p-2.5 bg-surface border border-surface-border rounded space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Parquet Sparsity</div>
          <div className="text-base font-bold text-cyan-400">74.3%</div>
          <div className="text-[9px] text-slate-400">32 high-cardinality features</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border text-[11px]">
        <button
          onClick={() => setActiveTab("phenotypes")}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "phenotypes"
              ? "border-cyan-400 text-cyan-300 bg-surface/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Drug Susceptibility Panel
        </button>
        <button
          onClick={() => setActiveTab("markers")}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "markers"
              ? "border-cyan-400 text-cyan-300 bg-surface/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <PieChart className="w-3.5 h-3.5" /> AMR Determinant Frequencies
        </button>
        <button
          onClick={() => setActiveTab("correlation")}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "correlation"
              ? "border-cyan-400 text-cyan-300 bg-surface/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Gene-Phenotype Matrix
        </button>
        <button
          onClick={() => setActiveTab("parquet")}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "parquet"
              ? "border-cyan-400 text-cyan-300 bg-surface/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Table className="w-3.5 h-3.5" /> Parquet Feature Matrix ({PARQUET_FEATURES.length})
        </button>
      </div>

      {/* Tab 1: Phenotypes */}
      {activeTab === "phenotypes" && (
        <div className="space-y-3">
          <div className="p-3 bg-surface border border-surface-border rounded space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-2">
              <span className="font-semibold text-slate-100 text-xs">
                ANTIMICROBIAL SUSCEPTIBILITY TESTING (AST) DISTRIBUTION
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Resistant (R)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Intermediate (I)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Susceptible (S)
                </span>
              </div>
            </div>

            {/* Stacked Percentage Horizontal Bars */}
            <div className="space-y-3 pt-1">
              {drugs.map((d) => (
                <div
                  key={d.drug}
                  onClick={() => setSelectedDrug(d.drug)}
                  className={`p-2 rounded cursor-pointer transition-all border ${
                    selectedDrug === d.drug
                      ? "bg-surface-secondary border-cyan-500/70"
                      : "bg-surface-chrome border-surface-border/50 hover:border-surface-border"
                  }`}
                >
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="font-bold text-slate-100">
                      {d.drug} <span className="text-[9px] text-slate-400 font-normal">({d.class})</span>
                    </span>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-red-400 font-bold">{d.resistant}% R</span>
                      <span className="text-amber-400">{d.intermediate}% I</span>
                      <span className="text-emerald-400 font-bold">{d.susceptible}% S</span>
                    </div>
                  </div>

                  {/* Multi-segment stacked bar */}
                  <div className="w-full h-3 bg-surface rounded overflow-hidden flex">
                    <div
                      style={{ width: `${d.resistant}%` }}
                      className="bg-red-500 hover:bg-red-400 transition-all"
                      title={`Resistant: ${d.resistant}%`}
                    />
                    <div
                      style={{ width: `${d.intermediate}%` }}
                      className="bg-amber-500 hover:bg-amber-400 transition-all"
                      title={`Intermediate: ${d.intermediate}%`}
                    />
                    <div
                      style={{ width: `${d.susceptible}%` }}
                      className="bg-emerald-500 hover:bg-emerald-400 transition-all"
                      title={`Susceptible: ${d.susceptible}%`}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>Breakpoint: {d.clsiBreakpoint}</span>
                    <span>Assayed Isolates: {d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Markers */}
      {activeTab === "markers" && (
        <div className="space-y-3">
          <div className="p-3 bg-surface border border-surface-border rounded space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-2">
              <span className="font-semibold text-slate-100 text-xs">
                AMR DETERMINANTS & KEY TARGET MUTATIONS
              </span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400">Min Prevalence: {minPrevalence}%</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={minPrevalence}
                  onChange={(e) => setMinPrevalence(parseInt(e.target.value))}
                  className="w-24 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredMarkers.map((m) => (
                <div
                  key={m.gene}
                  className="p-2.5 bg-surface-chrome border border-surface-border rounded space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 text-xs">{m.gene}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        m.type === "PLASMID"
                          ? "bg-purple-950/80 border border-purple-500 text-purple-300"
                          : "bg-blue-950/80 border border-blue-500 text-blue-300"
                      }`}
                    >
                      {m.type}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400">{m.class}</div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Prevalence</span>
                      <span className="text-cyan-400 font-bold">{m.frequency}% ({m.isolates} isolates)</span>
                    </div>
                    <div className="w-full bg-surface h-1.5 rounded overflow-hidden">
                      <div
                        style={{ width: `${m.frequency}%` }}
                        className="bg-cyan-500 h-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
                    <span>Resistance Odds Ratio:</span>
                    <span className="text-amber-400 font-semibold">{m.oddsRatio}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Correlation Matrix */}
      {activeTab === "correlation" && (
        <div className="p-3 bg-surface border border-surface-border rounded space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-2">
            <div>
              <span className="font-semibold text-slate-100 text-xs">
                FEATURE CO-OCCURRENCE & RESISTANCE CORRELATION MATRIX
              </span>
              <p className="text-[10px] text-slate-400">
                Pairwise Pearson correlation coefficient (r) between genotype resistance markers and phenotype resistance.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-[10px] border-collapse">
              <thead>
                <tr className="bg-surface-chrome text-slate-400">
                  <th className="p-1.5 text-left">GENE \ DRUG</th>
                  <th className="p-1.5">CIPRO</th>
                  <th className="p-1.5">MERO</th>
                  <th className="p-1.5">CEFTRIAX</th>
                  <th className="p-1.5">GENTA</th>
                  <th className="p-1.5">COLISTIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {[
                  { gene: "blaKPC-2", cipro: 0.62, mero: 0.94, ceft: 0.89, genta: 0.45, coli: 0.14 },
                  { gene: "blaNDM-1", cipro: 0.71, mero: 0.97, ceft: 0.95, genta: 0.78, coli: 0.18 },
                  { gene: "gyrA_S83L", cipro: 0.92, mero: 0.44, ceft: 0.52, genta: 0.38, coli: 0.08 },
                  { gene: "parC_S80I", cipro: 0.89, mero: 0.41, ceft: 0.48, genta: 0.35, coli: 0.06 },
                  { gene: "armA", cipro: 0.58, mero: 0.68, ceft: 0.72, genta: 0.96, coli: 0.12 },
                  { gene: "mcr-1", cipro: 0.18, mero: 0.12, ceft: 0.22, genta: 0.15, coli: 0.88 }
                ].map((row) => (
                  <tr key={row.gene} className="hover:bg-surface-secondary/40">
                    <td className="p-1.5 text-left font-bold text-slate-200">{row.gene}</td>
                    {[row.cipro, row.mero, row.ceft, row.genta, row.coli].map((val, idx) => (
                      <td key={idx} className="p-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            val >= 0.85
                              ? "bg-red-950/80 text-red-300 border border-red-500/80"
                              : val >= 0.6
                              ? "bg-amber-950/80 text-amber-300 border border-amber-500/80"
                              : val >= 0.3
                              ? "bg-blue-950/80 text-blue-300 border border-blue-500/80"
                              : "bg-surface-chrome text-slate-500"
                          }`}
                        >
                          +{val.toFixed(2)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Parquet Explorer */}
      {activeTab === "parquet" && (
        <div className="p-3 bg-surface border border-surface-border rounded space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-2">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search parquet features..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="bg-surface-secondary border border-surface-border rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              {["ALL", "AMR_GENE", "SNP_MUTATION", "GENOMIC_METRIC"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    categoryFilter === cat
                      ? "bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold"
                      : "bg-surface-secondary text-slate-400 border border-surface-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-surface-chrome text-slate-400 text-[10px]">
                <tr>
                  <th className="py-1 px-2">FEATURE</th>
                  <th className="py-1 px-2">CATEGORY</th>
                  <th className="py-1 px-2">DTYPE</th>
                  <th className="py-1 px-2">NON-ZERO</th>
                  <th className="py-1 px-2">SPARSITY</th>
                  <th className="py-1 px-2">MEAN / STAT</th>
                  <th className="py-1 px-2">IMPORTANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {filteredFeatures.map((f) => (
                  <tr key={f.name} className="hover:bg-surface-secondary/40">
                    <td className="py-1 px-2 font-bold text-slate-200">{f.name}</td>
                    <td className="py-1 px-2 text-[10px] text-slate-400">
                      <span className="px-1 py-0.5 rounded bg-surface border border-surface-border">
                        {f.category}
                      </span>
                    </td>
                    <td className="py-1 px-2 text-slate-400 text-[10px]">{f.type}</td>
                    <td className="py-1 px-2 text-cyan-400">{f.nonZero}</td>
                    <td className="py-1 px-2 text-slate-300">{f.sparsity}</td>
                    <td className="py-1 px-2 text-slate-300">{f.mean}</td>
                    <td className="py-1 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-surface h-1.5 rounded overflow-hidden">
                          <div
                            style={{ width: `${f.importance * 100}%` }}
                            className="bg-emerald-500 h-full"
                          />
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {f.importance.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
