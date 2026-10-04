"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Cpu, Dna, Terminal, CheckCircle2 } from "lucide-react";

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootLogs = [
    "UMBRELLA BIOS 4.2.0 // KERNEL ARCHITECTURE x86_64",
    "INITIALIZING SECURE HARDWARE SECURITY MODULE (HSM)... [OK]",
    "MOUNTING BIO-COMPUTING SYSTEM & DUCKDB PARTITION ENGINE... [OK]",
    "LOADING RESISTANCE CLASSIFIERS & AMRFINDER DATABASE... [OK]",
    "ESTABLISHING CRYPTOGRAPHIC TLS 1.3 SECURE PERIMETER... [OK]",
    "SYSTEM VERIFIED: ALL SUBSYSTEMS NOMINAL"
  ];

  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < bootLogs.length) {
        setLogs((prev) => [...prev, bootLogs[currentIdx]]);
        setProgress(Math.round(((currentIdx + 1) / bootLogs.length) * 100));
        currentIdx++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#06090a] text-emerald-400 font-mono flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-lg space-y-6">
        {/* Umbrella Corporate Geometric Emblem */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 3" />
              <polygon points="50,50 50,8 80,20" fill="#ffffff" />
              <polygon points="50,50 80,20 92,50" fill="#0a0d0e" stroke="#ffffff" strokeWidth="1" />
              <polygon points="50,50 92,50 80,80" fill="#f59e0b" />
              <polygon points="50,50 80,80 50,92" fill="#0a0d0e" stroke="#ffffff" strokeWidth="1" />
              <polygon points="50,50 50,92 20,80" fill="#ffffff" />
              <polygon points="50,50 20,80 8,50" fill="#0a0d0e" stroke="#ffffff" strokeWidth="1" />
              <polygon points="50,50 8,50 20,20" fill="#f59e0b" />
              <polygon points="50,50 20,20 50,8" fill="#0a0d0e" stroke="#ffffff" strokeWidth="1" />
              <circle cx="50" cy="50" r="10" fill="#0a0d0e" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="50" cy="50" r="4" fill="#ffffff" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-sm font-bold tracking-[0.3em] text-white uppercase">
            UMBRELLA CORPORATION
          </h1>
          <p className="text-[10px] tracking-widest text-[#f59e0b] mt-1">
            BIO-SECURITY WORKSTATION OS // INITIALIZING BOOTSTRAP
          </p>
        </div>

        {/* Boot Terminal Box */}
        <div className="bg-[#0b0f12] border border-white/20 rounded p-4 text-[11px] h-44 overflow-y-auto space-y-1 shadow-[0_0_25px_rgba(0,0,0,0.8)]">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-neutral-500">{`>`}</span>
              <span className={i === logs.length - 1 ? "text-emerald-300 font-semibold" : "text-neutral-400"}>
                {log}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-neutral-400">
            <span>STARTING SYSTEM SHELL</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-[#f59e0b] to-white"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>
        </div>

        {/* Skip button */}
        <div className="text-center pt-2">
          <button
            onClick={onComplete}
            className="text-[10px] text-neutral-500 hover:text-white underline tracking-wider"
          >
            [ESC / CLICK TO BYPASS BOOT]
          </button>
        </div>
      </div>
    </div>
  );
}
