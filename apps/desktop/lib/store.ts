import { create } from "zustand";
import { WindowState, AppManifest, SampleRef } from "../types/desktop";

export const NATIVE_APPS: AppManifest[] = [
  { id: "genome-competitor", name: "Genome Competitor", acronym: "GC", category: "genomics", description: "Multi-organism DS DNA competitor comparison, protein targets & breakage loci", defaultWidth: 940, defaultHeight: 620, minWidth: 720, minHeight: 480 },
  { id: "stress-lab", name: "Stress Lab", acronym: "ST", category: "simulation", description: "Bacterial stress simulation, adaptive Gompertz growth curves & cellular morphology", defaultWidth: 920, defaultHeight: 600, minWidth: 700, minHeight: 460 },
  { id: "benchmark-dna", name: "DNA Benchmark", acronym: "DB", category: "genomics", description: "Age & gender demographic benchmark with self-building ASCII double helix", defaultWidth: 920, defaultHeight: 620, minWidth: 720, minHeight: 480 },
  { id: "genome-analyzer", name: "Genome Analyzer", acronym: "GA", category: "core_bio", description: "Sequence inspection, contigs, GC% distribution, and launchpad", defaultWidth: 840, defaultHeight: 560, minWidth: 640, minHeight: 420 },
  { id: "mutation-lab", name: "Mutation Lab", acronym: "ML", category: "sequence_diff", description: "Reference vs query comparison, SNP/INDEL detection and coordinates", defaultWidth: 860, defaultHeight: 560, minWidth: 680, minHeight: 440 },
  { id: "amr-sentinel", name: "AMR Sentinel", acronym: "AS", category: "antimicrobial_resistance", description: "Flagship resistome surveillance, drug panel and evidence dossier", defaultWidth: 880, defaultHeight: 580, minWidth: 700, minHeight: 450 },
  { id: "sequence-qc", name: "Sequence QC", acronym: "QC", category: "quality_control", description: "Batch sequence quality metrics, distributions, and PASS/FAIL validation", defaultWidth: 800, defaultHeight: 520, minWidth: 620, minHeight: 400 },
  { id: "sample-vault", name: "Sample Vault", acronym: "SV", category: "data_registry", description: "Persistent sample registry and cross-app identity management", defaultWidth: 820, defaultHeight: 520, minWidth: 640, minHeight: 400 },
  { id: "radiation-lab", name: "Radiation Lab", acronym: "RL", category: "simulation", description: "Biophysical DNA damage simulation (SSB, DSB, high vs low LET)", defaultWidth: 820, defaultHeight: 540, minWidth: 640, minHeight: 420 },
  { id: "pathogen-atlas", name: "Pathogen Atlas", acronym: "PA", category: "taxonomy", description: "Browsable computational atlas across Bacteria, Viruses, and Fungi", defaultWidth: 820, defaultHeight: 520, minWidth: 640, minHeight: 400 },
  { id: "variant-explorer", name: "Variant Explorer", acronym: "VE", category: "genomics", description: "Cohort variant relationship graphs and recurrent locus matrix", defaultWidth: 840, defaultHeight: 540, minWidth: 640, minHeight: 420 },
  { id: "science-lab", name: "Science Lab", acronym: "SL", category: "simulation", description: "Cellular stress response modeling and animated DNA integrity display", defaultWidth: 800, defaultHeight: 520, minWidth: 620, minHeight: 400 },
  { id: "research-desk", name: "Research Desk", acronym: "RD", category: "research", description: "Persistent research desk, hypotheses, notes, and evidence linking", defaultWidth: 820, defaultHeight: 520, minWidth: 640, minHeight: 400 },
  { id: "analysis-studio", name: "Analysis Studio", acronym: "AS", category: "analytics", description: "Tabular data visualization, cohort distributions, and chart export", defaultWidth: 820, defaultHeight: 520, minWidth: 640, minHeight: 400 },
  { id: "bio-terminal", name: "Bio Terminal", acronym: "BT", category: "system", description: "Bioinformatics shell, CLI command runner, and pipeline execution", defaultWidth: 800, defaultHeight: 480, minWidth: 600, minHeight: 360 },
  { id: "report-studio", name: "Report Studio", acronym: "RS", category: "reporting", description: "Multi-section scientific report composer with audit provenance", defaultWidth: 840, defaultHeight: 560, minWidth: 640, minHeight: 420 },
  { id: "umbrella-forge", name: "Umbrella Forge", acronym: "AF", category: "meta_compiler", description: "Self-building application pipeline: generate and evolve native tools", defaultWidth: 880, defaultHeight: 580, minWidth: 700, minHeight: 460 },
  { id: "system-monitor", name: "System Monitor", acronym: "SM", category: "system", description: "Real-time CPU, RAM, active jobs, worker queues, and telemetry", defaultWidth: 740, defaultHeight: 480, minWidth: 560, minHeight: 360 }
];

interface DesktopStore {
  windows: WindowState[];
  activeWindowId: string | null;
  highestZIndex: number;
  launcherOpen: boolean;
  activeSample: SampleRef | null;
  installedApps: AppManifest[];

  // Actions
  toggleLauncher: () => void;
  setLauncherOpen: (open: boolean) => void;
  openWindow: (appId: string, initialProps?: Record<string, any>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number, height: number) => void;
  minimizeAll: () => void;
  setActiveSample: (sample: SampleRef | null) => void;
  registerForgeApp: (app: AppManifest) => void;
}

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  windows: [
    {
      id: "win-init-db",
      appId: "benchmark-dna",
      title: "DNA Demographic Benchmark & Synthesizer",
      x: 70,
      y: 40,
      width: 960,
      height: 640,
      minWidth: 720,
      minHeight: 480,
      zIndex: 10,
      minimized: false,
      maximized: false,
      focused: true,
      props: {}
    }
  ],
  activeWindowId: "win-init-db",
  highestZIndex: 10,
  launcherOpen: false,
  // Hard Data Rule §1: No pre-loaded organism — activeSample is null until the user
  // uploads a real FASTA or selects a sample from the Sample Vault.
  activeSample: null,
  installedApps: [...NATIVE_APPS],

  toggleLauncher: () => set((state) => ({ launcherOpen: !state.launcherOpen })),
  setLauncherOpen: (open) => set({ launcherOpen: open }),

  openWindow: (appId, initialProps) => {
    const { windows, installedApps, highestZIndex } = get();
    const appDef = installedApps.find((a) => a.id === appId);
    if (!appDef) return;

    // Check if single-instance window already open
    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      set({
        activeWindowId: existing.id,
        launcherOpen: false,
        highestZIndex: highestZIndex + 1,
        windows: windows.map((w) =>
          w.id === existing.id
            ? { ...w, minimized: false, focused: true, zIndex: highestZIndex + 1, props: { ...w.props, ...initialProps } }
            : { ...w, focused: false }
        )
      });
      return;
    }

    // Offset cascade positioning
    const offset = (windows.length % 6) * 32;
    const newZ = highestZIndex + 1;
    const newWin: WindowState = {
      id: `win-${appId}-${Date.now().toString(36)}`,
      appId,
      title: appDef.name,
      x: Math.max(40, 80 + offset),
      y: Math.max(40, 60 + offset),
      width: appDef.defaultWidth || 820,
      height: appDef.defaultHeight || 540,
      minWidth: appDef.minWidth || 600,
      minHeight: appDef.minHeight || 380,
      zIndex: newZ,
      minimized: false,
      maximized: false,
      focused: true,
      props: initialProps || {}
    };

    set({
      windows: [...windows.map((w) => ({ ...w, focused: false })), newWin],
      activeWindowId: newWin.id,
      highestZIndex: newZ,
      launcherOpen: false
    });
  },

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
    })),

  focusWindow: (id) =>
    set((state) => {
      const newZ = state.highestZIndex + 1;
      return {
        activeWindowId: id,
        highestZIndex: newZ,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, focused: true, zIndex: newZ, minimized: false } : { ...w, focused: false }
        )
      };
    }),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: true, focused: false } : w
      ),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
    })),

  maximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, maximized: true, focused: true } : w
      )
    })),

  restoreWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, maximized: false, minimized: false, focused: true } : w
      )
    })),

  updatePosition: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      )
    })),

  updateSize: (id, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      )
    })),

  minimizeAll: () =>
    set((state) => ({
      windows: state.windows.map((w) => ({ ...w, minimized: true, focused: false })),
      activeWindowId: null
    })),

  setActiveSample: (sample) => set({ activeSample: sample }),

  registerForgeApp: (app) =>
    set((state) => {
      if (state.installedApps.some((a) => a.id === app.id)) {
        return {
          installedApps: state.installedApps.map((a) => (a.id === app.id ? app : a))
        };
      }
      return { installedApps: [...state.installedApps, app] };
    })
}));
