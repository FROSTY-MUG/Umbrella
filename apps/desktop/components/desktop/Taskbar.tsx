"use client";

import React, { useState, useEffect } from "react";
import { useDesktopStore } from "../../lib/store";
import { Tooltip } from "../ui/Tooltip";
import { Terminal, Shield, Cpu, Sparkles, Layers } from "lucide-react";

export function Taskbar() {
  const {
    windows,
    activeWindowId,
    launcherOpen,
    toggleLauncher,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    openWindow,
    minimizeAll
  } = useDesktopStore();

  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWindowClick = (winId: string, minimized: boolean, isFocused: boolean) => {
    if (minimized) {
      restoreWindow(winId);
    } else if (isFocused) {
      minimizeWindow(winId);
    } else {
      focusWindow(winId);
    }
  };

  return (
    <footer className="h-10 bg-surface-chrome border-t border-surface-border/80 flex items-center justify-between px-2 select-none z-50 fixed bottom-0 left-0 right-0">
      {/* Left: Start Launcher & Quick Launch */}
      <div className="flex items-center gap-2">
        <Tooltip content="Umbrella Launcher" shortcut="Win / Alt+Space" explanation="Open scientific application directory">
          <button
            onClick={toggleLauncher}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              launcherOpen
                ? "bg-emerald-600 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                : "bg-surface-secondary border border-surface-border text-emerald-400 hover:bg-surface-tertiary"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>UMBRELLA</span>
          </button>
        </Tooltip>

        {/* Running Windows Taskbar Tabs */}
        <div className="flex items-center gap-1.5 ml-2 overflow-x-auto max-w-2xl py-0.5">
          {windows.map((win) => {
            const isFocused = win.id === activeWindowId && !win.minimized;
            return (
              <button
                key={win.id}
                onClick={() => handleWindowClick(win.id, win.minimized, isFocused)}
                className={`flex items-center gap-2 px-2.5 py-1 text-xs font-mono rounded border transition-colors truncate max-w-[170px] ${
                  isFocused
                    ? "bg-surface-tertiary border-emerald-500/80 text-emerald-300"
                    : win.minimized
                    ? "bg-surface-secondary/40 border-surface-border/40 text-slate-400"
                    : "bg-surface-secondary border-surface-border text-slate-200 hover:bg-surface-tertiary"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isFocused ? "bg-emerald-400" : win.minimized ? "bg-slate-600" : "bg-emerald-700"
                  }`}
                />
                <span className="truncate">{win.title.split("//")[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Vella, System Tray & Clock */}
      <div className="flex items-center gap-3">
        <Tooltip content="Launch Vella AI" explanation="System-wide natural-language scientific orchestrator">
          <button
            onClick={() => openWindow("vella")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-secondary border border-surface-border text-xs font-mono text-cyan-400 hover:bg-surface-tertiary transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>VELLA</span>
          </button>
        </Tooltip>

        <Tooltip content="Umbrella Forge" explanation="Self-building application compiler">
          <button
            onClick={() => openWindow("umbrella-forge")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-secondary border border-surface-border text-xs font-mono text-amber-400 hover:bg-surface-tertiary transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>FORGE</span>
          </button>
        </Tooltip>

        {/* System Badges */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400 border-l border-surface-border pl-3">
          <span className="flex items-center gap-1 text-slate-300">
            <Terminal className="w-3 h-3 text-emerald-500" />
            <span>WSL2</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3 h-3" />
            <span>SECURE</span>
          </span>
        </div>

        {/* Clock */}
        <div className="font-mono text-xs text-slate-200 tracking-wider pl-2 border-l border-surface-border">
          {time || "00:00:00"}
        </div>

        {/* Minimize All */}
        <Tooltip content="Minimize All Windows" explanation="Toggle desktop workspace">
          <button
            onClick={minimizeAll}
            className="w-2.5 h-6 bg-surface-border/60 hover:bg-emerald-500/80 rounded-sm ml-1 transition-colors"
            aria-label="Show Desktop"
          />
        </Tooltip>
      </div>
    </footer>
  );
}
