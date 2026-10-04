"use client";

import React, { useState, useEffect } from "react";
import { useDesktopStore } from "../lib/store";
import { Dna, ShieldAlert, CheckCircle, ArrowRight, Play, FileDown } from "lucide-react";

export function GenomeAnalyzerApp({ sampleId }: { sampleId?: string }) {
  const { activeSample, openWindow, setActiveSample } = useDesktopStore();
  const currentSampleId = sampleId || activeSample?.sampleId || null;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/samples/${currentSampleId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((sampleData) => {
        if (sampleData) {
          setData(sampleData);
          setActiveSample({
            sampleId: sampleData.sample_id,
            genomeId: sampleData.genome_id,
            organism: sampleData.organism,
            qcStatus: sampleData.qc?.status || "PASS",
            totalBases: sampleData.qc?.total_bases || 5210341
          });
        }
      })
      .catch((err) => console.error("Error loading sample:", err))
      .finally(() => setLoading(false));
  }, [currentSampleId, setActiveSample]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full font-mono text-xs text-emerald-400">
        <span className="animate-pulse">Loading genomic metadata and assembly contigs...</span>
      </div>
    );
  }

  const qc = data?.qc || {
    total_bases: 5210341,
    gc_percent: 50.84,
    contig_count: 18,
    ambiguous_bases: 15,
    status: "PASS"
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      {/* Top Header / Sample Identity */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-surface border border-surface-border rounded gap-3">
        <div>
          <div className="text-slate-400 text-[10px]">ISOLATE ACCESSION</div>
          <div className="font-bold text-emerald-400 text-sm flex items-center gap-2">
            <span>{data?.organism || "Escherichia coli"}</span>
            <span className="text-slate-500 font-normal text-xs">({data?.genome_id || "511145.12"})</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded text-[11px] font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            QC {qc.status}
          </span>
          <span className="px-2 py-1 bg-surface-secondary border border-surface-border text-slate-300 rounded text-[11px]">
            {data?.sample_id || "No Sample Selected"}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="p-2.5 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400">GENOME LENGTH</div>
          <div className="text-sm font-bold text-slate-100 mt-1">
            {(qc.total_bases / 1_000_000).toFixed(2)} Mb
          </div>
        </div>
        <div className="p-2.5 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400">GC FRACTION</div>
          <div className="text-sm font-bold text-cyan-400 mt-1">
            {qc.gc_percent || (qc.gc_fraction * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-2.5 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400">CONTIG COUNT</div>
          <div className="text-sm font-bold text-slate-100 mt-1">
            {qc.contig_count}
          </div>
        </div>
        <div className="p-2.5 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400">AMBIGUOUS BASES</div>
          <div className="text-sm font-bold text-amber-400 mt-1">
            {qc.ambiguous_bases || 0} (N)
          </div>
        </div>
        <div className="p-2.5 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400">TAXON ID</div>
          <div className="text-sm font-bold text-slate-100 mt-1">
            {data?.taxon_id || 562}
          </div>
        </div>
      </div>

      {/* Sequence Viewport */}
      <div className="p-3 bg-surface border border-surface-border rounded">
        <div className="flex items-center justify-between border-b border-surface-border pb-2 mb-2">
          <span className="font-semibold text-slate-200">CONTIG BROWSER & SEQUENCE STREAM</span>
          <span className="text-[10px] text-slate-400">FORMAT: FASTA / NUCLEOTIDE</span>
        </div>
        <div className="space-y-1.5 max-h-44 overflow-y-auto font-mono text-[11px] text-slate-300">
          <div className="flex gap-2">
            <span className="text-emerald-400 font-semibold w-24 flex-shrink-0">contig_0001</span>
            <span className="truncate text-slate-400">ATGCGATCGATCGATCGATCGATCGATCGAACCGTTAGGCTAGCTAGCTAGCTAAGCGGGCATTTACCGTAAACCCGGTTAGCGATCGATCGTAGCTAGCTA...</span>
            <span className="text-slate-500 text-[10px] flex-shrink-0">4.82 Mb</span>
          </div>
          <div className="flex gap-2">
            <span className="text-emerald-400 font-semibold w-24 flex-shrink-0">contig_0002</span>
            <span className="truncate text-slate-400">GGCATTTACCGTAAACCCGGTTAGCGATCGATCGTAGCTAGCTAGCTAACCGTTAAGCTTTGACCTGAGGCTTAAAGCTCGATCGATCGTACGTAGCTAACGT...</span>
            <span className="text-slate-500 text-[10px] flex-shrink-0">284 kb</span>
          </div>
          <div className="flex gap-2">
            <span className="text-emerald-400 font-semibold w-24 flex-shrink-0">contig_0003</span>
            <span className="truncate text-slate-400">TTGACCTGAGGCTTAAAGCTCGATCGATCGTACGTAGCTAGCTAACGTTAGCTAGCTAGATGCGATCGATCGATCGATCGATCGATCGAACCGTTAGGCT...</span>
            <span className="text-slate-500 text-[10px] flex-shrink-0">106 kb</span>
          </div>
        </div>
      </div>

      {/* Cross-App Workflow Dispatcher */}
      <div className="p-3 bg-surface border border-surface-border rounded">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
          Downstream Scientific Pipelines (Preserves Sample Context)
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openWindow("amr-sentinel", { sampleId: currentSampleId })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950 border border-emerald-500/80 text-emerald-300 hover:bg-emerald-900 transition-colors"
          >
            <span>Analyze with AMR Sentinel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => openWindow("mutation-lab", { querySampleId: currentSampleId })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-secondary border border-surface-border text-slate-200 hover:bg-surface-tertiary transition-colors"
          >
            <span>Compare in Mutation Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => openWindow("sequence-qc", { sampleId: currentSampleId })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-secondary border border-surface-border text-slate-200 hover:bg-surface-tertiary transition-colors"
          >
            <span>Batch QC Distributions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => openWindow("report-studio", { sampleId: currentSampleId })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-secondary border border-surface-border text-slate-200 hover:bg-surface-tertiary transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
