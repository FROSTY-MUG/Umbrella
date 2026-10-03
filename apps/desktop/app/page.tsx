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
import { ScienceLabApp } from "../apps/ScienceLabApp";
import { ResearchDeskApp } from "../apps/ResearchDeskApp";
import { AnalysisStudioApp } from "../apps/AnalysisStudioApp";
import { BioTerminalApp } from "../apps/BioTerminalApp";
import { ReportStudioApp } from "../apps/ReportStudioApp";
import { UmbrellaForgeApp } from "../apps/UmbrellaForgeApp";
import { VellaApp } from "../apps/VellaApp";
import { SystemMonitorApp } from "../apps/SystemMonitorApp";
import { GeneratedForgeAppView } from "../apps/GeneratedForgeAppView";
import { BenchmarkDnaApp } from "../apps/BenchmarkDnaApp";

export default function DesktopPage() {
  const { windows, installedApps, closeWindow, activeWindowId, setLauncherOpen, toggleLauncher } =
    useDesktopStore();

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
      case "science-lab":
        return <ScienceLabApp />;
      case "research-desk":
        return <ResearchDeskApp />;
      case "analysis-studio":
        return <AnalysisStudioApp />;
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
          return <GeneratedForgeAppView appDef={forgeApp} />;
        }
        return (
          <div className="p-8 text-center text-xs font-mono text-slate-400">
            Application runtime active for &quot;{win.title}&quot;.
          </div>
        );
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-bio-grid bg-[#080c0e]">
      {/* Bio-Radar Sweep Effect */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[850px] h-[850px] rounded-full border border-emerald-900/20 relative flex items-center justify-center">
          <div className="w-[550px] h-[550px] rounded-full border border-emerald-900/15" />
          <div className="w-[280px] h-[280px] rounded-full border border-emerald-900/10" />
          <div className="absolute inset-0 rounded-full radar-sweep" />
        </div>
      </div>

      {/* Corporate Lab Station Watermark */}
      <div className="absolute top-4 right-6 pointer-events-none text-right font-mono select-none opacity-40">
        <div className="text-xs font-bold tracking-widest text-emerald-500">UMBRELLA OS</div>
        <div className="text-[10px] text-slate-400">SECURE SCIENTIFIC WORKSTATION // BUILD 2026.10</div>
      </div>

      {/* Desktop Wallpaper App Icon Grid */}
      <DesktopIconGrid />

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
    </main>
  );
}
