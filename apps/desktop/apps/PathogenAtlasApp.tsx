"use client";

import React, { useState } from "react";
import { FolderTree, Search, ExternalLink, Dna } from "lucide-react";
import { useDesktopStore } from "../lib/store";

export function PathogenAtlasApp() {
  const { openWindow } = useDesktopStore();
  const [selectedDomain, setSelectedDomain] = useState("bacteria");
  const [search, setSearch] = useState("");

  const organisms = [
    { name: "Escherichia coli", taxon: 562, domain: "bacteria", isolates: 5120, amr: "High density (NDM, TEM, CTX-M)", gc: "50.8%" },
    { name: "Klebsiella pneumoniae", taxon: 573, domain: "bacteria", isolates: 4350, amr: "Carbapenem-resistant (KPC, OXA)", gc: "57.2%" },
    { name: "Staphylococcus aureus", taxon: 1280, domain: "bacteria", isolates: 3800, amr: "MRSA (mecA, ermA)", gc: "32.8%" },
    { name: "Pseudomonas aeruginosa", taxon: 287, domain: "bacteria", isolates: 2150, amr: "Efflux pumps & metallo-beta-lactamases", gc: "66.5%" },
    { name: "Acinetobacter baumannii", taxon: 470, domain: "bacteria", isolates: 1840, amr: "OXA carbapenemases, armA", gc: "39.1%" },
    { name: "SARS-CoV-2", taxon: 2697049, domain: "viruses", isolates: 2800, amr: "Protease & polymerase escape variants", gc: "38.0%" },
    { name: "Influenza A", taxon: 11320, domain: "viruses", isolates: 1400, amr: "Neuraminidase inhibitor mutations", gc: "44.0%" },
    { name: "Candida auris", taxon: 498019, domain: "fungi", isolates: 850, amr: "Multi-class resistance (FKS1, ERG11)", gc: "45.3%" }
  ];

  const filtered = organisms.filter(
    (o) =>
      o.domain === selectedDomain &&
      (o.name.toLowerCase().includes(search.toLowerCase()) || o.amr.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      <div className="flex items-center justify-between p-3 bg-surface border border-surface-border rounded">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-100">PATHOGEN ATLAS // TAXONOMY & REFERENCE BROWSER</span>
        </div>
        <div className="flex gap-1.5">
          {["bacteria", "viruses", "fungi"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-2.5 py-1 rounded text-[11px] uppercase transition-colors ${
                selectedDomain === d
                  ? "bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold"
                  : "bg-surface-secondary text-slate-400 hover:text-slate-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2.5 bg-surface border border-surface-border rounded flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by organism name, taxon ID, or resistance markers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-xs w-full focus:outline-none text-slate-200 font-mono"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto">
        {filtered.map((org, i) => (
          <div key={i} className="p-3 bg-surface border border-surface-border rounded space-y-1.5 hover:border-emerald-600/70 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 italic">{org.name}</span>
              <span className="text-[10px] text-slate-500">Taxon: {org.taxon}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Corpus Count: <span className="text-cyan-400 font-bold">{org.isolates} Genomes</span> // GC: {org.gc}
            </div>
            <div className="text-[10px] text-amber-300/90 font-mono">
              Resistome profile: {org.amr}
            </div>
            <div className="pt-1.5 flex justify-end">
              <button
                onClick={() => openWindow("sample-vault")}
                className="flex items-center gap-1 text-[10px] text-emerald-400 hover:underline"
              >
                <span>View Isolates in Vault</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
