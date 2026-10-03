"use client";

import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  shortcut?: string;
  explanation?: string;
  children: React.ReactNode;
  delayMs?: number;
}

export function Tooltip({
  content,
  shortcut,
  explanation,
  children,
  delayMs = 450
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none whitespace-nowrap bg-surface-secondary border border-surface-border text-slate-200 text-xs px-2.5 py-1.5 shadow-2xl rounded">
          <div className="flex items-center gap-1.5 font-medium">
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1 py-0.5 text-[10px] bg-surface-tertiary border border-surface-border text-slate-400 rounded">
                {shortcut}
              </kbd>
            )}
          </div>
          {explanation && (
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-xs whitespace-normal">
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
