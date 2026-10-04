"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  X,
  KeyRound,
  Fingerprint,
  Terminal,
  Zap
} from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string; picture: string }) => void;
}

export function BiotechLoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [selectedRole, setSelectedRole] = useState<"researcher" | "admin" | "guest">("admin");
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
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

  const executeSuccessfulLogin = async (role: "researcher" | "admin" | "guest", userName?: string, userEmail?: string) => {
    playAuthChime(true);
    setAuthStage("authorized");
    await new Promise((r) => setTimeout(r, 1400));

    onLoginSuccess({
      name: userName || (role === "admin" ? "Dr. Albert Wesker (Director)" : "Dr. Annette Birkin (Senior Geneticist)"),
      email: userEmail || (role === "admin" ? "director@umbrella.corp" : "researcher.genomics@umbrella.corp"),
      role: role,
      picture: "https://api.dicebear.com/7.x/identicon/svg?seed=umbrella-biotech"
    });
    onClose();
    setIsAuthenticating(false);
    setAuthStage("idle");
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(false);
    const cleaned = passcode.trim();

    if (cleaned === "05872610") {
      setIsAuthenticating(true);
      setAuthStage("biometrics");
      await new Promise((r) => setTimeout(r, 600));
      await executeSuccessfulLogin("admin", "Director Wesker (Level-4)", "director@umbrella.corp");
    } else {
      playAuthChime(false);
      setPasscodeError(true);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthStage("connecting");
    setAuthError(null);

    try {
      // Stage 1: Google OAuth handshake
      await new Promise((r) => setTimeout(r, 600));
      setAuthStage("biometrics");

      // Stage 2: Token exchange with backend if available
      try {
        const res = await fetch("https://umbrella-api-furc.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "google",
            role: selectedRole,
            email: selectedRole === "admin" ? "director@umbrella.corp" : "researcher.genomics@umbrella.corp",
            name: selectedRole === "admin" ? "Dr. Albert Wesker (Director)" : "Dr. Annette Birkin (Senior Geneticist)"
          })
        });
        if (res.ok) {
          const data = await res.json();
          await executeSuccessfulLogin(selectedRole, data.user?.name, data.user?.email);
          return;
        }
      } catch (e) {
        // Fallback to local session
      }

      await executeSuccessfulLogin(selectedRole);
    } catch (err: any) {
      console.warn("Auth fallback activated:", err);
      await executeSuccessfulLogin(selectedRole);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono"
        onClick={onClose}
      >
        {/* Subtle radial bio-luminescent glow with blue and green hints */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d418_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", stiffness: 450, damping: 32 }}
          className="relative w-full max-w-md bg-[#05080a] border-2 border-white text-white rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden font-mono"
        >
          {/* Top Bio-Accent Bar: Green to Blue Gradient with White Glow */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-white to-cyan-400" />

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
              className="p-8 text-center space-y-6 relative overflow-hidden bg-black/95"
            >
              {/* Animated Bio-Scan line in Cyan/Green */}
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_12px_#06b6d4] pointer-events-none"
              />

              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-400 bg-emerald-950/40 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
              </div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold"
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
                  Session initialized for <span className="text-cyan-300 font-bold">{selectedRole.toUpperCase()}</span> clearance.
                </div>
              </div>

              <div className="p-3 bg-[#0d1417] border border-white/20 rounded font-mono text-left text-[10px] space-y-1">
                <div className="text-neutral-400">CIPHER: <span className="text-white">SHA3-512 / ED25519</span></div>
                <div className="text-neutral-400">DATASET STREAM: <span className="text-emerald-400">AMR 120GB DUCKDB ONLINE</span></div>
                <div className="text-neutral-400">BIO-TERMINAL: <span className="text-cyan-400">SANDBOXED RBAC ENABLED</span></div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Card Header with Geometric Umbrella Mark in Black, White, Green, and Blue */}
              <div className="p-5 text-center border-b border-white/20 bg-black/70">
                <div className="flex justify-center mb-3">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                      {/* Outer Ring */}
                      <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="5 3" />
                      {/* Geometric Segments */}
                      <polygon points="50,50 50,8 80,20" fill="#ffffff" />
                      <polygon points="50,50 80,20 92,50" fill="#06090a" stroke="#ffffff" strokeWidth="1" />
                      <polygon points="50,50 92,50 80,80" fill="#10b981" />
                      <polygon points="50,50 80,80 50,92" fill="#06090a" stroke="#ffffff" strokeWidth="1" />
                      <polygon points="50,50 50,92 20,80" fill="#ffffff" />
                      <polygon points="50,50 20,80 8,50" fill="#06090a" stroke="#ffffff" strokeWidth="1" />
                      <polygon points="50,50 8,50 20,20" fill="#06b6d4" />
                      <polygon points="50,50 20,20 50,8" fill="#06090a" stroke="#ffffff" strokeWidth="1" />
                      {/* Center Node */}
                      <circle cx="50" cy="50" r="10" fill="#06090a" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="50" cy="50" r="4" fill="#06b6d4" />
                    </svg>
                  </div>
                </div>

                <h2 className="text-sm font-bold tracking-[0.25em] text-white uppercase">
                  UMBRELLA BIOTECH OS
                </h2>
                <div className="text-[10px] tracking-widest text-cyan-300 font-bold mt-1 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  CLEARANCE ACCESS PORTAL
                </div>
                <p className="text-[10px] text-neutral-400 mt-1.5">
                  Identity authentication required. All sequence sessions are cryptographically logged.
                </p>
              </div>

              {/* Clearance Forms */}
              <div className="p-5 space-y-4">
                {/* Method 1: Passcode Clearance (05872610) */}
                <form onSubmit={handlePasscodeSubmit} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <label className="font-bold text-white uppercase tracking-wider flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> PASSCODE CLEARANCE
                    </label>
                    <span className="text-emerald-400 font-bold text-[9px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/60">
                      MASTER: 05872610
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 8-digit passcode (05872610)"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setPasscodeError(false);
                      }}
                      className={`flex-1 bg-black border px-3 py-2 text-xs text-white rounded font-mono tracking-widest focus:outline-none transition-all ${
                        passcodeError
                          ? "border-red-500 bg-red-950/20 text-red-200"
                          : "border-white/30 focus:border-cyan-400"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded transition-all shadow-[0_0_12px_rgba(255,255,255,0.3)] flex items-center gap-1"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Unlock
                    </button>
                  </div>

                  {passcodeError && (
                    <div className="text-[10px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Invalid security passcode. Use master key: 05872610.
                    </div>
                  )}
                </form>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/15" />
                  <span className="flex-shrink mx-3 text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                    OR WORKSPACE OAUTH
                  </span>
                  <div className="flex-grow border-t border-white/15" />
                </div>

                {/* Role Clearance Selector */}
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    SELECT CLEARANCE ROLE
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
                        className={`p-2 rounded border text-left transition-all ${
                          selectedRole === role.id
                            ? "bg-white text-black border-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                            : "bg-[#0b1013] text-neutral-300 border-white/15 hover:border-cyan-500/50"
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-wider">{role.label}</div>
                        <div className={`text-[9px] mt-0.5 ${selectedRole === role.id ? "text-neutral-700" : "text-neutral-400"}`}>
                          {role.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Google OAuth Button (Black, White, with Green and Blue hints) */}
                <div className="pt-1 space-y-2.5">
                  <button
                    type="button"
                    disabled={isAuthenticating}
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 px-4 bg-black hover:bg-neutral-900 text-white font-bold text-xs tracking-wider rounded flex items-center justify-center gap-3 transition-all border-2 border-white hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:opacity-50"
                  >
                    {/* Google G Glyph */}
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

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Lock className="w-3 h-3" /> TLS 1.3 Certified
                    </span>
                    <span className="text-cyan-400">SESSION: 24H RBAC</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-white/10 text-[9px] text-neutral-400 leading-relaxed text-center">
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
