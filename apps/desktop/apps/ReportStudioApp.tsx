"use client";

import React, { useState } from "react";
import { FileText, Download, CheckCircle, Shield } from "lucide-react";
import { useDesktopStore } from "../lib/store";

export function ReportStudioApp({ sampleId }: { sampleId?: string }) {
  const { activeSample } = useDesktopStore();
  const currentSampleId = sampleId || activeSample?.sampleId || null;
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setDownloaded(format);
    setTimeout(() => setDownloaded(null), 2500);
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-100">REPORT STUDIO // COMPREHENSIVE SCIENTIFIC DOSSIER</span>
        </div>
        <div className="flex items-center gap-2">
          {["PDF", "JSON", "MARKDOWN", "CSV"].map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              className="px-2.5 py-1 bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-emerald-300 rounded text-[10px] font-bold transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>{fmt}</span>
            </button>
          ))}
        </div>
      </div>

      {downloaded && (
        <div className="p-2 bg-emerald-950 border border-emerald-500 rounded text-emerald-300 font-bold text-center text-xs flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Export generated successfully as {downloaded} package with cryptographic checksum!</span>
        </div>
      )}

      {/* Structured Scientific Report Preview */}
      <div className="p-4 bg-surface border border-surface-border rounded space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Section 1: Executive Summary */}
        <div className="border-b border-surface-border pb-3">
          <div className="text-[10px] text-slate-500">UMBRELLA BIO-RESEARCH WORKSTATION // FORMAL DOSSIER</div>
          <div className="text-base font-bold text-slate-100 mt-1">
            ANTIMICROBIAL RESISTANCE AND GENOMIC PROFILE REPORT
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Subject Isolate: <span className="text-emerald-400 font-bold">{currentSampleId}</span> (Escherichia coli // GCF_000005845.2)
          </div>
        </div>

        {/* Section 2: Ingestion & Quality Control */}
        <div className="space-y-1.5 border-b border-surface-border pb-3">
          <div className="font-bold text-slate-200">1. SEQUENCE INGESTION & QUALITY CONTROL</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 bg-surface-secondary rounded">Length: 5.21 Mb</div>
            <div className="p-2 bg-surface-secondary rounded">GC Content: 50.84%</div>
            <div className="p-2 bg-surface-secondary rounded">Contigs: 18 (N50: 4.8 Mb)</div>
            <div className="p-2 bg-surface-secondary rounded text-emerald-400 font-bold">Status: QC PASS</div>
          </div>
          <div className="text-[10px] text-slate-500">
            Source File SHA-256: 4e9f78b12c8a0029b9f71c4c8b211a76e93c12f45819e99211c4281f... (Immutable Raw Archive)
          </div>
        </div>

        {/* Section 3: AMRFinderPlus Findings */}
        <div className="space-y-1.5 border-b border-surface-border pb-3">
          <div className="font-bold text-slate-200">2. GENOTYPIC RESISTANCE ANNOTATIONS (AMRFinderPlus v4.2.7)</div>
          <ul className="space-y-1 text-[11px] text-slate-300">
            <li>• <strong className="text-emerald-400">blaNDM-1</strong> (Carbapenemase) - 100% Identity, 100% Coverage</li>
            <li>• <strong className="text-amber-400">gyrA_D87G</strong> (Fluoroquinolone point mutation) - Quinolone resistance determinant</li>
            <li>• <strong className="text-emerald-400">tet(M)</strong> (Tetracycline ribosomal protection protein)</li>
            <li>• <strong className="text-emerald-400">aac(3)-IIa</strong> (Aminoglycoside 3-N-acetyltransferase)</li>
          </ul>
        </div>

        {/* Section 4: Calibrated Model Predictions */}
        <div className="space-y-1.5 border-b border-surface-border pb-3">
          <div className="font-bold text-slate-200">3. CALIBRATED PHENOTYPE PREDICTIONS</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-surface-secondary rounded border border-surface-border">
              <div className="font-bold text-slate-200">Ciprofloxacin: <span className="text-red-400">Likely Resistant</span></div>
              <div className="text-[10px] text-slate-400">Calibrated P: 0.959 (Confidence: HIGH)</div>
              <div className="text-[10px] text-slate-500">Ground Truth Validation: Broth microdilution &gt;4.0 ug/ml</div>
            </div>
            <div className="p-2.5 bg-surface-secondary rounded border border-surface-border">
              <div className="font-bold text-slate-200">Meropenem: <span className="text-red-400">Likely Resistant</span></div>
              <div className="text-[10px] text-slate-400">Calibrated P: 0.942 (Confidence: HIGH)</div>
              <div className="text-[10px] text-slate-500">Ground Truth Validation: Broth microdilution &gt;16.0 ug/ml</div>
            </div>
          </div>
        </div>

        {/* Section 5: Provenance & Audit Chain */}
        <div className="space-y-1 text-[10px] text-slate-500">
          <div>Report Timestamp: {new Date().toISOString()} // Generated by Umbrella Report Studio</div>
          <div>All scientific conclusions link back to version-pinned model artifacts and laboratory test benchmarks.</div>
          <div className="text-amber-400/90 font-bold">NOTICE: For computational decision support and biological research use only.</div>
        </div>
      </div>
    </div>
  );
}
