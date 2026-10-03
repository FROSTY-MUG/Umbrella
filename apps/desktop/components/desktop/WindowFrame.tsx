"use client";

import React, { useRef, useState, useEffect } from "react";
import { WindowState } from "../../types/desktop";
import { useDesktopStore } from "../../lib/store";
import { TitleBar } from "./TitleBar";

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export function WindowFrame({ window: win, children }: WindowFrameProps) {
  const { focusWindow, updatePosition, updateSize } = useDesktopStore();
  const frameRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Handle Dragging
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (win.maximized) return;
    focusWindow(win.id);
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - win.x,
      y: e.clientY - win.y
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 100, moveEvent.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 60, moveEvent.clientY - dragOffsetRef.current.y));
      updatePosition(win.id, newX, newY);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle 8-Direction Resizing
  const handleResizeMouseDown = (direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (win.maximized) return;
    focusWindow(win.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.width;
    const startH = win.height;
    const startPosX = win.x;
    const startPosY = win.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newW = startW;
      let newH = startH;
      let newX = startPosX;
      let newY = startPosY;

      if (direction.includes("e")) newW = Math.max(win.minWidth, startW + deltaX);
      if (direction.includes("s")) newH = Math.max(win.minHeight, startH + deltaY);
      if (direction.includes("w")) {
        const potentialW = startW - deltaX;
        if (potentialW >= win.minWidth) {
          newW = potentialW;
          newX = startPosX + deltaX;
        }
      }
      if (direction.includes("n")) {
        const potentialH = startH - deltaY;
        if (potentialH >= win.minHeight) {
          newH = potentialH;
          newY = startPosY + deltaY;
        }
      }

      updateSize(win.id, newW, newH);
      updatePosition(win.id, newX, newY);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (win.minimized) {
    return null;
  }

  const frameStyle: React.CSSProperties = win.maximized
    ? {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "calc(100vh - 40px)",
        zIndex: win.zIndex
      }
    : {
        position: "absolute",
        top: `${win.y}px`,
        left: `${win.x}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex
      };

  return (
    <div
      ref={frameRef}
      style={frameStyle}
      onMouseDown={() => focusWindow(win.id)}
      className={`flex flex-col bg-surface shadow-2xl overflow-hidden rounded border transition-colors ${
        win.focused
          ? "border-emerald-600/70 shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
          : "border-surface-border shadow-lg"
      }`}
    >
      {/* Window Title Bar */}
      <TitleBar window={win} onMouseDown={handleTitleMouseDown} />

      {/* Internal Scrollable Content Region */}
      <div className="flex-1 overflow-auto min-h-0 relative bg-surface-secondary/40">
        {children}
      </div>

      {/* Window Status Bar */}
      <div className="h-5 px-3 bg-surface-chrome border-t border-surface-border/50 text-[10px] font-mono text-slate-400 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span>STATUS: ONLINE</span>
          <span>// ENGINE: BIO-CORE</span>
        </div>
        <div>
          <span>Z: {win.zIndex}</span>
        </div>
      </div>

      {/* 8-Direction Transparent Resize Handles */}
      {!win.maximized && (
        <>
          <div
            onMouseDown={(e) => handleResizeMouseDown("n", e)}
            className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize z-20"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown("s", e)}
            className="absolute bottom-0 left-2 right-2 h-1.5 cursor-s-resize z-20"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown("w", e)}
            className="absolute top-2 bottom-2 left-0 w-1.5 cursor-w-resize z-20"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown("e", e)}
            className="absolute top-2 bottom-2 right-0 w-1.5 cursor-e-resize z-20"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown("nw", e)}
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-30"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown("ne", e)}
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-30"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown("sw", e)}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-30"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown("se", e)}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-30"
          />
        </>
      )}
    </div>
  );
}
