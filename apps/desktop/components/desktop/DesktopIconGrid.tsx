"use client";

import React, { useState } from "react";
import { useDesktopStore } from "../../lib/store";
import { AppManifest } from "../../types/desktop";

export function DesktopIconGrid() {
  const { installedApps, openWindow } = useDesktopStore();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const handleIconClick = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (selectedAppId === appId) {
      openWindow(appId);
    } else {
      setSelectedAppId(appId);
    }
  };

  const handleIconDoubleClick = (appId: string) => {
    openWindow(appId);
  };

  return (
    <div
      className="p-6 grid grid-flow-col grid-rows-6 gap-6 w-fit select-none z-0 max-h-[calc(100vh-80px)] overflow-hidden"
      onClick={() => setSelectedAppId(null)}
    >
      {installedApps.map((app) => {
        const isSelected = selectedAppId === app.id;
        return (
          <div
            key={app.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                openWindow(app.id);
              }
            }}
            onClick={(e) => handleIconClick(e, app.id)}
            onDoubleClick={() => handleIconDoubleClick(app.id)}
            className={`w-20 flex flex-col items-center gap-1.5 p-1.5 rounded cursor-pointer transition-all duration-150 group outline-none ${
              isSelected ? "bg-emerald-950/50 border border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]" : "hover:bg-surface-secondary/40 border border-transparent"
            }`}
          >
            {/* 44px Square Icon with Acronym */}
            <div
              className={`w-11 h-11 rounded bg-surface border flex items-center justify-center font-mono font-bold text-xs shadow-md transition-all ${
                isSelected
                  ? "border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-105"
                  : "border-surface-border text-emerald-400 group-hover:border-emerald-500/70 group-hover:scale-105"
              }`}
            >
              {app.acronym}
            </div>

            {/* Application Label */}
            <span className={`text-[11px] font-mono text-center tracking-wide line-clamp-2 leading-tight transition-colors ${
              isSelected ? "text-emerald-200 font-semibold" : "text-slate-200 group-hover:text-white"
            }`}>
              {app.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
