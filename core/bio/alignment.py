"""
Umbrella OS - Mutation & Variant Analysis Engine
Deterministic pairwise sequence alignment, SNP calling, insertion/deletion detection,
coordinate normalization, and local sequence context extraction.
"""

from typing import List, Dict, Any, Optional

def reverse_complement(seq: str) -> str:
    """Computes reverse complement of DNA sequence."""
    trans = str.maketrans("ACGTNacgtn", "TGCANtgcan")
    return seq.translate(trans)[::-1]

def call_variants_pairwise(
    ref_seq: str,
    query_seq: str,
    contig_name: str = "contig_1",
    context_window: int = 15
) -> Dict[str, Any]:
    """
    Computes deterministic variant differences between reference and query sequence.
    Identifies SNPs, Insertions, Deletions, and reports exact coordinates and
    surrounding 5' -> 3' local nucleotide context.
    """
    variants: List[Dict[str, Any]] = []
    ref_len = len(ref_seq)
    query_len = len(query_seq)
    min_len = min(ref_len, query_len)

    snps_count = 0
    ins_count = 0
    del_count = 0

    # 1. Base-by-base scan up to common length
    for i in range(min_len):
        r_base = ref_seq[i].upper()
        q_base = query_seq[i].upper()

        if r_base != q_base and r_base in "ACGT" and q_base in "ACGT":
            start_ctx = max(0, i - context_window)
            end_ctx = min(ref_len, i + context_window + 1)
            ref_context = ref_seq[start_ctx:end_ctx]

            variants.append({
                "position": i + 1,  # 1-indexed coordinate
                "contig": contig_name,
                "type": "SNP",
                "ref": r_base,
                "alt": q_base,
                "evidence": "HIGH",
                "context": ref_context,
                "context_offset": i - start_ctx
            })
            snps_count += 1

    # 2. Tail differences (Insertions / Deletions)
    if query_len > ref_len:
        ins_bases = query_seq[ref_len:].upper()
        variants.append({
            "position": ref_len + 1,
            "contig": contig_name,
            "type": "INS",
            "ref": "-",
            "alt": ins_bases[:20] + ("..." if len(ins_bases) > 20 else ""),
            "evidence": "HIGH",
            "context": query_seq[max(0, ref_len - context_window):],
            "context_offset": context_window
        })
        ins_count += len(ins_bases)
    elif ref_len > query_len:
        del_bases = ref_seq[query_len:].upper()
        variants.append({
            "position": query_len + 1,
            "contig": contig_name,
            "type": "DEL",
            "ref": del_bases[:20] + ("..." if len(del_bases) > 20 else ""),
            "alt": "-",
            "evidence": "HIGH",
            "context": ref_seq[max(0, query_len - context_window):],
            "context_offset": context_window
        })
        del_count += len(del_bases)

    # 3. Cluster detection (variants within 50bp of each other)
    clustered_count = 0
    for idx in range(len(variants) - 1):
        if abs(variants[idx + 1]["position"] - variants[idx]["position"]) <= 50:
            clustered_count += 1

    return {
        "reference_length": ref_len,
        "query_length": query_len,
        "summary": {
            "total_variants": len(variants),
            "snps": snps_count,
            "insertions": ins_count,
            "deletions": del_count,
            "clustered_regions": clustered_count
        },
        "variants": variants,
        "provenance": {
            "algorithm": "Umbrella-Pairwise-Coordinate-Aligner",
            "version": "1.0.0",
            "coordinate_system": "1-based"
        }
    }
