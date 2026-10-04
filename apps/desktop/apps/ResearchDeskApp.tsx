"use client";

import React, { useState } from "react";
import { BookOpen, Plus, ExternalLink, Bookmark } from "lucide-react";
import { useDesktopStore } from "../lib/store";

export function ResearchDeskApp() {
  const { openWindow } = useDesktopStore();
  const [sections, setSections] = useState([
    {
      title: "CORE RESEARCH QUESTIONS",
      items: [
        "Which specific point mutations in gyrA/parC drive high-level ciprofloxacin resistance in the active sample?",
        "Does blaNDM-1 co-occur with 16S rRNA methyltransferases (armA/rmtB) in the current BV-BRC cohort?"
      ]
    },
    {
      title: "WORKING HYPOTHESES",
      items: [
        "The active isolate demonstrates multi-drug resistance mediated by dual plasmid-borne beta-lactamases and quinolone target mutation.",
        "Calibrated logistic regression baseline maintains >0.90 AUROC on stratified holdout test partitions."
      ]
    },
    {
      title: "ACTIVE ISOLATES & BENCHMARKS",
      items: [
        "Select an isolate from the Sample Vault to populate this section",
        "Load a reference genome to begin comparative analysis"
      ]
    },
    {
      title: "LITERATURE REFERENCES",
      items: [
        "Feldgarden M, et al. Validating the AMRFinderPlus tool and database. Microb Genom. 2021.",
        "Goodhead DT. Initial events in cellular effects of ionising radiation. Int J Radiat Biol. 1994."
      ]
    }
  ]);

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-100">RESEARCH DESK // PERSISTENT SCIENTIFIC CONTEXT</span>
        </div>
        <span className="text-[10px] text-slate-400">PROJECT: AMR SURVEILLANCE 2026</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((sec, idx) => (
          <div key={idx} className="p-3 bg-surface border border-surface-border rounded space-y-2">
            <div className="flex items-center justify-between border-b border-surface-border pb-1">
              <span className="font-semibold text-emerald-400 text-[11px]">{sec.title}</span>
              <span className="text-[10px] text-slate-500">{sec.items.length} records</span>
            </div>
            <ul className="space-y-1.5">
              {sec.items.map((item, i) => (
                <li key={i} className="p-1.5 bg-surface-secondary border border-surface-border rounded text-[11px] text-slate-300 leading-relaxed flex items-start gap-1.5">
                  <Bookmark className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
