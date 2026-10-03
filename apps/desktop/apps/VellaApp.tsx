"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot, User, CheckCircle2, ArrowRight } from "lucide-react";
import { useDesktopStore } from "../lib/store";

export function VellaApp() {
  const { activeSample, openWindow } = useDesktopStore();
  const [messages, setMessages] = useState<any[]>([
    {
      sender: "vella",
      text: "Vella Scientific Control Layer online. Ready to orchestrate analysis pipelines, query AMR evidence dossiers, or compile new instruments via Umbrella Forge.",
      tools: [],
      provider: "Deterministic Local Bio-Kernel"
    }
  ]);
  const [input, setInput] = useState("Analyze sample 1827, check AMR markers, and open findings in AMR Sentinel.");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/vella/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          active_sample_id: activeSample?.sampleId || "SMP-1827"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: "vella",
            text: data.response_text,
            tools: data.tools_called,
            actions: data.actions,
            provider: data.provider_used
          }
        ]);

        // Execute desktop actions returned by Vella
        if (data.actions && data.actions.length > 0) {
          data.actions.forEach((act: any) => {
            if (act.action === "open_app") {
              setTimeout(() => {
                openWindow(act.target, act.params);
              }, 400);
            }
          });
        }
      }
    } catch (err) {
      console.error("Vella error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "vella",
          text: "Communication timeout with Vella endpoint. Retrying with deterministic local kernel...",
          tools: [],
          provider: "Local Offline Fallback"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col justify-between font-mono text-xs text-slate-200">
      {/* Vella Header */}
      <div className="p-3 bg-surface border border-surface-border rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-100">VELLA // AI SCIENTIFIC CONTROL PLANE</span>
        </div>
        <span className="text-[10px] text-cyan-400 font-mono">
          SCOPED TOOL ROUTER ACTIVE
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 my-3 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded border text-xs ${
              m.sender === "user"
                ? "bg-surface-secondary border-surface-border text-slate-100 ml-8"
                : "bg-surface border-cyan-500/30 text-slate-200 mr-8 space-y-2"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-surface-border/50 pb-1">
              <span className="flex items-center gap-1 font-bold">
                {m.sender === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-cyan-400" />}
                {m.sender === "user" ? "RESEARCHER" : "VELLA ORCHESTRATOR"}
              </span>
              {m.provider && <span className="text-[9px] text-slate-500">{m.provider}</span>}
            </div>

            <div className="leading-relaxed">{m.text}</div>

            {m.tools && m.tools.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {m.tools.map((t: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-surface-secondary border border-cyan-800 text-cyan-300 text-[10px] flex items-center gap-1 font-bold"
                  >
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>Dispatched: {t}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Command Vella (e.g. 'Compare mutations in sample 1827', 'Analyze AMR', 'Build app')..."
          className="flex-1 bg-surface-secondary border border-surface-border rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500 text-cyan-300 font-bold rounded flex items-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? "Routing..." : "Execute"}</span>
        </button>
      </form>
    </div>
  );
}
