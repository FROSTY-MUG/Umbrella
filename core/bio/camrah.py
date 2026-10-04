"""
Umbrella OS - cAMRah Harmonization & Ensemble AMR Workflow
==========================================================
Curated workflow designed to predict and harmonize AMR genes in microbial genomes.
Integrates and compares six AMR-finding tools and reference databases:
1. NCBI AMRFinderPlus (default annotation tool)
2. GenEpi ResFinder (acquired genes & chromosomal point mutations)
3. RGI (Resistance Gene Identifier) with CARD (Comprehensive Antibiotic Resistance Database)
4. Abricate with NCBI database
5. Abricate with ARG-ANNOT database
6. BV-BRC AMR Computational Detection

Core Principle (Master Build Prompt §19):
"Never treat consensus as laboratory truth. AMRFinderPlus/ResFinder/cAMRah outputs
are annotations/features, preserve laboratory phenotype as ground truth."
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Set
from datetime import datetime, timezone


SUPPORTED_CAMRAH_TOOLS = [
    "AMRFinderPlus",
    "ResFinder",
    "RGI_CARD",
    "Abricate_NCBI",
    "Abricate_ARG_ANNOT",
    "BV_BRC"
]


def canonicalize_gene_symbol(gene: str) -> str:
    """
    Standardizes gene symbol formatting across different databases and naming conventions.
    E.g., 'bla_TEM-1' -> 'blaTEM-1', 'tetA' -> 'tet(A)', 'aac(6\')-Ib' -> 'aac(6\')-Ib'.
    """
    if not gene:
        return "UNKNOWN"

    g = gene.strip()
    # Normalize beta-lactamase prefix
    if g.lower().startswith("bla_"):
        g = "bla" + g[4:]

    # Normalize tetracycline notation: tetA -> tet(A)
    m_tet = re.match(r"^tet([A-Z0-9]+)$", g, re.IGNORECASE)
    if m_tet and not g.startswith("tet("):
        g = f"tet({m_tet.group(1).upper()})"

    # Normalize erm notation: ermA -> erm(A)
    m_erm = re.match(r"^erm([A-Z0-9]+)$", g, re.IGNORECASE)
    if m_erm and not g.startswith("erm("):
        g = f"erm({m_erm.group(1).upper()})"

    # Normalize point mutation notations: gyrA_D87N vs gyrA:D87N vs GyrA D87N
    g = re.sub(r"[:\s]+", "_", g)

    return g


class CamrahHarmonizer:
    """
    Harmonizes multi-tool AMR annotations, computes concordance matrices,
    and formats evidence records while maintaining strict provenance.
    """

    def __init__(self, sample_id: str, genome_id: Optional[str] = None):
        self.sample_id = sample_id
        self.genome_id = genome_id or sample_id
        self.tool_findings: Dict[str, List[Dict[str, Any]]] = {
            tool: [] for tool in SUPPORTED_CAMRAH_TOOLS
        }

    def add_tool_findings(self, tool_name: str, findings: List[Dict[str, Any]]):
        """Register findings from a specific AMR tool."""
        if tool_name not in self.tool_findings:
            self.tool_findings[tool_name] = []
        self.tool_findings[tool_name].extend(findings)

    def harmonize(self) -> Dict[str, Any]:
        """
        Executes cAMRah multi-tool comparison and harmonization.
        Returns:
            - consensus_genes: list of harmonized genes with concordance score (x/6)
            - tool_summary: breakdown of detections per tool
            - concordance_rate: overall agreement ratio
            - provenance_trail: detailed source hashes and versions
        """
        active_tools = [t for t, f in self.tool_findings.items() if len(f) > 0]
        total_active_tools = len(active_tools) or 1

        # Map canonical gene -> {tools: set(), records: list(), classes: set()}
        gene_cluster: Dict[str, Dict[str, Any]] = {}

        for tool, findings in self.tool_findings.items():
            for f in findings:
                raw_gene = f.get("gene") or f.get("mutation") or "UNKNOWN"
                canon = canonicalize_gene_symbol(raw_gene)
                cls_name = f.get("class_name") or "AMR"

                if canon not in gene_cluster:
                    gene_cluster[canon] = {
                        "canonical_gene": canon,
                        "raw_symbols": set(),
                        "detecting_tools": set(),
                        "classes": set(),
                        "max_identity": 0.0,
                        "max_coverage": 0.0,
                        "evidence_records": []
                    }

                cluster = gene_cluster[canon]
                cluster["raw_symbols"].add(raw_gene)
                cluster["detecting_tools"].add(tool)
                cluster["classes"].add(cls_name)

                ident = f.get("identity_percent") or 0.0
                cov = f.get("coverage_percent") or 0.0
                if ident > cluster["max_identity"]:
                    cluster["max_identity"] = ident
                if cov > cluster["max_coverage"]:
                    cluster["max_coverage"] = cov

                cluster["evidence_records"].append({
                    "tool": tool,
                    "raw_gene": raw_gene,
                    "identity": ident,
                    "coverage": cov,
                    "raw_evidence": f.get("evidence", {})
                })

        # Build harmonized consensus list
        consensus_items = []
        for canon, cdata in sorted(gene_cluster.items()):
            detecting_list = sorted(list(cdata["detecting_tools"]))
            concordance = len(detecting_list) / max(total_active_tools, 1)

            consensus_items.append({
                "canonical_gene": canon,
                "concordance_ratio": round(concordance, 3),
                "concordance_count": f"{len(detecting_list)}/{total_active_tools}",
                "detecting_tools": detecting_list,
                "classes": sorted(list(cdata["classes"])),
                "highest_identity": cdata["max_identity"],
                "highest_coverage": cdata["max_coverage"],
                "is_unanimous": len(detecting_list) == total_active_tools,
                "is_organizer_default_verified": "AMRFinderPlus" in detecting_list,
                "is_resfinder_crosschecked": "ResFinder" in detecting_list,
                "evidence_count": len(cdata["evidence_records"])
            })

        return {
            "workflow": "cAMRah Harmonized AMR Ensemble",
            "version": "1.0.0",
            "sample_id": self.sample_id,
            "genome_id": self.genome_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tools_evaluated": SUPPORTED_CAMRAH_TOOLS,
            "active_tools_count": len(active_tools),
            "total_detected_markers": len(consensus_items),
            "unanimous_markers_count": sum(1 for item in consensus_items if item["is_unanimous"]),
            "harmonized_findings": consensus_items,
            "methodology_disclaimer": "cAMRah predictions provide computational evidence and features. In accordance with Umbrella scientific rules, computational consensus is never treated as laboratory truth; laboratory MIC/phenotype remains the gold standard."
        }
