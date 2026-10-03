"use client";

import React from "react";
import { Minus, Square, Copy, X } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { useDesktopStore } from "../../lib/store";
import { WindowState } from "../../types/desktop";

interface TitleBarProps {
  window: WindowState;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function TitleBar({ window: win, onMouseDown }: TitleBarProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, restoreWindow } = useDesktopStore();

  const handleToggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (win.maximized) {
      restoreWindow(win.id);
    } else {
      maximizeWindow(win.id);
    }
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={handleToggleMaximize}
      className={`h-7 px-2.5 flex items-center justify-between border-b select-none cursor-move transition-colors ${
        win.focused
          ? "bg-surface-secondary border-surface-border text-slate-100"
          : "bg-surface-chrome border-surface-border/60 text-slate-400"
      }`}
    >
      {/* Left: App status dot + Title */}
      <div className="flex items-center gap-2 overflow-hidden pr-2">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            win.focused ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-slate-600"
          }`}
        />
        <span className="font-mono text-xs font-semibold tracking-wider truncate">
          {win.title}
        </span>
      </div>

      {/* Right: Window Controls */}
      <div
        className="flex items-center gap-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Tooltip content="Minimize" explanation="Hide window to taskbar">
          <button
            onClick={() => minimizeWindow(win.id)}
            aria-label="Minimize"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-tertiary text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
        </Tooltip>

        <Tooltip
          content={win.maximized ? "Restore Down" : "Maximize"}
          explanation="Toggle full work area"
        >
          <button
            onClick={handleToggleMaximize}
            aria-label={win.maximized ? "Restore Down" : "Maximize"}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-tertiary text-slate-400 hover:text-slate-200 transition-colors"
          >
            {win.maximized ? (
              <Copy className="w-2.5 h-2.5" />
            ) : (
              <Square className="w-2.5 h-2.5" />
            )}
          </button>
        </Tooltip>

        <Tooltip content="Close Window" explanation="Terminate application session">
          <button
            onClick={() => closeWindow(win.id)}
            aria-label="Close Window"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
