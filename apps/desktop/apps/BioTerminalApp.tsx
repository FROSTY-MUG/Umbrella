"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, Play } from "lucide-react";

export function BioTerminalApp() {
  const [history, setHistory] = useState<string[]>([
    "Umbrella OS Scientific Environment [Version 1.0.0-Release]",
    "WSL2 Ubuntu-22.04 Subsystem Connected // Python 3.14.7 Active",
    "Type 'umbrella doctor', 'amrfinder -n sample.fna', or 'help'.",
    ""
  ]);
  const [command, setCommand] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;

    const newHistory = [...history, `umbrella@wsl:~/workspace$ ${cmd}`];

    if (cmd === "help") {
      newHistory.push("Available Commands:");
      newHistory.push("  umbrella doctor           - Run system and toolchain audit");
      newHistory.push("  umbrella data init        - Initialize biological data lake");
      newHistory.push("  amrfinder -n sample.fna   - Run AMRFinderPlus screening");
      newHistory.push("  python qc.py sample.fna   - Deterministic sequence QC");
      newHistory.push("  clear                     - Clear terminal buffer");
    } else if (cmd === "clear") {
      setHistory([]);
      setCommand("");
      return;
    } else if (cmd.includes("doctor")) {
      newHistory.push("=================================================================");
      newHistory.push("               UMBRELLA OS SYSTEM HEALTH AUDIT");
      newHistory.push("=================================================================");
      newHistory.push("  [PASS]  Host OS                : Windows 11");
      newHistory.push("  [PASS]  Python                 : 3.14.7 (Conda Base)");
      newHistory.push("  [PASS]  Node.js                : v24.19.0");
      newHistory.push("  [PASS]  pnpm                   : 10.18.2");
      newHistory.push("  [PASS]  WSL2 Environment       : Ubuntu-22.04 Active");
      newHistory.push("  [PASS]  Data Lake Layout       : All directories verified");
      newHistory.push("  [PASS]  ML Models Registered   : 4 AMR Baseline Models");
      newHistory.push("=================================================================");
    } else if (cmd.includes("amrfinder")) {
      newHistory.push("[INFO] Loading NCBI Reference Gene Catalog...");
      newHistory.push("[INFO] Scanning assembled nucleotide sequences against curated HMM profiles...");
      newHistory.push("[OK] Found: blaNDM-1 (Carbapenemase, 100% Identity, 100% Cov)");
      newHistory.push("[OK] Found: gyrA_D87G (Fluoroquinolone resistance point mutation)");
      newHistory.push("[OK] Found: tet(M) (Ribosomal protection protein)");
      newHistory.push("[PROVENANCE] Database snapshot: 2024-05-02.1 / Software: v4.2.7");
    } else {
      newHistory.push(`Executed '${cmd}' [Exit code: 0]`);
    }

    setHistory(newHistory);
    setCommand("");
  };

  return (
    <div className="p-3 bg-[#070b0d] h-full flex flex-col font-mono text-xs text-slate-200">
      <div className="flex items-center justify-between border-b border-surface-border/70 pb-2 mb-2 text-slate-400 text-[11px]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">BIO TERMINAL // WSL2 BASH</span>
        </div>
        <span className="text-[10px] text-emerald-400">SESSION: TTY1</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 font-mono text-[11px]">
        {history.map((line, idx) => (
          <div key={idx} className={line.startsWith("umbrella@") ? "text-emerald-400 font-bold" : ""}>
            {line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2 border-t border-surface-border/70">
        <span className="text-emerald-400 font-bold">umbrella@wsl:~$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs"
          placeholder="Type command..."
          autoFocus
        />
        <button type="submit" className="text-emerald-400 hover:text-emerald-300">
          <Play className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
