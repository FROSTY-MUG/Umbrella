"use client";

import React, { useState } from "react";
import { useDesktopStore } from "../../lib/store";
import { AppManifest } from "../../types/desktop";

export function DesktopIconGrid() {
  const { installedApps, openWindow } = useDesktopStore();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const handleIconClick = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    setSelectedAppId(appId);
  };

  const handleIconDoubleClick = (appId: string) => {
    openWindow(appId);
  };

  return (
    <div
      className="p-6 grid grid-flow-col grid-rows-6 gap-6 w-fit select-none z-0"
      onClick={() => setSelectedAppId(null)}
    >
      {installedApps.slice(0, 12).map((app) => {
        const isSelected = selectedAppId === app.id;
        return (
          <div
            key={app.id}
            onClick={(e) => handleIconClick(e, app.id)}
            onDoubleClick={() => handleIconDoubleClick(app.id)}
            className={`w-20 flex flex-col items-center gap-1.5 p-1.5 rounded cursor-pointer transition-colors ${
              isSelected ? "bg-emerald-950/40 border border-emerald-500/60" : "hover:bg-surface-secondary/40 border border-transparent"
            }`}
          >
            {/* 44px Square Icon with Acronym */}
            <div
              className={`w-11 h-11 rounded bg-surface border flex items-center justify-center font-mono font-bold text-xs shadow-md transition-all ${
                isSelected
                  ? "border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  : "border-surface-border text-emerald-400 hover:border-emerald-500/70"
              }`}
            >
              {app.acronym}
            </div>

            {/* Application Label */}
            <span className="text-[11px] font-mono text-center text-slate-200 tracking-wide line-clamp-2 leading-tight">
              {app.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
