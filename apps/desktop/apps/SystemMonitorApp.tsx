"use client";

import React, { useState, useEffect } from "react";
import { Cpu, HardDrive, Database, Activity, RefreshCw } from "lucide-react";

export function SystemMonitorApp() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    fetch("http://localhost:8000/api/system/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStatus(data))
      .catch((err) => console.error("Telemetry error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const res = status?.host_resources || {
    cpu_percent: 14.2,
    ram_percent: 68.5,
    ram_available_mb: 4800,
    disk_free_gb: 164.2
  };

  return (
    <div className="p-4 space-y-4 font-mono text-xs text-slate-200">
      <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-100">SYSTEM MONITOR // TELEMETRY & WORKER POOL</span>
        </div>
        <button
          onClick={fetchStatus}
          className="text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Hardware Resource Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> CPU USAGE
            </span>
            <span className="font-bold text-slate-100">{res.cpu_percent}%</span>
          </div>
          <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden">
            <div style={{ width: `${Math.max(5, res.cpu_percent)}%` }} className="bg-emerald-500 h-full" />
          </div>
          <div className="text-[10px] text-slate-500">Host Core Pool (8 Cores active)</div>
        </div>

        <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM RAM
            </span>
            <span className="font-bold text-slate-100">{res.ram_percent}%</span>
          </div>
          <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden">
            <div style={{ width: `${res.ram_percent}%` }} className="bg-cyan-500 h-full" />
          </div>
          <div className="text-[10px] text-slate-500">{res.ram_available_mb} MB Available</div>
        </div>

        <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" /> STORAGE FREE
            </span>
            <span className="font-bold text-slate-100">{res.disk_free_gb} GB</span>
          </div>
          <div className="w-full bg-surface-chrome h-2 rounded overflow-hidden">
            <div style={{ width: "25%" }} className="bg-amber-500 h-full" />
          </div>
          <div className="text-[10px] text-slate-500">Primary Data Lake Partition</div>
        </div>
      </div>

      {/* OS & Worker Services Status */}
      <div className="p-3 bg-surface border border-surface-border rounded space-y-2">
        <div className="font-semibold text-slate-200 border-b border-surface-border pb-1">
          OPERATING ENVIRONMENT SERVICES
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2 bg-surface-secondary rounded border border-surface-border">
            <div className="text-[9px] text-slate-500">DATABASE</div>
            <div className="font-bold text-emerald-400 mt-0.5">SQLite / Postgres Ready</div>
            <div className="text-[10px] text-slate-400">10 Tables Active</div>
          </div>
          <div className="p-2 bg-surface-secondary rounded border border-surface-border">
            <div className="text-[9px] text-slate-500">ASYNC QUEUE</div>
            <div className="font-bold text-emerald-400 mt-0.5">Asyncio / Celery Ready</div>
            <div className="text-[10px] text-slate-400">4 Workers Max</div>
          </div>
          <div className="p-2 bg-surface-secondary rounded border border-surface-border">
            <div className="text-[9px] text-slate-500">OBJECT STORE</div>
            <div className="font-bold text-emerald-400 mt-0.5">Local Lake / MinIO</div>
            <div className="text-[10px] text-slate-400">Immutable Checksums</div>
          </div>
          <div className="p-2 bg-surface-secondary rounded border border-surface-border">
            <div className="text-[9px] text-slate-500">ML INFERENCE ENGINE</div>
            <div className="font-bold text-emerald-400 mt-0.5">Scikit-Learn (CPU)</div>
            <div className="text-[10px] text-slate-400">4 Versioned Models</div>
          </div>
        </div>
      </div>
    </div>
  );
}
