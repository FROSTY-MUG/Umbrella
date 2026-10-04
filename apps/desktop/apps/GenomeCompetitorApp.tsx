"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Dna,
  Layers,
  ArrowRight,
  Download,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  FileText
} from "lucide-react";

interface CompetitorOrganism {
  id: string;
  name: string;
  type: string;
  target_proteins: string[];
  breakage_mechanisms: string;
  predicted_breakage_loci: string[];
  structural_impact_score: number;
  mutation_timeline: string;
  pdb_reference: string;
}

const DEFAULT_COMPETITORS: CompetitorOrganism[] = [
  {
    id: "COMP-BAC-01",
    name: "Escherichia coli K-12 MG1655",
    type: "Bacteria (Gram-negative)",
    target_proteins: ["Penicillin-Binding Protein 3 (PBP3/ftsI)", "DNA Gyrase Subunit A (gyrA)", "Outer Membrane Porin C (ompC)"],
    breakage_mechanisms: "Type II Topoisomerase inhibition and peptidoglycan crosslink disruption",
    predicted_breakage_loci: ["Chr:1,245,100 (gyrA quinolone pocket)", "Chr:2,014,890 (ftsI catalytic loop)"],
    structural_impact_score: 76.5,
    mutation_timeline: "Pre-mutation: high beta-lactam susceptibility; Post-mutation: BlaNDM acquisition induces periplasmic steric hindrance.",
    pdb_reference: "1KZN (Gyrase A-DNA complex)"
  },
  {
    id: "COMP-BAC-02",
    name: "Pseudomonas putida KT2440",
    type: "Bacteria (Environmental Model)",
    target_proteins: ["MexAB-OprM Efflux Pump", "Outer Membrane Protein F (oprF)", "Ribosomal Protein S12 (rpsL)"],
    breakage_mechanisms: "Aminoglycoside translation stall leading to truncated membrane stress polypeptides",
    predicted_breakage_loci: ["Chr:450,210 (16S rRNA A-site aminoglycoside pocket)", "Chr:3,180,450 (oprM channel constrict)"],
    structural_impact_score: 64.2,
    mutation_timeline: "Pre-mutation: active transport uptake; Post-mutation: MexAB upregulation reduces internal payload by 84%.",
    pdb_reference: "2V50 (MexAB-OprM cryo-EM)"
  },
  {
    id: "COMP-VIR-01",
    name: "Bacteriophage T4 (Myoviridae)",
    type: "Bacteriophage / Virus",
    target_proteins: ["OmpA Surface Receptor", "Lipopolysaccharide (LPS) Core", "Host DNA Endonuclease II"],
    breakage_mechanisms: "Hydroxymethylcytosine glucosylation causing host chromosomal shredding and injectosome translocation",
    predicted_breakage_loci: ["Chr:840,110 (LPS core synthesis rfa cluster)", "Chr:1,890,200 (Host restriction endonuclease EcoRI site)"],
    structural_impact_score: 92.4,
    mutation_timeline: "Pre-mutation: intact tail-fiber binding; Post-mutation: OmpA point mutation confers 100x phage adsorption resistance.",
    pdb_reference: "1YUE (Phage T4 Tail Needle)"
  },
  {
    id: "COMP-VIR-02",
    name: "Bacteriophage Lambda",
    type: "Bacteriophage / Temperate Virus",
    target_proteins: ["LamB Maltoporin Receptor", "Host RecA Recombinase", "Integration Host Factor (IHF)"],
    breakage_mechanisms: "Site-specific attB/attP lysogenic recombination inducing chromosomal segment displacement",
    predicted_breakage_loci: ["Chr:3,942,000 (attB primary integration locus)", "Chr:2,850,110 (RecA SOS regulatory hub)"],
    structural_impact_score: 81.0,
    mutation_timeline: "Pre-mutation: lysogenic prophage stability; Post-mutation: recA cleavage triggers lytic cascade.",
    pdb_reference: "1K4T (Lambda Integrase tetramer)"
  },
  {
    id: "COMP-FUN-01",
    name: "Saccharomyces cerevisiae (Model Yeast)",
    type: "Fungi / Eukaryote",
    target_proteins: ["14-alpha Demethylase (CYP51/ERG11)", "Beta-(1,3)-D-Glucan Synthase (FKS1)", "Tubulin Beta Chain (TUB2)"],
    breakage_mechanisms: "Ergosterol biosynthesis inhibition disrupting fungal lipid bilayer membrane fluidity",
    predicted_breakage_loci: ["ChrVIII:210,400 (ERG11 heme pocket)", "ChrXII:1,410,200 (FKS1 glucan synthase domain)"],
    structural_impact_score: 58.7,
    mutation_timeline: "Pre-mutation: high azole affinity; Post-mutation: ERG11 Y132F substitution reduces binding affinity 12-fold.",
    pdb_reference: "5V5Z (Yeast Erg11 complex)"
  }
];

export function GenomeCompetitorApp() {
  const [competitors, setCompetitors] = useState<CompetitorOrganism[]>(DEFAULT_COMPETITORS);
  const [selectedCompId, setSelectedCompId] = useState<string>("COMP-BAC-01");
  const [filterType, setFilterType] = useState<"ALL" | "BACTERIA" | "VIRUS" | "FUNGI">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sampleName, setSampleName] = useState("DS-SAMPLE-ALPHA-9");
  const [isExporting, setIsExporting] = useState(false);

  const activeComp = competitors.find((c) => c.id === selectedCompId) || competitors[0];

  const filteredCompetitors = competitors.filter((c) => {
    const matchesFilter =
      filterType === "ALL" ||
      (filterType === "BACTERIA" && c.type.toLowerCase().includes("bacteria")) ||
      (filterType === "VIRUS" && (c.type.toLowerCase().includes("virus") || c.type.toLowerCase().includes("phage"))) ||
      (filterType === "FUNGI" && c.type.toLowerCase().includes("fungi"));
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.breakage_mechanisms.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportJson = () => {
    setIsExporting(true);
    const exportData = {
      export_version: "2.5.0",
      timestamp: new Date().toISOString(),
      sample_analyzed: sampleName,
      competitor_evaluated: activeComp,
      disclaimer: "Computational prediction for research and education. Not for clinical intervention."
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sampleName}_vs_${activeComp.id}_competitor_audit.json`;
    a.click();
    setTimeout(() => setIsExporting(false), 1200);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0d0e] text-slate-200 font-mono text-xs select-none overflow-hidden">
      {/* Top Banner */}
      <div className="p-3 bg-[#0d1215] border-b border-white/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#f59e0b]/20 border border-[#f59e0b] text-[#f59e0b]">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              GENOME COMPETITOR // GM MULTI-ORGANISM COMPARISON MATRIX
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-black font-bold">
                SCIENCE SLAB EXTENSION
              </span>
            </div>
            <div className="text-[10px] text-neutral-400">
              Evaluates DS query sample against competitor bacteria, phages/viruses, and fungi for structural breakage loci
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? "Exporting Dossier..." : "Export Competitor Report (JSON/CSV)"}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Column: Competitor Strain Selector & Filters */}
        <div className="md:col-span-4 border-r border-white/15 p-3 flex flex-col gap-3 overflow-hidden bg-[#070a0b]">
          {/* Query Sample Badge */}
          <div className="p-2.5 rounded bg-[#12171a] border border-white/20">
            <span className="text-[9px] text-[#f59e0b] uppercase font-bold">QUERY DOUBLE-STRAND (DS) SAMPLE</span>
            <input
              type="text"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              className="w-full mt-1 px-2 py-1 bg-black border border-white/30 rounded text-xs text-white font-bold focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          {/* Filter Pills */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-black border border-white/20 rounded">
            {(["ALL", "BACTERIA", "VIRUS", "FUNGI"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`py-1 text-[10px] uppercase font-bold rounded transition-all ${
                  filterType === t ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search competitor strains or targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-black border border-white/20 rounded text-xs text-neutral-200 focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          {/* Competitor List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredCompetitors.map((comp) => {
              const isSelected = selectedCompId === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`p-2.5 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                      : "bg-[#0f1417] text-neutral-300 border-white/10 hover:border-white/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs line-clamp-1">{comp.name}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isSelected ? "bg-black text-white" : "bg-neutral-800 text-[#f59e0b]"}`}>
                      {comp.structural_impact_score}% DISRUPT
                    </span>
                  </div>
                  <div className={`text-[10px] ${isSelected ? "text-neutral-700" : "text-neutral-400"}`}>
                    {comp.type}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Disruption Analytics & Protein Target Map */}
        <div className="md:col-span-8 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[#0a0d0e]">
          {/* Header Card for Active Competitor */}
          <div className="p-4 rounded bg-[#0f1417] border border-white/20 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <span className="text-[10px] text-[#f59e0b] font-bold">COMPETITOR PROFILE // {activeComp.id}</span>
                <h2 className="text-sm font-bold text-white">{activeComp.name}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400">STRUCTURAL DISRUPTION RISK</span>
                <div className="text-lg font-bold text-[#f59e0b]">{activeComp.structural_impact_score}%</div>
              </div>
            </div>

            {/* Breakage Mechanism */}
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                PREDICTED BIOPHYSICAL BREAKAGE MECHANISM
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed bg-black/60 p-2.5 rounded border border-white/10">
                {activeComp.breakage_mechanisms}
              </p>
            </div>

            {/* Breakage Loci */}
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                PREDICTED CHROMOSOMAL BREAKAGE LOCI &amp; MOTIFS
              </span>
              <div className="space-y-1">
                {activeComp.predicted_breakage_loci.map((locus, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-black/40 border border-white/10 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                    <span className="text-[#f59e0b] font-bold">{locus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Targeted Protein Structures & Families */}
          <div className="p-4 rounded bg-[#0f1417] border border-white/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#f59e0b]" />
                TARGETED PROTEIN STRUCTURES &amp; CATALYTIC POCKETS
              </span>
              <span className="text-[10px] text-neutral-400">PDB: {activeComp.pdb_reference}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeComp.target_proteins.map((prot, idx) => (
                <div key={idx} className="p-2.5 rounded bg-black/60 border border-white/15 space-y-1">
                  <span className="text-[9px] text-[#f59e0b] font-bold">PROTEIN TARGET #{idx + 1}</span>
                  <div className="font-bold text-white text-xs">{prot}</div>
                  <div className="text-[9px] text-neutral-400">High affinity disruption pocket</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mutation Timeline Context (Before vs After Mutation Point) */}
          <div className="p-4 rounded bg-[#0f1417] border border-white/20 space-y-2">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              SCIENCE SLAB MUTATION TIMELINE CONTEXT
            </span>
            <div className="p-3 rounded bg-black/70 border border-white/15 text-xs text-neutral-300 leading-relaxed">
              {activeComp.mutation_timeline}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
