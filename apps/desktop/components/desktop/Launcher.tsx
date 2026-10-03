"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDesktopStore } from "../../lib/store";
import { Search, X, AppWindow, Sparkles } from "lucide-react";

export function Launcher() {
  const { launcherOpen, setLauncherOpen, installedApps, openWindow } = useDesktopStore();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (launcherOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [launcherOpen]);

  const filteredApps = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return installedApps;
    return installedApps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.acronym.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [search, installedApps]);

  if (!launcherOpen) return null;

  const handleLaunch = (appId: string) => {
    openWindow(appId);
    setLauncherOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] flex items-end justify-start p-4 pb-14"
      onClick={() => setLauncherOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-surface border border-surface-border shadow-2xl rounded-md overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Launcher Header & Search */}
        <div className="p-3 bg-surface-chrome border-b border-surface-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 bg-surface-secondary border border-surface-border rounded px-2.5 py-1.5 text-slate-200">
            <Search className="w-4 h-4 text-emerald-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search scientific applications, engines, models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs w-full focus:outline-none font-mono placeholder:text-slate-500"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
            Umbrella // Apps
          </span>
        </div>

        {/* Application Grid */}
        <div className="p-3 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-secondary/50">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleLaunch(app.id)}
              className="flex items-start gap-3 p-2.5 rounded bg-surface hover:bg-surface-tertiary border border-surface-border hover:border-emerald-600/60 text-left transition-all group"
            >
              {/* 42-48px Tile with Acronym */}
              <div className="w-11 h-11 rounded bg-surface-chrome border border-surface-border flex items-center justify-center font-mono font-bold text-sm text-emerald-400 group-hover:border-emerald-500 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.4)] flex-shrink-0 transition-all">
                {app.acronym}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-semibold text-slate-100 group-hover:text-emerald-300 truncate">
                    {app.name}
                  </div>
                  {app.isForge && (
                    <span className="text-[9px] px-1 bg-amber-950 text-amber-300 border border-amber-800 rounded font-mono">
                      FORGE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {app.description}
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-1 uppercase">
                  {app.category.replace("_", " ")}
                </div>
              </div>
            </button>
          ))}
          {filteredApps.length === 0 && (
            <div className="col-span-2 text-center py-8 text-xs font-mono text-slate-500">
              No scientific applications found matching &quot;{search}&quot;.
            </div>
          )}
        </div>

        {/* Launcher Footer */}
        <div className="p-2.5 bg-surface-chrome border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{installedApps.length} Applications Registered</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Umbrella Core v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
