"use client";

import React, { useState, useEffect } from "react";
import { useDesktopStore } from "../lib/store";
import { Upload, CheckCircle2, AlertTriangle, Database, Dna, FileText } from "lucide-react";

export function SampleVaultApp() {
  const { activeSample, setActiveSample, openWindow } = useDesktopStore();
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(activeSample?.sampleId || null);
  const [uploading, setUploading] = useState(false);

  const fetchSamples = () => {
    fetch("http://localhost:8000/api/samples")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (data.length > 0) {
          setSamples(data);
          if (!selectedId) setSelectedId(data[0].sample_id);
        }
      })
      .catch((err) => console.error("Error fetching samples:", err));
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const handleRowClick = (s: any) => {
    setSelectedId(s.sample_id);
    setActiveSample({
      sampleId: s.sample_id,
      genomeId: s.genome_id,
      organism: s.organism,
      qcStatus: s.qc?.status || "PASS",
      totalBases: s.qc?.total_bases || 5210341
    });
  };

  const handleRowDoubleClick = (s: any) => {
    handleRowClick(s);
    openWindow("genome-analyzer", { sampleId: s.sample_id });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("organism", "Escherichia coli (Uploaded)");

    try {
      const res = await fetch("http://localhost:8000/api/samples/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const newSample = await res.json();
        fetchSamples();
        setSelectedId(newSample.sample_id);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const selectedSample = samples.find((s) => s.sample_id === selectedId) || samples[0];

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200 h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">SAMPLE VAULT // DATA LAKE REGISTRY</span>
          </div>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/80 text-emerald-300 font-bold cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "Ingesting..." : "Ingest FASTA"}</span>
            <input type="file" accept=".fna,.fasta,.fa" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Master Table and Snapshot Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Table (2 cols) */}
          <div className="md:col-span-2 p-3 bg-surface border border-surface-border rounded space-y-2">
            <div className="text-[10px] text-slate-400 border-b border-surface-border pb-1">
              DOUBLE-CLICK ROW TO OPEN IN GENOME ANALYZER // SINGLE CLICK TO SELECT
            </div>
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="sticky top-0 bg-surface-chrome text-slate-400 border-b border-surface-border text-[10px]">
                  <tr>
                    <th className="py-1 px-2">ID</th>
                    <th className="py-1 px-2">ORGANISM</th>
                    <th className="py-1 px-2">SOURCE</th>
                    <th className="py-1 px-2">QC</th>
                    <th className="py-1 px-2">AMR RISK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/40">
                  {samples.map((s) => {
                    const isSelected = selectedId === s.sample_id;
                    const qcStatus = s.qc?.status || "PASS";
                    const isHigh = s.organism.includes("coli") || s.organism.includes("Klebsiella");

                    return (
                      <tr
                        key={s.sample_id}
                        onClick={() => handleRowClick(s)}
                        onDoubleClick={() => handleRowDoubleClick(s)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-emerald-950/70 text-emerald-300 font-bold" : "hover:bg-surface-secondary text-slate-300"
                        }`}
                      >
                        <td className="py-2 px-2 font-bold">{s.sample_id}</td>
                        <td className="py-2 px-2 truncate max-w-[140px]">{s.organism}</td>
                        <td className="py-2 px-2 text-slate-400">BV-BRC</td>
                        <td className="py-2 px-2">
                          <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                            qcStatus === "PASS" ? "bg-emerald-950 text-emerald-300" : "bg-amber-950 text-amber-300"
                          }`}>
                            {qcStatus}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                            isHigh ? "bg-red-950 text-red-300" : "bg-emerald-950 text-emerald-300"
                          }`}>
                            {isHigh ? "HIGH" : "LOW"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Snapshot Inspector */}
          <div className="p-3.5 bg-surface border border-surface-border rounded space-y-3">
            <div className="font-semibold text-slate-200 border-b border-surface-border pb-1">
              SAMPLE SNAPSHOT
            </div>
            {selectedSample ? (
              <div className="space-y-2 text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px]">SELECTED IDENTITY:</span>
                  <div className="font-bold text-slate-100">{selectedSample.sample_id}</div>
                  <div className="text-[10px] text-slate-400">{selectedSample.organism}</div>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px]">ASSEMBLY SIZE:</span>
                  <div className="font-bold text-cyan-400">
                    {((selectedSample.qc?.total_bases || 5210341) / 1_000_000).toFixed(2)} Mb (GC: {selectedSample.qc?.gc_percent || 50.8}%)
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px]">FILE CHECKSUM (SHA-256):</span>
                  <div className="p-1 bg-surface-secondary border border-surface-border rounded text-[9px] font-mono text-slate-400 truncate">
                    {selectedSample.sequence_sha256}
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-border space-y-1.5">
                  <button
                    onClick={() => openWindow("genome-analyzer", { sampleId: selectedSample.sample_id })}
                    className="w-full py-1.5 bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-emerald-300 rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Dna className="w-3.5 h-3.5" />
                    <span>Open in Genome Analyzer</span>
                  </button>

                  <button
                    onClick={() => openWindow("report-studio", { sampleId: selectedSample.sample_id })}
                    className="w-full py-1.5 bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-slate-300 rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Full Dossier</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs">Select a sample to inspect snapshot.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
