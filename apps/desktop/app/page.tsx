"use client";

import React, { useEffect } from "react";
import { useDesktopStore } from "../lib/store";
import { DesktopIconGrid } from "../components/desktop/DesktopIconGrid";
import { WindowFrame } from "../components/desktop/WindowFrame";
import { Taskbar } from "../components/desktop/Taskbar";
import { Launcher } from "../components/desktop/Launcher";

// Application Components
import { GenomeAnalyzerApp } from "../apps/GenomeAnalyzerApp";
import { AmrSentinelApp } from "../apps/AmrSentinelApp";
import { MutationLabApp } from "../apps/MutationLabApp";
import { SequenceQCApp } from "../apps/SequenceQCApp";
import { SampleVaultApp } from "../apps/SampleVaultApp";
import { RadiationLabApp } from "../apps/RadiationLabApp";
import { PathogenAtlasApp } from "../apps/PathogenAtlasApp";
import { VariantExplorerApp } from "../apps/VariantExplorerApp";
import { BioTerminalApp } from "../apps/BioTerminalApp";
import { ReportStudioApp } from "../apps/ReportStudioApp";
import { UmbrellaForgeApp } from "../apps/UmbrellaForgeApp";
import { GeneratedForgeAppView } from "../apps/GeneratedForgeAppView";
import { VellaApp } from "../apps/VellaApp";
import { SystemMonitorApp } from "../apps/SystemMonitorApp";
import { BenchmarkDnaApp } from "../apps/BenchmarkDnaApp";
import { GenomeCompetitorApp } from "../apps/GenomeCompetitorApp";
import { StressLabApp } from "../apps/StressLabApp";
import { BiotechLoginModal } from "../components/BiotechLoginModal";
import { BootSequence } from "../components/BootSequence";

export default function DesktopPage() {
  const { windows, installedApps, closeWindow, activeWindowId, setLauncherOpen, toggleLauncher } =
    useDesktopStore();
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [bootSequenceComplete, setBootSequenceComplete] = React.useState(false);

  // Global event listener for clearance login
  useEffect(() => {
    const handleOpenLogin = () => setLoginModalOpen(true);
    window.addEventListener("umbrella-open-login", handleOpenLogin);
    return () => window.removeEventListener("umbrella-open-login", handleOpenLogin);
  }, []);

  // Keyboard shortcut contracts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLauncherOpen(false);
      }
      if (e.altKey && e.key.toLowerCase() === "f4" && activeWindowId) {
        e.preventDefault();
        closeWindow(activeWindowId);
      }
      if (e.altKey && e.code === "Space") {
        e.preventDefault();
        toggleLauncher();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeWindowId, closeWindow, setLauncherOpen, toggleLauncher]);

  const renderAppContent = (win: any) => {
    switch (win.appId) {
      case "genome-competitor":
        return <GenomeCompetitorApp />;
      case "stress-lab":
        return <StressLabApp />;
      case "benchmark-dna":
        return <BenchmarkDnaApp />;
      case "genome-analyzer":
        return <GenomeAnalyzerApp sampleId={win.props?.sampleId} />;
      case "amr-sentinel":
        return <AmrSentinelApp sampleId={win.props?.sampleId} />;
      case "mutation-lab":
        return <MutationLabApp querySampleId={win.props?.querySampleId} />;
      case "sequence-qc":
        return <SequenceQCApp sampleId={win.props?.sampleId} />;
      case "sample-vault":
        return <SampleVaultApp />;
      case "radiation-lab":
        return <RadiationLabApp />;
      case "pathogen-atlas":
        return <PathogenAtlasApp />;
      case "variant-explorer":
        return <VariantExplorerApp />;
      case "bio-terminal":
        return <BioTerminalApp />;
      case "report-studio":
        return <ReportStudioApp sampleId={win.props?.sampleId} />;
      case "umbrella-forge":
        return <UmbrellaForgeApp />;
      case "vella":
        return <VellaApp />;
      case "system-monitor":
        return <SystemMonitorApp />;
      default:
        const forgeApp = installedApps.find((a) => a.id === win.appId);
        if (forgeApp && forgeApp.isForge) {
          return <GeneratedForgeAppView appDef={forgeApp as any} />;
        }
        return (
          <div className="p-8 text-center text-xs font-mono text-slate-400">
            Application runtime active for &quot;{win.title}&quot;.
          </div>
        );
    }
  };

  return (
    <>
      {!bootSequenceComplete && (
        <BootSequence onComplete={() => setBootSequenceComplete(true)} />
      )}
      
      {bootSequenceComplete && (
        <main className="relative h-screen w-screen overflow-hidden bg-[#f0f0e8] text-slate-900">
      
      {/* Top Elevated Bar */}
      <div className="absolute top-0 left-0 w-full h-12 bg-white border-b border-slate-300 flex items-center px-6 z-0 shadow-sm">
        <h1 className="text-xl font-bold tracking-[0.3em] text-slate-800">
          UMBRELLA CORPORATION
        </h1>
      </div>

      {/* Clean White Resident Evil Theme Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center pt-12">
        {/* Subtle cement texture overlay */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply" 
          style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0) 20%, rgba(0,0,0,0.1) 100%)' }}
        />
        {/* Crisp Umbrella Logo in the center */}
        <div className="w-[400px] h-[400px] opacity-[0.03] flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-800">
            <path d="M50 0 A 50 50 0 0 0 0 50 L 50 50 Z" />
            <path d="M100 50 A 50 50 0 0 0 50 0 L 50 50 Z" fill="#dc2626" />
            <path d="M14.6 14.6 A 50 50 0 0 0 0 50 L 50 50 Z" fill="#dc2626" />
            <path d="M85.4 14.6 A 50 50 0 0 1 100 50 L 50 50 Z" />
          </svg>
        </div>
      </div>

      {/* Corporate Lab Station Watermark */}
      <div className="absolute top-16 right-6 pointer-events-none text-right font-sans select-none opacity-40 z-0">
        <div className="text-sm font-bold tracking-widest text-slate-800">UMBRELLA OS</div>
        <div className="text-xs text-slate-600">SECURE SCIENTIFIC WORKSTATION // BUILD 2026.10</div>
      </div>

      {/* Desktop Wallpaper App Icon Grid */}
      <div className="relative z-10 w-full h-full pointer-events-auto pt-12">
        <DesktopIconGrid />
      </div>

      {/* Render All Open Desktop Windows */}
      {windows.map((win) => (
        <WindowFrame key={win.id} window={win}>
          {renderAppContent(win)}
        </WindowFrame>
      ))}

      {/* Start Menu / App Launcher */}
      <Launcher />

      {/* Operating System Taskbar */}
      <Taskbar />

      {/* Biotech Google Auth Clearance Modal */}
      <BiotechLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setLoginModalOpen(false);
        }}
      />
        </main>
      )}
    </>
  );
}
