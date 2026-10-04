"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Trash2,
  Link as LinkIcon,
  FlaskConical,
  Dna,
  ShieldAlert,
  ChevronRight,
  Filter
} from "lucide-react";
import { useDesktopStore } from "../lib/store";

interface Hypothesis {
  id: string;
  title: string;
  mechanism: string;
  status: "TESTING" | "VALIDATED" | "DISPROVEN" | "PENDING";
  confidence: number;
  linkedIsolates: string[];
  evidenceNotes: string;
  timestamp: string;
}

interface LabNote {
  id: string;
  category: "GENOMICS" | "PHENOTYPE" | "MIC_ASSAY" | "BIOINFORMATICS";
  content: string;
  timestamp: string;
}

interface Citation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  pmid: string;
  keyTakeaway: string;
}

const DEFAULT_HYPOTHESES: Hypothesis[] = [
  {
    id: "hyp-1",
    title: "Dual gyrA-S83L and parC-S80I substitutions mediate high-level ciprofloxacin resistance",
    mechanism: "Fluoroquinolone Target Alteration (QRDR)",
    status: "VALIDATED",
    confidence: 96,
    linkedIsolates: ["SAMN05216120", "SAMN05216124"],
    evidenceNotes: "Mutation Lab sequence diff confirms S83L in gyrA (TCG->TTG) and S80I in parC (AGC->ATC). MIC > 32 ug/mL.",
    timestamp: "2026-10-02 09:30"
  },
  {
    id: "hyp-2",
    title: "blaNDM-1 carbapenemase co-transfers on IncX3 conjugative plasmid with armA 16S methyltransferase",
    mechanism: "Metallo-beta-lactamase & Aminoglycoside Pan-Resistance",
    status: "TESTING",
    confidence: 84,
    linkedIsolates: ["SAMN05216120", "SAMN05216128"],
    evidenceNotes: "AMR Sentinel identified blaNDM-1 and armA within 12kb contig scaffold flanked by IS26 insertion sequences.",
    timestamp: "2026-10-03 14:15"
  },
  {
    id: "hyp-3",
    title: "mgrB disruption via IS5 element mediates acquired colistin heteroresistance in cohort",
    mechanism: "LPS Modification (Phosphoethanolamine addition via pmrAB/phoPQ)",
    status: "PENDING",
    confidence: 62,
    linkedIsolates: ["SAMN05216122"],
    evidenceNotes: "Awaiting Science Lab osmotic and cell-membrane stress assays under colistin gradient.",
    timestamp: "2026-10-04 11:00"
  }
];

const DEFAULT_LAB_NOTES: LabNote[] = [
  {
    id: "note-1",
    category: "GENOMICS",
    content: "Illumina NovaSeq PE150 reads assembled with Unicycler (v0.5.0). N50 exceeds 280kb with mean coverage depth of 78x.",
    timestamp: "2026-10-02 10:45"
  },
  {
    id: "note-2",
    category: "MIC_ASSAY",
    content: "Broth microdilution confirmed Meropenem MIC >= 16 ug/mL and Ciprofloxacin MIC >= 32 ug/mL under CLSI M100-ED34 guidelines.",
    timestamp: "2026-10-03 16:20"
  },
  {
    id: "note-3",
    category: "BIOINFORMATICS",
    content: "AMRFinderPlus v3.12 database sync complete. 120GB AMR dataset indexed with stratified 5-fold cross-validation split.",
    timestamp: "2026-10-04 08:30"
  }
];

const DEFAULT_CITATIONS: Citation[] = [
  {
    id: "cit-1",
    title: "Validating the AMRFinderPlus tool and curated database for antimicrobial resistance identification",
    authors: "Feldgarden M, Brover V, Gonzalez-Escalona N, et al.",
    journal: "Microbial Genomics",
    year: 2021,
    doi: "10.1099/mgen.0.000614",
    pmid: "34726593",
    keyTakeaway: "AMRFinderPlus achieves >98% sensitivity and specificity against curated bacterial resistomes."
  },
  {
    id: "cit-2",
    title: "Global burden of bacterial antimicrobial resistance in 2019: a systematic analysis",
    authors: "Antimicrobial Resistance Collaborators",
    journal: "The Lancet",
    year: 2022,
    doi: "10.1016/S0140-6736(21)02724-0",
    pmid: "35065702",
    keyTakeaway: "Comprehensive empirical baseline establishing 4.95 million deaths associated with bacterial AMR."
  },
  {
    id: "cit-3",
    title: "Initial events in and cellular consequences of ionizing radiation and biophysical DNA lesions",
    authors: "Goodhead DT.",
    journal: "International Journal of Radiation Biology",
    year: 1994,
    doi: "10.1080/09553009414550021",
    pmid: "8120610",
    keyTakeaway: "Mechanistic basis for clustered DNA double-strand breaks and biophysical LET damage thresholds."
  }
];

export function ResearchDeskApp() {
  const { openWindow, activeSample } = useDesktopStore();
  const [activeTab, setActiveTab] = useState<"hypotheses" | "notes" | "citations" | "export">("hypotheses");
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>(DEFAULT_HYPOTHESES);
  const [notes, setNotes] = useState<LabNote[]>(DEFAULT_LAB_NOTES);
  const [citations, setCitations] = useState<Citation[]>(DEFAULT_CITATIONS);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // New Hypothesis Form State
  const [showNewHyp, setShowNewHyp] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMech, setNewMech] = useState("");
  const [newConfidence, setNewConfidence] = useState(75);
  const [newNotes, setNewNotes] = useState("");

  // New Lab Note Form State
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<LabNote["category"]>("GENOMICS");

  // Status Badge Helper
  const getStatusBadge = (status: Hypothesis["status"]) => {
    switch (status) {
      case "VALIDATED":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 border border-emerald-500 text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> VALIDATED
          </span>
        );
      case "TESTING":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 border border-amber-500 text-amber-300">
            <Clock className="w-3 h-3 text-amber-400" /> TESTING
          </span>
        );
      case "DISPROVEN":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 border border-red-500 text-red-300">
            <XCircle className="w-3 h-3 text-red-400" /> DISPROVEN
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800/80 border border-slate-600 text-slate-300">
            <AlertCircle className="w-3 h-3 text-slate-400" /> PENDING
          </span>
        );
    }
  };

  const handleCreateHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const hyp: Hypothesis = {
      id: `hyp-${Date.now().toString(36)}`,
      title: newTitle.trim(),
      mechanism: newMech.trim() || "Unspecified Molecular Locus",
      status: "TESTING",
      confidence: newConfidence,
      linkedIsolates: activeSample ? [activeSample.sampleId] : ["SAMN05216120"],
      evidenceNotes: newNotes.trim() || "Observed during research desk inquiry.",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    setHypotheses([hyp, ...hypotheses]);
    setNewTitle("");
    setNewMech("");
    setNewNotes("");
    setShowNewHyp(false);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    const note: LabNote = {
      id: `note-${Date.now().toString(36)}`,
      category: newNoteCategory,
      content: newNoteContent.trim(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    setNotes([note, ...notes]);
    setNewNoteContent("");
  };

  const handleStatusChange = (id: string, newStatus: Hypothesis["status"]) => {
    setHypotheses(
      hypotheses.map((h) => (h.id === id ? { ...h, status: newStatus } : h))
    );
  };

  const handleDeleteHypothesis = (id: string) => {
    setHypotheses(hypotheses.filter((h) => h.id !== id));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const filteredHypotheses = hypotheses.filter((h) => {
    if (statusFilter === "ALL") return true;
    return h.status === statusFilter;
  });

  const exportMarkdown = () => {
    const md = `# UMBRELLA CORPORATION // RESEARCH DESK DOSSIER
PROJECT: AMR SURVEILLANCE & RESISTOME PROFILING 2026
DATE: ${new Date().toISOString()}
ACTIVE ISOLATE: ${activeSample ? `${activeSample.sampleId} (${activeSample.organism})` : "Global Panel Benchmark"}

---

## 1. WORKING SCIENTIFIC HYPOTHESES
${hypotheses
  .map(
    (h, idx) => `
### ${idx + 1}. ${h.title}
- **Status:** ${h.status}
- **Target Mechanism:** ${h.mechanism}
- **Model Confidence:** ${h.confidence}%
- **Linked Isolates:** ${h.linkedIsolates.join(", ")}
- **Evidence Dossier:** ${h.evidenceNotes}
- **Timestamp:** ${h.timestamp}
`
  )
  .join("\n")}

---

## 2. LAB OBSERVATIONS & AUDIT NOTES
${notes
  .map(
    (n) => `
- [${n.category}] (${n.timestamp}): ${n.content}
`
  )
  .join("")}

---

## 3. PRIMARY LITERATURE REFERENCES
${citations
  .map(
    (c) => `
- **${c.title}** (${c.year}) - *${c.journal}*
  DOI: https://doi.org/${c.doi} | PMID: ${c.pmid}
  Takeaway: ${c.keyTakeaway}
`
  )
  .join("")}
`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `UMBRELLA_RESEARCH_DOSSIER_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      {/* Top Banner */}
      <div className="p-3 bg-surface border border-surface-border rounded flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-500/70 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-wide">
                RESEARCH DESK // PERSISTENT SCIENTIFIC CONTEXT
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                ACTIVE WORKSPACE
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              PROJECT: AMR SURVEILLANCE & RESISTOME CHARACTERIZATION // BV-BRC 2026
            </div>
          </div>
        </div>

        {/* Quick Tools Launchers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openWindow("sample-vault")}
            className="px-2.5 py-1 rounded bg-surface-secondary border border-surface-border hover:border-emerald-500/50 hover:text-emerald-300 text-slate-300 text-[11px] flex items-center gap-1 transition-all"
            title="Open Sample Vault"
          >
            <Dna className="w-3 h-3 text-emerald-400" /> Vault
          </button>
          <button
            onClick={() => openWindow("amr-sentinel")}
            className="px-2.5 py-1 rounded bg-surface-secondary border border-surface-border hover:border-cyan-500/50 hover:text-cyan-300 text-slate-300 text-[11px] flex items-center gap-1 transition-all"
            title="Open AMR Sentinel"
          >
            <ShieldAlert className="w-3 h-3 text-cyan-400" /> Sentinel
          </button>
          <button
            onClick={() => openWindow("science-lab")}
            className="px-2.5 py-1 rounded bg-surface-secondary border border-surface-border hover:border-amber-500/50 hover:text-amber-300 text-slate-300 text-[11px] flex items-center gap-1 transition-all"
            title="Open Science Lab"
          >
            <FlaskConical className="w-3 h-3 text-amber-400" /> Science Lab
          </button>
        </div>
      </div>

      {/* Active Isolate Lock Context Strip */}
      <div className="p-2.5 bg-surface-chrome border border-surface-border rounded flex flex-wrap items-center justify-between text-[11px] gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">FOCAL ISOLATE:</span>
          {activeSample ? (
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 font-bold text-emerald-300">
              {activeSample.sampleId} // {activeSample.organism}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 italic">
              Global Multi-Cohort Panel (n=1,500)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span>HYPOTHESES: <strong className="text-slate-200">{hypotheses.length}</strong></span>
          <span>OBSERVATIONS: <strong className="text-slate-200">{notes.length}</strong></span>
          <span>CITATIONS: <strong className="text-slate-200">{citations.length}</strong></span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-surface-border text-[11px]">
        <button
          onClick={() => setActiveTab("hypotheses")}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "hypotheses"
              ? "border-emerald-400 text-emerald-300 bg-surface/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" /> Working Hypotheses ({hypotheses.length})
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "notes"
              ? "border-emerald-400 text-emerald-300 bg-surface/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Lab Notes & Logs ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab("citations")}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "citations"
              ? "border-emerald-400 text-emerald-300 bg-surface/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Literature Citations ({citations.length})
        </button>
        <button
          onClick={() => setActiveTab("export")}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "export"
              ? "border-emerald-400 text-emerald-300 bg-surface/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Download className="w-3.5 h-3.5" /> Dossier Export
        </button>
      </div>

      {/* Tab 1: Hypotheses */}
      {activeTab === "hypotheses" && (
        <div className="space-y-3">
          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[10px]">
              <Filter className="w-3 h-3 text-slate-400 mr-1" />
              {["ALL", "VALIDATED", "TESTING", "PENDING", "DISPROVEN"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    statusFilter === filter
                      ? "bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold"
                      : "bg-surface-secondary text-slate-400 hover:text-slate-200 border border-surface-border"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNewHyp(!showNewHyp)}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> New Hypothesis
            </button>
          </div>

          {/* New Hypothesis Collapsible Form */}
          {showNewHyp && (
            <form
              onSubmit={handleCreateHypothesis}
              className="p-3 bg-surface border border-emerald-500/50 rounded space-y-2.5 shadow-md"
            >
              <div className="font-semibold text-emerald-400 text-xs">
                PROPOSE NEW SCIENTIFIC HYPOTHESIS
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">HYPOTHESIS STATEMENT</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acquired point mutation in folP drives trimethoprim-sulfamethoxazole resistance..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-secondary border border-surface-border rounded px-2.5 py-1 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">TARGET MOLECULAR MECHANISM</label>
                  <input
                    type="text"
                    placeholder="e.g. Dihydrofolate Synthase Structural Remodeling"
                    value={newMech}
                    onChange={(e) => setNewMech(e.target.value)}
                    className="w-full bg-surface-secondary border border-surface-border rounded px-2.5 py-1 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>PRIOR CONFIDENCE ESTIMATE:</span>
                    <span className="text-emerald-400 font-bold">{newConfidence}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="99"
                    value={newConfidence}
                    onChange={(e) => setNewConfidence(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400">SUPPORTING OBSERVATIONS & CONTEXT</label>
                <textarea
                  rows={2}
                  placeholder="Reference initial sequencing reads, MIC observations, or phylogenetic clustering..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-surface-secondary border border-surface-border rounded px-2.5 py-1 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewHyp(false)}
                  className="px-2.5 py-1 rounded bg-surface-secondary border border-surface-border text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Hypothesis
                </button>
              </div>
            </form>
          )}

          {/* Hypotheses List */}
          <div className="space-y-2.5">
            {filteredHypotheses.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-surface-border rounded">
                No hypotheses match the selected status filter.
              </div>
            ) : (
              filteredHypotheses.map((hyp) => (
                <div
                  key={hyp.id}
                  className="p-3 bg-surface border border-surface-border hover:border-surface-border/90 rounded space-y-2 transition-all shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-[240px]">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(hyp.status)}
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {hyp.id} // {hyp.timestamp}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-100 text-xs leading-relaxed pt-1">
                        {hyp.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={hyp.status}
                        onChange={(e) =>
                          handleStatusChange(hyp.id, e.target.value as Hypothesis["status"])
                        }
                        className="bg-surface-secondary border border-surface-border rounded px-2 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="TESTING">Set: TESTING</option>
                        <option value="VALIDATED">Set: VALIDATED</option>
                        <option value="PENDING">Set: PENDING</option>
                        <option value="DISPROVEN">Set: DISPROVEN</option>
                      </select>
                      <button
                        onClick={() => handleDeleteHypothesis(hyp.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Delete hypothesis"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 bg-surface-secondary border border-surface-border rounded space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Target Molecular Locus
                      </div>
                      <div className="text-cyan-300 font-semibold">{hyp.mechanism}</div>
                    </div>

                    <div className="p-2 bg-surface-secondary border border-surface-border rounded space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Confidence Score</span>
                        <span className="text-emerald-400 font-bold">{hyp.confidence}%</span>
                      </div>
                      <div className="w-full bg-surface-chrome h-1.5 rounded overflow-hidden">
                        <div
                          style={{ width: `${hyp.confidence}%` }}
                          className={`h-full ${
                            hyp.confidence > 80
                              ? "bg-emerald-500"
                              : hyp.confidence > 50
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Evidence Notes */}
                  <div className="p-2 bg-surface-chrome border border-surface-border/60 rounded text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400 text-[10px] uppercase block mb-0.5">
                      Empirical Evidence:
                    </strong>
                    {hyp.evidenceNotes}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Lab Notes & Logs */}
      {activeTab === "notes" && (
        <div className="space-y-3">
          {/* Add note card */}
          <form
            onSubmit={handleCreateNote}
            className="p-3 bg-surface border border-surface-border rounded space-y-2 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-200 text-xs">RECORD LAB OBSERVATION</span>
              <div className="flex items-center gap-1.5">
                {(["GENOMICS", "PHENOTYPE", "MIC_ASSAY", "BIOINFORMATICS"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewNoteCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                      newNoteCategory === cat
                        ? "bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold"
                        : "bg-surface-secondary text-slate-400 border border-surface-border"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Log wet-lab assay observation, sequencing QC flag, or computational insight..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="flex-1 bg-surface-secondary border border-surface-border rounded px-2.5 py-1 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log Note
              </button>
            </div>
          </form>

          {/* Notes list */}
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-2.5 bg-surface border border-surface-border rounded flex items-start justify-between gap-2 text-[11px]"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950/80 border border-cyan-500/70 text-cyan-300">
                      [{note.category}]
                    </span>
                    <span className="text-[10px] text-slate-500">{note.timestamp}</span>
                  </div>
                  <div className="text-slate-200 leading-relaxed">{note.content}</div>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Literature Citations */}
      {activeTab === "citations" && (
        <div className="space-y-3">
          <div className="p-3 bg-surface border border-surface-border rounded space-y-1 text-xs">
            <span className="font-semibold text-emerald-400">CURATED PEER-REVIEWED CORPUS</span>
            <p className="text-[11px] text-slate-400">
              Verified bioinformatics and biophysical literature indexed for automated hypothesis cross-referencing.
            </p>
          </div>

          <div className="space-y-2.5">
            {citations.map((cit) => (
              <div
                key={cit.id}
                className="p-3 bg-surface border border-surface-border rounded space-y-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-100 text-xs flex-1">
                    {cit.title}
                  </h4>
                  <a
                    href={`https://doi.org/${cit.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] text-emerald-400 hover:underline"
                  >
                    DOI: {cit.doi} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-[10px] text-slate-400">
                  <span>{cit.authors}</span> // <em className="text-slate-300">{cit.journal}</em> ({cit.year}) // PMID: {cit.pmid}
                </div>

                <div className="p-2 bg-surface-secondary border border-surface-border rounded text-[11px] text-slate-300">
                  <strong className="text-emerald-400 text-[10px] uppercase block mb-0.5">
                    Scientific Takeaway:
                  </strong>
                  {cit.keyTakeaway}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Export Dossier */}
      {activeTab === "export" && (
        <div className="p-4 bg-surface border border-surface-border rounded space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-3">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">EXPORT RESEARCH DOSSIER</h3>
              <p className="text-[11px] text-slate-400">
                Generate an auditable, peer-review-ready markdown dossier containing active hypotheses, lab logs, and citations.
              </p>
            </div>
            <button
              onClick={exportMarkdown}
              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download Dossier (.md)
            </button>
          </div>

          <div className="p-3 bg-surface-chrome border border-surface-border rounded font-mono text-[10px] text-slate-300 max-h-64 overflow-y-auto space-y-2 whitespace-pre-wrap">
{`# UMBRELLA CORPORATION // RESEARCH DESK DOSSIER
PROJECT: AMR SURVEILLANCE & RESISTOME PROFILING 2026
ACTIVE HYPOTHESES: ${hypotheses.length} | LAB NOTES: ${notes.length} | CITATIONS: ${citations.length}

[STATUS SUMMARY]
- VALIDATED: ${hypotheses.filter((h) => h.status === "VALIDATED").length}
- TESTING: ${hypotheses.filter((h) => h.status === "TESTING").length}
- PENDING: ${hypotheses.filter((h) => h.status === "PENDING").length}
- DISPROVEN: ${hypotheses.filter((h) => h.status === "DISPROVEN").length}`}
          </div>
        </div>
      )}
    </div>
  );
}
