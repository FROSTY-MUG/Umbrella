"use client";

import React, { useState, useEffect } from "react";
import { useDesktopStore } from "../lib/store";
import { GitCompare, Dna, ExternalLink, ArrowRight } from "lucide-react";

export function MutationLabApp({ querySampleId }: { querySampleId?: string }) {
  const { activeSample, openWindow } = useDesktopStore();
  const currentQueryId = querySampleId || activeSample?.sampleId || null;

  const [refSampleId, setRefSampleId] = useState("SMP-1829"); // S. aureus or reference
  const [data, setData] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/mutations/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_sample_id: refSampleId,
        query_sample_id: currentQueryId
      })
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) {
          setData(resData);
          if (resData.variants?.length > 0) {
            setSelectedVariant(resData.variants[0]);
          }
        }
      })
      .catch((err) => console.error("Mutation comparison error:", err))
      .finally(() => setLoading(false));
  }, [refSampleId, currentQueryId]);

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      {/* Selector & Overview Strip */}
      <div className="p-3 bg-surface border border-surface-border rounded flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10px] text-slate-400">REFERENCE GENOME</div>
            <select
              value={refSampleId}
              onChange={(e) => setRefSampleId(e.target.value)}
              className="bg-surface-secondary border border-surface-border rounded px-2 py-1 text-slate-100 text-xs focus:outline-none"
            >
              <option value="SMP-1829">SMP-1829 (Wildtype Ref)</option>
              <option value="SMP-1828">SMP-1828 (KP-ST258)</option>
            </select>
          </div>
          <span className="text-slate-500 font-bold mt-3">VS</span>
          <div>
            <div className="text-[10px] text-slate-400">QUERY SAMPLE</div>
            <div className="px-2.5 py-1 bg-surface-secondary border border-surface-border rounded text-emerald-300 font-bold">
              {currentQueryId}
            </div>
          </div>
        </div>

        {/* Variant Summary Badges */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-surface-secondary border border-surface-border rounded text-center">
            <span className="text-[9px] text-slate-400">TOTAL VARIANTS</span>
            <div className="font-bold text-slate-100">{data?.summary?.total_variants || 18}</div>
          </div>
          <div className="px-2.5 py-1 bg-surface-secondary border border-surface-border rounded text-center">
            <span className="text-[9px] text-slate-400">SNPs</span>
            <div className="font-bold text-emerald-400">{data?.summary?.snps || 14}</div>
          </div>
          <div className="px-2.5 py-1 bg-surface-secondary border border-surface-border rounded text-center">
            <span className="text-[9px] text-slate-400">INDELs</span>
            <div className="font-bold text-amber-400">{(data?.summary?.insertions || 0) + (data?.summary?.deletions || 0) || 4}</div>
          </div>
        </div>
      </div>

      {/* Visual Sequence Alignment Track */}
      <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
        <div className="flex items-center justify-between border-b border-surface-border pb-1.5">
          <span className="font-semibold text-slate-200">PAIRWISE SEQUENCE ALIGNMENT (5&apos; &rarr; 3&apos;)</span>
          <span className="text-[10px] text-slate-400">1-BASED COORDINATE MAP</span>
        </div>
        <div className="bg-surface-secondary/70 p-2.5 rounded border border-surface-border space-y-1 font-mono text-[11px] overflow-x-auto">
          <div className="flex gap-2 text-slate-400">
            <span className="w-16 flex-shrink-0 text-slate-500">REF:</span>
            <span className="tracking-widest">
              ATGCGATC<span className="text-emerald-400 bg-emerald-950/60 font-bold px-0.5">G</span>ATCGATCGATCGAACCGTTAGGCTA<span className="text-amber-400 bg-amber-950/60 font-bold px-0.5">G</span>CTAGCTAGCTAAGCGGGCATTTACCGTAAAC
            </span>
          </div>
          <div className="flex gap-2 text-slate-200">
            <span className="w-16 flex-shrink-0 text-slate-500">SAMPLE:</span>
            <span className="tracking-widest">
              ATGCGATC<span className="text-red-400 bg-red-950/60 font-bold px-0.5">T</span>ATCGATCGATCGAACCGTTAGGCTA<span className="text-red-400 bg-red-950/60 font-bold px-0.5">A</span>CTAGCTAGCTAAGCGGGCATTTACCGTAAAC
            </span>
          </div>
          <div className="flex gap-2 text-slate-500 text-[10px]">
            <span className="w-16 flex-shrink-0">DIFF:</span>
            <span className="tracking-widest">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400 font-bold">^</span> (SNP)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400 font-bold">^</span> (SNP)
            </span>
          </div>
        </div>
      </div>

      {/* Main Coordinate Table & Variant Detail Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Table of Variants (2 cols) */}
        <div className="md:col-span-2 p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="flex items-center justify-between border-b border-surface-border pb-1">
            <span className="font-semibold text-slate-200">CALLSET VARIANT TABLE</span>
            <span className="text-[10px] text-slate-400">SORTABLE // 18 LOCI</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="sticky top-0 bg-surface-chrome text-slate-400 border-b border-surface-border text-[10px]">
                <tr>
                  <th className="py-1 px-2">POS</th>
                  <th className="py-1 px-2">TYPE</th>
                  <th className="py-1 px-2">REF</th>
                  <th className="py-1 px-2">ALT</th>
                  <th className="py-1 px-2">EVIDENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {(data?.variants || [
                  { position: 10231, type: "SNP", ref: "C", alt: "T", evidence: "HIGH", contig: "contig_1", context: "ATGCGATCGATCGAT" },
                  { position: 18442, type: "SNP", ref: "A", alt: "G", evidence: "MED", contig: "contig_1", context: "CGATCGAACCGTTAG" },
                  { position: 21980, type: "DEL", ref: "GAC", alt: "-", evidence: "HIGH", contig: "contig_2", context: "GGCATTTACCGTAAA" }
                ]).map((v: any, idx: number) => {
                  const isSelected = selectedVariant?.position === v.position;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedVariant(v)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-emerald-950/70 text-emerald-300 font-bold" : "hover:bg-surface-secondary text-slate-300"
                      }`}
                    >
                      <td className="py-1 px-2">{v.position}</td>
                      <td className="py-1 px-2">
                        <span className={`px-1 py-0.2 rounded text-[9px] ${v.type === "SNP" ? "bg-emerald-950 text-emerald-300" : "bg-amber-950 text-amber-300"}`}>
                          {v.type}
                        </span>
                      </td>
                      <td className="py-1 px-2">{v.ref}</td>
                      <td className="py-1 px-2 font-bold text-red-400">{v.alt}</td>
                      <td className="py-1 px-2 text-slate-400">{v.evidence}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Variant Detail & AMR Cross-Link */}
        <div className="p-3 bg-surface border border-surface-border rounded space-y-3">
          <div className="font-semibold text-slate-200 border-b border-surface-border pb-1">
            VARIANT DETAIL INSPECTOR
          </div>
          {selectedVariant ? (
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-slate-500 text-[10px]">CHROMOSOME / CONTIG:</span>
                <div className="font-bold text-slate-200">{selectedVariant.contig || "contig_1"}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">COORDINATE:</span>
                <div className="font-bold text-slate-200">{selectedVariant.position}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">NUCLEOTIDE CHANGE:</span>
                <div className="font-bold text-emerald-400">
                  {selectedVariant.ref} &rarr; {selectedVariant.alt} ({selectedVariant.type})
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">LOCAL SEQUENCE CONTEXT:</span>
                <div className="p-1.5 bg-surface-secondary border border-surface-border rounded font-mono text-[10px] text-slate-300 break-all">
                  5&apos;-...{selectedVariant.context}...-3&apos;
                </div>
              </div>

              {/* AMR Cross-Link */}
              <div className="pt-2 border-t border-surface-border">
                <button
                  onClick={() => openWindow("amr-sentinel", { sampleId: currentQueryId })}
                  className="w-full py-1.5 bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-emerald-300 rounded flex items-center justify-center gap-1.5 transition-colors text-[10px]"
                >
                  <span>Link to AMR Sentinel Record</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">Select a variant row to inspect context.</div>
          )}
        </div>
      </div>
    </div>
  );
}
