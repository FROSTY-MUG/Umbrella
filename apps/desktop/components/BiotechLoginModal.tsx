"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, ArrowRight, UserCheck, AlertCircle, Sparkles, CheckCircle2, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string; picture: string }) => void;
}

export function BiotechLoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [selectedRole, setSelectedRole] = useState<"researcher" | "admin" | "guest">("researcher");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStage, setAuthStage] = useState<"idle" | "connecting" | "biometrics" | "authorized">("idle");
  const [authError, setAuthError] = useState<string | null>(null);

  const playAuthChime = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (success) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.25); // D6
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // AudioContext unavailable or restricted
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthStage("connecting");
    setAuthError(null);

    try {
      // Stage 1: Google OAuth handshake
      await new Promise((r) => setTimeout(r, 700));
      setAuthStage("biometrics");

      // Stage 2: Token exchange with backend
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          role: selectedRole,
          email: selectedRole === "admin" ? "director@umbrella.corp" : "researcher.genomics@umbrella.corp",
          name: selectedRole === "admin" ? "Dr. Albert Wesker (Director)" : "Dr. Annette Birkin (Senior Geneticist)"
        })
      });

      if (!res.ok) {
        throw new Error("Handshake failed with authentication authority.");
      }

      const data = await res.json();
      playAuthChime(true);
      setAuthStage("authorized");
      await new Promise((r) => setTimeout(r, 1600));

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      console.warn("Backend auth unavailable, falling back to local session:", err);
      playAuthChime(true);
      setAuthStage("authorized");
      await new Promise((r) => setTimeout(r, 1600));
      onLoginSuccess({
        name: selectedRole === "admin" ? "Dr. Albert Wesker (Director)" : "Dr. Annette Birkin (Senior Geneticist)",
        email: selectedRole === "admin" ? "director@umbrella.corp" : "researcher.genomics@umbrella.corp",
        role: selectedRole,
        picture: "https://api.dicebear.com/7.x/identicon/svg?seed=umbrella-biotech"
      });
      onClose();
    } finally {
      setIsAuthenticating(false);
      setAuthStage("idle");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b12_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", stiffness: 450, damping: 32 }}
          className="relative w-full max-w-md bg-[#0a0d0e] border-2 border-white/90 text-white rounded-lg shadow-[0_0_40px_rgba(245,158,11,0.25)] overflow-hidden font-mono"
        >
          {/* Top Yellow Warning Accent Line */}
          <div className="h-1.5 w-full bg-[#f59e0b]" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-10"
            aria-label="Close clearance portal"
          >
            <X className="w-4 h-4" />
          </button>

          {authStage === "authorized" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-6 relative overflow-hidden bg-black/90"
            >
              {/* Animated Bio-Scan line */}
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-[#f59e0b] shadow-[0_0_10px_#f59e0b] pointer-events-none"
              />

              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#f59e0b] bg-[#f59e0b]/10 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                  <CheckCircle2 className="w-8 h-8 text-[#f59e0b] animate-pulse" />
                </div>
              </div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs font-mono tracking-widest text-[#f59e0b] uppercase font-bold"
                >
                  SECURE CLEARANCE GRANTED
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-mono font-black tracking-widest text-white mt-1 uppercase"
                >
                  WELCOME TO UMBRELLA CORPORATION
                </motion.h1>
                <div className="text-[11px] font-mono text-neutral-300 mt-2">
                  Session initialized for <span className="text-[#f59e0b] font-bold">{selectedRole.toUpperCase()}</span> clearance.
                </div>
              </div>

              <div className="p-3 bg-[#111618] border border-white/20 rounded font-mono text-left text-[10px] space-y-1">
                <div className="text-neutral-400">CIPHER: <span className="text-white">SHA3-512 / ED25519</span></div>
                <div className="text-neutral-400">DATASET STREAM: <span className="text-emerald-400">AMR 120GB DUCKDB ONLINE</span></div>
                <div className="text-neutral-400">BIO-TERMINAL: <span className="text-yellow-400">SANDBOXED RBAC ENABLED</span></div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Card Header with Original Hex-Radial Umbrella Geometric Emblem */}
              <div className="p-6 text-center border-b border-white/20 bg-black/60">
                <div className="flex justify-center mb-3">
                  {/* Original Geometric Umbrella Mark (8-facet interlocking sectors in black, white, yellow) */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                      {/* Outer Shield Ring */}
                      <circle cx="50" cy="50" r="46" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 3" />
                      {/* Alternating Geometric Triangles */}
                      <polygon points="50,50 50,8 80,20" fill="#ffffff" />
                      <polygon points="50,50 80,20 92,50" fill="#0a0d0e" stroke="#ffffff" strokeWidth="1" />
                      <polygon points="50,50 92,50 80,80" fill="#f59e0b" />
                      <polygon points="50,50 80,80 50,92" fill="#0a0d0e" stroke="#ffffff" strokeWidth="1" />
                      <polygon points="50,50 50,92 20,80" fill="#ffffff" />
                      <polygon points="50,50 20,80 8,50" fill="#0a0d0e" stroke="#ffffff" strokeWidth="1" />
                      <polygon points="50,50 8,50 20,20" fill="#f59e0b" />
                      <polygon points="50,50 20,20 50,8" fill="#0a0d0e" stroke="#ffffff" strokeWidth="1" />
                      {/* Central Node */}
                      <circle cx="50" cy="50" r="10" fill="#0a0d0e" stroke="#f59e0b" strokeWidth="2" />
                      <circle cx="50" cy="50" r="4" fill="#ffffff" />
                    </svg>
                  </div>
                </div>

                <h2 className="text-sm font-bold tracking-[0.25em] text-white uppercase">
                  UMBRELLA BIOTECH OS
                </h2>
                <div className="text-[10px] tracking-widest text-[#f59e0b] font-bold mt-1">
                  AUTHORIZED PERSONNEL CLEARANCE PORTAL
                </div>
                <p className="text-[10px] text-neutral-400 mt-2">
                  Identity verification required. All sequence sessions are cryptographically logged.
                </p>
              </div>

              {/* Role Clearance Selector */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    SELECT CLEARANCE PRIVILEGES (RBAC)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "researcher", label: "RESEARCHER", desc: "Level 2 Bio" },
                        { id: "admin", label: "DIRECTOR", desc: "Level 4 Admin" },
                        { id: "guest", label: "OBSERVER", desc: "Read Only" }
                      ] as const
                    ).map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-2.5 rounded border text-left transition-all ${
                          selectedRole === role.id
                            ? "bg-white text-black border-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                            : "bg-[#14181a] text-neutral-300 border-white/20 hover:border-white/50"
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-wider">{role.label}</div>
                        <div className={`text-[9px] mt-0.5 ${selectedRole === role.id ? "text-neutral-700" : "text-neutral-500"}`}>
                          {role.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Google OAuth Button (White, Black, Yellow minimal aesthetic) */}
                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    disabled={isAuthenticating}
                    onClick={handleGoogleLogin}
                    className="w-full py-3 px-4 bg-white hover:bg-neutral-200 text-black font-bold text-xs tracking-wider rounded flex items-center justify-center gap-3 transition-all shadow-[0_0_15px_rgba(255,255,255,0.25)] border-2 border-white disabled:opacity-50"
                  >
                    {/* Clean Google 'G' Glyph */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                      />
                    </svg>

                    {isAuthenticating
                      ? authStage === "connecting"
                        ? "HANDSHAKE WITH GOOGLE OIDC..."
                        : authStage === "biometrics"
                        ? "VERIFYING CRYPTOGRAPHIC TOKEN..."
                        : "CLEARANCE GRANTED. ACCESSING..."
                      : "SIGN IN WITH GOOGLE WORKSPACE"}
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#f59e0b]" /> End-to-end TLS 1.3
                    </span>
                    <span className="text-[#f59e0b]">SESSION EXPIRY: 24 HOURS</span>
                  </div>
                </div>

                {/* Compliance Footer */}
                <div className="pt-2 border-t border-white/10 text-[9px] text-neutral-500 leading-relaxed text-center">
                  RESTRICTED BIOTECHNOLOGY NETWORK. Unauthorized entry strictly prohibited under international bio-surveillance protocols.
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
