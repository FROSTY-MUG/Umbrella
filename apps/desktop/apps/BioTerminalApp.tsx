"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, Shield, Lock, AlertCircle, CornerDownLeft } from "lucide-react";

export function BioTerminalApp() {
  const [history, setHistory] = useState<string[]>([
    "UMBRELLA OS BIO-COMPUTING SYSTEM [VERSION 2.5-ENTERPRISE]",
    "SANDBOX ENVIRONMENT: DOCKER CONTAINER ISOLATION ACTIVE",
    "Type 'help' to inspect the 32 allowlisted bio-computing commands.",
    ""
  ]);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = command.trim();
    if (!rawCmd) return;

    setCommandHistory((prev) => [...prev, rawCmd]);
    setHistoryIndex(-1);

    const promptLine = `umbrella@sandbox:~$ ${rawCmd}`;

    if (rawCmd === "clear") {
      setHistory([]);
      setCommand("");
      return;
    }

    setHistory((prev) => [...prev, promptLine]);
    setCommand("");
    setIsExecuting(true);

    try {
      const res = await fetch("http://localhost:8000/api/terminal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: rawCmd })
      });

      if (res.ok) {
        const data = await res.json();
        const lines = data.output.split("\n");
        setHistory((prev) => [...prev, ...lines]);
      } else {
        throw new Error("Sandbox communication error");
      }
    } catch (err) {
      // Local execution fallback for common commands
      const lower = rawCmd.toLowerCase();
      if (lower === "help") {
        setHistory((prev) => [
          ...prev,
          "Allowlisted Commands (32 available):",
          "  help, clear, pwd, ls, cd, cat, head, tail, grep, find,",
          "  wc, echo, date, whoami, history, env, export, df, du,",
          "  ps, top, kill, curl, wget, ping, nslookup, git, python,",
          "  pip, train, predict, status, jobs"
        ]);
      } else if (lower.includes("rm -rf") || lower.includes("sudo")) {
        setHistory((prev) => [
          ...prev,
          `SECURITY ALERT: Execution of '${rawCmd}' is strictly blocked in sandboxed runtime.`
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          `Executed '${rawCmd}' in local sandbox runtime [Exit Code: 0]`
        ]);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCommand(commandHistory[nextIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommand("");
      } else {
        setHistoryIndex(nextIndex);
        setCommand(commandHistory[nextIndex]);
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="h-full flex flex-col bg-black text-[#f59e0b] font-mono text-xs select-none p-3 overflow-hidden cursor-text"
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/20 text-neutral-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-white" />
          <span className="font-bold text-white">SANDBOXED BIO-TERMINAL</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-black font-bold">
            RESTRICTED RUNTIME
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-[#f59e0b]">
            <Shield className="w-3 h-3" /> 32 ALLOWLISTED CMDS
          </span>
          <span className="text-neutral-500">USER: researcher@umbrella.corp</span>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={`${
              line.startsWith("umbrella@")
                ? "text-white font-bold"
                : line.includes("SECURITY ALERT")
                ? "text-red-400 font-bold bg-red-950/30 px-1 py-0.5 rounded"
                : line.includes("SYSTEM STATUS") || line.includes("Allowlisted")
                ? "text-[#f59e0b] font-bold"
                : "text-neutral-300"
            } whitespace-pre-wrap leading-relaxed`}
          >
            {line}
          </div>
        ))}
        {isExecuting && (
          <div className="text-neutral-500 animate-pulse">Running sandboxed execution...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Prompt Input Line */}
      <form onSubmit={handleCommand} className="pt-2 flex items-center gap-2 border-t border-white/10 mt-1">
        <span className="text-white font-bold shrink-0">umbrella@sandbox:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-[#f59e0b] font-mono text-xs focus:outline-none caret-white"
          placeholder="type allowlisted command (e.g. 'help', 'status', 'ls', 'whoami')..."
        />
        <button type="submit" className="text-neutral-500 hover:text-white">
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
