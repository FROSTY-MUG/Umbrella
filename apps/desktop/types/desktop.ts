export type WindowState = {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  props?: Record<string, any>;
};

export type AppManifest = {
  id: string;
  name: string;
  acronym: string;
  category: string;
  description: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  version?: string;
  isForge?: boolean;
  spec_dsl?: any;
};

export type SampleRef = {
  sampleId: string;
  genomeId?: string;
  organism: string;
  qcStatus?: "PASS" | "WARN" | "FAIL";
  totalBases?: number;
};
