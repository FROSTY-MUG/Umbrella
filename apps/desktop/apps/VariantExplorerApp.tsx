"use client";

import React, { useState } from "react";
import { Network, Share2, Layers, ExternalLink } from "lucide-react";
import { useDesktopStore } from "../lib/store";

export function VariantExplorerApp() {
  const { openWindow } = useDesktopStore();
  const [selectedNode, setSelectedNode] = useState<any>({
    id: "M2",
    label: "gyrA_D87G",
    type: "Mutation",
    samples: ["SMP-1827", "SMP-1828"],
    gene: "gyrA",
    evidence: "Curated / Observed in 184 cohort genomes",
    drugClass: "Fluoroquinolone"
  });

  const nodes = [
    { id: "S1", label: "SMP-1827", type: "Sample", x: 25, y: 35 },
    { id: "S2", label: "SMP-1828", type: "Sample", x: 45, y: 20 },
    { id: "S3", label: "SMP-1829", type: "Sample", x: 75, y: 30 },
    { id: "M1", label: "blaNDM-1", type: "Gene", x: 35, y: 65 },
    { id: "M2", label: "gyrA_D87G", type: "Mutation", x: 55, y: 70 },
    { id: "G1", label: "tet(M)", type: "Gene", x: 70, y: 60 }
  ];

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-100">VARIANT EXPLORER // COHORT RELATIONSHIP GRAPH</span>
        </div>
        <span className="text-[10px] text-slate-400">GRAPH-GUIDED VARIANT MATRIX</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Interactive Graph Surface (2 cols) */}
        <div className="md:col-span-2 p-3 bg-surface border border-surface-border rounded relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-bio-grid opacity-50 pointer-events-none" />

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-surface-border/80 stroke-1">
            <line x1="25%" y1="35%" x2="35%" y2="65%" strokeDasharray="3 3" />
            <line x1="25%" y1="35%" x2="55%" y2="70%" />
            <line x1="45%" y1="20%" x2="55%" y2="70%" />
            <line x1="75%" y1="30%" x2="70%" y2="60%" />
          </svg>

          {/* Node Elements */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() =>
                  setSelectedNode({
                    id: node.id,
                    label: node.label,
                    type: node.type,
                    samples: node.type === "Sample" ? [node.label] : ["SMP-1827", "SMP-1828"],
                    gene: node.type === "Mutation" ? "gyrA" : node.label,
                    evidence: "High-confidence laboratory evidence",
                    drugClass: "Multi-drug Resistance"
                  })
                }
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full border text-center transition-all ${
                  isSelected
                    ? "bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)] scale-110 z-10"
                    : node.type === "Sample"
                    ? "bg-surface-secondary border-cyan-500/70 text-cyan-300"
                    : "bg-surface border-surface-border text-slate-300 hover:border-slate-400"
                }`}
              >
                <div className="text-[10px] font-bold font-mono px-1">{node.label}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Node Details Pane */}
        <div className="p-3 bg-surface border border-surface-border rounded space-y-3">
          <div className="font-semibold text-slate-200 border-b border-surface-border pb-1">
            SELECTION DOSSIER
          </div>
          {selectedNode ? (
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-slate-500 text-[10px]">LABEL / TYPE:</span>
                <div className="font-bold text-emerald-400">
                  {selectedNode.label} ({selectedNode.type})
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">ASSOCIATED COHORT SAMPLES:</span>
                <div className="text-slate-200 mt-0.5">{selectedNode.samples.join(", ")}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">EVIDENCE STATUS:</span>
                <div className="text-slate-300 mt-0.5">{selectedNode.evidence}</div>
              </div>
              <div className="pt-2 border-t border-surface-border">
                <button
                  onClick={() => openWindow("mutation-lab")}
                  className="w-full py-1.5 bg-surface-secondary hover:bg-surface-tertiary border border-surface-border text-emerald-300 rounded flex items-center justify-center gap-1.5 transition-colors text-[10px]"
                >
                  <span>Open Variant in Mutation Lab</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">Click any node to inspect relationship data.</div>
          )}
        </div>
      </div>
    </div>
  );
}
