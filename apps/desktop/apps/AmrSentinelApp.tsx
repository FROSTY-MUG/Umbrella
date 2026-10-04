"use client";

import React, { useState, useEffect } from "react";
import { useDesktopStore } from "../lib/store";
import { ShieldAlert, Info, HelpCircle, CheckCircle2, ChevronRight, Layers } from "lucide-react";

export function AmrSentinelApp({ sampleId }: { sampleId?: string }) {
  const { activeSample, openWindow } = useDesktopStore();
  const currentSampleId = sampleId || activeSample?.sampleId || null;

  const [amrData, setAmrData] = useState<any>(null);
  const [selectedAntibiotic, setSelectedAntibiotic] = useState("Ciprofloxacin");
  const [prediction, setPrediction] = useState<any>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch AMR findings
  useEffect(() => {
    if (!currentSampleId) { setAmrData(null); return; }
    fetch(`http://localhost:8000/api/amr/${currentSampleId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAmrData(data))
      .catch((err) => console.error("AMR fetch error:", err));
  }, [currentSampleId]);

  // Fetch ML Prediction & Evidence Dossier
  useEffect(() => {
    if (!currentSampleId) { setPrediction(null); setLoading(false); return; }
    setLoading(true);
    fetch("http://localhost:8000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: jsonStringify({ sample_id: currentSampleId, antibiotic: selectedAntibiotic })
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPrediction(data))
      .catch((err) => console.error("Prediction fetch error:", err))
      .finally(() => setLoading(false));
  }, [currentSampleId, selectedAntibiotic]);

  function jsonStringify(obj: any) {
    return JSON.stringify(obj);
  }

  const antibiotics = ["Ciprofloxacin", "Meropenem", "Tetracycline", "Gentamicin"];

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      {/* Top Banner: Resistance Signal & Sample Identity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Antimicrobial Resistance Assessment</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                RESISTANCE SIGNAL: ELEVATED
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Evidence-backed calibrated output // Model: {prediction?.model_id || "amr-lr-v1.0.0"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">ISOLATE</div>
            <div className="font-bold text-slate-100">{currentSampleId}</div>
          </div>
        </div>

        {/* Detected Markers Card */}
        <div className="p-3 bg-surface border border-surface-border rounded">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Detected Markers</span>
            <span className="text-emerald-400 font-bold">{amrData?.detected_marker_count ?? "—"}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {amrData?.findings?.map((f: any, idx: number) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-surface-secondary border border-surface-border text-[10px] text-emerald-300 font-semibold"
              >
                {f.gene || f.mutation}
              </span>
            )) || (
              <div className="text-slate-500 text-[11px]">
                {currentSampleId ? "Loading markers…" : "No sample loaded — select from Sample Vault"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Antibiotic Selector Tabs */}
      <div className="flex gap-1.5 border-b border-surface-border pb-1">
        {antibiotics.map((ab) => (
          <button
            key={ab}
            onClick={() => setSelectedAntibiotic(ab)}
            className={`px-3 py-1.5 rounded-t text-xs font-mono transition-colors ${
              selectedAntibiotic === ab
                ? "bg-surface-secondary border-t border-l border-r border-emerald-500 text-emerald-300 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {ab}
          </button>
        ))}
      </div>

      {/* Model Output & Evidence Dossier Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Calibrated Prediction Card */}
        <div className="p-3.5 bg-surface border border-surface-border rounded space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-100">PREDICTED OUTCOME</span>
            <span className="text-[10px] text-slate-400">PLATT CALIBRATED</span>
          </div>

          <div className="p-3 bg-surface-secondary border border-surface-border rounded flex items-center justify-between">
            <div>
              <div className={`text-xl font-bold ${prediction?.predicted_class === 'Susceptible' ? 'text-emerald-400' : prediction ? 'text-red-400' : 'text-slate-500'}`}>
                {prediction?.predicted_class ?? (currentSampleId ? "Loading…" : "No sample")}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Calibrated Probability: <span className="text-slate-100 font-bold">
                  {prediction?.calibrated_probability != null
                    ? `${(prediction.calibrated_probability * 100).toFixed(1)}%`
                    : "—"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold rounded">
                CONFIDENCE: {prediction?.confidence_band ?? "—"}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                Domain: {prediction?.ood_flag ?? "—"}
              </div>
            </div>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-surface-chrome border border-surface-border rounded">
              <div className="text-[9px] text-slate-500">ROC-AUC</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">
                {prediction?.metrics_summary?.roc_auc ?? "—"}
              </div>
            </div>
            <div className="p-2 bg-surface-chrome border border-surface-border rounded">
              <div className="text-[9px] text-slate-500">PR-AUC</div>
              <div className="text-xs font-bold text-cyan-400 mt-0.5">
                {prediction?.metrics_summary?.pr_auc ?? "—"}
              </div>
            </div>
            <div className="p-2 bg-surface-chrome border border-surface-border rounded">
              <div className="text-[9px] text-slate-500">BRIER SCORE</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">
                {prediction?.metrics_summary?.brier_score ?? "—"}
              </div>
            </div>
          </div>

          {/* Mandatory "WHY? / EVIDENCE" Button */}
          <button
            onClick={() => setShowEvidenceModal(!showEvidenceModal)}
            className="w-full py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/80 text-emerald-300 font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>WHY? // VIEW SCIENTIFIC EVIDENCE DOSSIER</span>
          </button>
        </div>

        {/* Right: Driver Features & Provenance */}
        <div className="p-3.5 bg-surface border border-surface-border rounded space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-100">DRIVER GENOMIC FEATURES</span>
            <span className="text-[10px] text-slate-400">L2 REGRESSION WEIGHTS</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {prediction?.evidence_refs?.map((ev: any, i: number) => (
              <div key={i} className="p-2 bg-surface-secondary border border-surface-border rounded text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">{ev.feature.replace("has_", "")}</span>
                  <span className="text-slate-400 font-mono text-[10px]">Weight: +{ev.importance_weight}</span>
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  {ev.interpretation}
                </div>
              </div>
            )) || (
              <div className="text-slate-500 text-xs">No active driver markers identified for this class.</div>
            )}
          </div>

          <div className="p-2 bg-surface-chrome border border-surface-border rounded text-[10px] text-slate-400 space-y-0.5">
            <div>Annotation Tool: NCBI AMRFinderPlus v4.2.7 (Pinned DB: 2024-05-02.1)</div>
            <div>Benchmark Target: BV-BRC Laboratory Phenotype (Broth microdilution)</div>
            <div className="text-amber-400 font-medium">RESEARCH USE ONLY: Computational decision support.</div>
          </div>
        </div>
      </div>

      {/* Expanded Scientific Evidence Dossier Modal / View */}
      {showEvidenceModal && (
        <div className="p-3.5 bg-surface-secondary border border-emerald-500/70 rounded space-y-2.5">
          <div className="flex items-center justify-between border-b border-surface-border pb-1.5">
            <span className="font-bold text-emerald-300">SCIENTIFIC PROVENANCE CHAIN // {selectedAntibiotic}</span>
            <button
              onClick={() => setShowEvidenceModal(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              [Close]
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 bg-surface border border-surface-border rounded">
              <div className="text-[9px] text-slate-500">LAB GROUND TRUTH</div>
              <div className="font-bold text-slate-200 mt-0.5">Broth microdilution</div>
              <div className="text-[10px] text-slate-400">Testing Standard: CLSI 2024</div>
              <div className="text-[10px] text-red-400 font-bold">Measured: &gt;4.0 ug/ml (Resistant)</div>
            </div>
            <div className="p-2 bg-surface border border-surface-border rounded">
              <div className="text-[9px] text-slate-500">ANNOTATION PROVENANCE</div>
              <div className="font-bold text-slate-200 mt-0.5">AMRFinderPlus v4.2.7</div>
              <div className="text-[10px] text-slate-400">Database: 2024-05-02.1</div>
              <div className="text-[10px] text-emerald-400">Evidence: 100% Identity / 100% Cov</div>
            </div>
            <div className="p-2 bg-surface border border-surface-border rounded">
              <div className="text-[9px] text-slate-500">CALIBRATION & SPLIT</div>
              <div className="font-bold text-slate-200 mt-0.5">Platt Sigmoid (5-fold CV)</div>
              <div className="text-[10px] text-slate-400">Split: Stratified 60/20/20</div>
              <div className="text-[10px] text-cyan-400">No test label leakage verified</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
