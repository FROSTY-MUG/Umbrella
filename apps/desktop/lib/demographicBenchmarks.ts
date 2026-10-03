// =============================================================================
//  Umbrella OS — Demographic DNA Benchmark Engine & Clinical Baselines
// =============================================================================

export type GenderKaryotype = "male_xy" | "female_xx" | "universal_mosaic";

export type AgeBracketId = "pediatric" | "young_adult" | "adult" | "senior" | "geriatric";

export interface AgeBracketDef {
  id: AgeBracketId;
  label: string;
  rangeLabel: string;
  minAge: number;
  maxAge: number;
  description: string;
  expectedTelomereKbp: number; // Mean telomere length in kilobase pairs
  telomereStdDev: number;
  somaticMutationBurdenPerMb: number; // expected somatic variants per Mb
  epigeneticDriftFactor: number;
  primaryBiologicalMilestone: string;
  cellularRepairEfficiency: number; // % 0-100
}

export interface DemographicCohortBenchmark {
  gender: GenderKaryotype;
  ageBracket: AgeBracketId;
  label: string;
  baselineGC: number; // % e.g. 41.2%
  baselineTiTv: number; // Transition/Transversion ratio e.g. 2.12
  expectedTelomereKbp: number;
  telomerePercentileThresholds: { p10: number; p50: number; p90: number };
  somaticBurdenMedianPerMb: number;
  mitochondrialHeteroplasmyBaseline: number; // %
  longevityScoreBaseline: number; // 0-100
  keyCohortBiomarkers: {
    gene: string;
    variant: string;
    clinicalSignificance: string;
    expectedCohortFreq: string;
  }[];
}

export const AGE_BRACKETS: AgeBracketDef[] = [
  {
    id: "pediatric",
    label: "Pediatric",
    rangeLabel: "0 - 17 yrs",
    minAge: 0,
    maxAge: 17,
    description: "High telomeric reserve, developmental gene expression, zero clonal hematopoiesis.",
    expectedTelomereKbp: 11.4,
    telomereStdDev: 0.8,
    somaticMutationBurdenPerMb: 0.18,
    epigeneticDriftFactor: 0.02,
    primaryBiologicalMilestone: "Peak telomerase activity & maximum double-strand break repair.",
    cellularRepairEfficiency: 99.4
  },
  {
    id: "young_adult",
    label: "Young Adult",
    rangeLabel: "18 - 35 yrs",
    minAge: 18,
    maxAge: 35,
    description: "Peak physiological homeostasis, minimal somatic mosaicism, optimal DNA repair.",
    expectedTelomereKbp: 9.3,
    telomereStdDev: 0.7,
    somaticMutationBurdenPerMb: 0.42,
    epigeneticDriftFactor: 0.15,
    primaryBiologicalMilestone: "Metabolic DNA homeostasis; optimal antioxidant defense enzymes (SOD2/CAT).",
    cellularRepairEfficiency: 95.8
  },
  {
    id: "adult",
    label: "Adult",
    rangeLabel: "36 - 55 yrs",
    minAge: 36,
    maxAge: 55,
    description: "Mid-life epigenetic methylation inflection, steady telomeric decline, oxidative stress.",
    expectedTelomereKbp: 7.5,
    telomereStdDev: 0.65,
    somaticMutationBurdenPerMb: 1.15,
    epigeneticDriftFactor: 0.45,
    primaryBiologicalMilestone: "Horvath clock methylation divergence; cumulative C>T deamination onset.",
    cellularRepairEfficiency: 86.2
  },
  {
    id: "senior",
    label: "Senior",
    rangeLabel: "56 - 70 yrs",
    minAge: 56,
    maxAge: 70,
    description: "Shortened telomeric caps, immunosenescence markers, somatic copy number variations.",
    expectedTelomereKbp: 5.8,
    telomereStdDev: 0.6,
    somaticMutationBurdenPerMb: 2.85,
    epigeneticDriftFactor: 0.78,
    primaryBiologicalMilestone: "Elevated inflammatory cytokine alleles (IL-6/TNF); senescent cell accumulation.",
    cellularRepairEfficiency: 71.5
  },
  {
    id: "geriatric",
    label: "Geriatric",
    rangeLabel: "70+ yrs",
    minAge: 71,
    maxAge: 110,
    description: "Critical telomere threshold, high somatic mosaicism, extreme longevity selection.",
    expectedTelomereKbp: 4.3,
    telomereStdDev: 0.55,
    somaticMutationBurdenPerMb: 5.4,
    epigeneticDriftFactor: 0.95,
    primaryBiologicalMilestone: "FOXO3A & SIRT1 longevity allele enrichment in resilient survivor cohorts.",
    cellularRepairEfficiency: 54.0
  }
];

export const GENDER_PROFILES: {
  id: GenderKaryotype;
  label: string;
  karyotype: string;
  description: string;
  iconType: "mars" | "venus" | "atom";
  chromosomes: string;
}[] = [
  {
    id: "male_xy",
    label: "Male",
    karyotype: "46, XY",
    description: "Y-chromosome specific markers (SRY, AZF microdeletions), X-linked hemizygous profile.",
    iconType: "mars",
    chromosomes: "22 Autosomes + XY"
  },
  {
    id: "female_xx",
    label: "Female",
    karyotype: "46, XX",
    description: "X-inactivation (XIST) Lyonization balance, estrogen metabolism (CYP1A1/COMT), mtDNA lineage.",
    iconType: "venus",
    chromosomes: "22 Autosomes + XX"
  },
  {
    id: "universal_mosaic",
    label: "Non-Binary / Universal",
    karyotype: "Unified 46, XX/XY",
    description: "Harmonized pan-demographic reference avoiding gender-bias priors; balanced autosomal metrics.",
    iconType: "atom",
    chromosomes: "Balanced Autosomal Matrix"
  }
];

export function getDemographicBenchmark(
  gender: GenderKaryotype,
  age: number
): DemographicCohortBenchmark {
  const bracket =
    AGE_BRACKETS.find((b) => age >= b.minAge && age <= b.maxAge) || AGE_BRACKETS[2];

  // Tailored baseline adjustments per gender
  const isFemale = gender === "female_xx";
  const isMale = gender === "male_xy";

  // Females on average possess slightly longer telomeres (~0.3-0.5 kbp advantage in human cohorts)
  const telomereAdj = isFemale ? 0.35 : isMale ? -0.15 : 0.0;
  const baseTelomere = +(bracket.expectedTelomereKbp + telomereAdj).toFixed(2);

  return {
    gender,
    ageBracket: bracket.id,
    label: `${gender === "female_xx" ? "Female (46,XX)" : gender === "male_xy" ? "Male (46,XY)" : "Universal"} // Cohort: ${bracket.label} (${bracket.rangeLabel})`,
    baselineGC: isFemale ? 41.2 : 40.9,
    baselineTiTv: 2.12,
    expectedTelomereKbp: baseTelomere,
    telomerePercentileThresholds: {
      p10: +(baseTelomere - bracket.telomereStdDev * 1.28).toFixed(2),
      p50: baseTelomere,
      p90: +(baseTelomere + bracket.telomereStdDev * 1.28).toFixed(2)
    },
    somaticBurdenMedianPerMb: bracket.somaticMutationBurdenPerMb,
    mitochondrialHeteroplasmyBaseline: +(0.8 + bracket.epigeneticDriftFactor * 2.1).toFixed(2),
    longevityScoreBaseline: +(72 - bracket.epigeneticDriftFactor * 14).toFixed(1),
    keyCohortBiomarkers: [
      {
        gene: "TERT",
        variant: "rs2853669 C>T",
        clinicalSignificance: "Telomerase reverse transcriptase promoter expression",
        expectedCohortFreq: isFemale ? "42.1%" : "39.8%"
      },
      {
        gene: "FOXO3",
        variant: "rs2802292 G>T",
        clinicalSignificance: "Forkhead transcription factor longevity locus",
        expectedCohortFreq: bracket.id === "geriatric" ? "54.2%" : "31.4%"
      },
      {
        gene: "APOE",
        variant: "e3/e3 reference",
        clinicalSignificance: "Apolipoprotein E lipid clearance and neurovascular integrity",
        expectedCohortFreq: "78.4%"
      },
      {
        gene: isFemale ? "BRCA1 / XIST" : "AR / SRY",
        variant: isFemale ? "17q21.31 Lyonization" : "Xq12 CAG Repeat Median",
        clinicalSignificance: isFemale ? "X-chromosome skewing & homologous recombination" : "Androgen receptor sensitivity & male hormonal genomic baseline",
        expectedCohortFreq: "Cohort Reference"
      }
    ]
  };
}

// Preset clinical reference cases for one-click testing
export interface PresetSubject {
  id: string;
  name: string;
  chronologicalAge: number;
  gender: GenderKaryotype;
  ancestry: string;
  notes: string;
  clinicalFocus: string;
  dnaSequenceSnippet: string;
}

export const PRESET_SUBJECTS: PresetSubject[] = [
  {
    id: "SUBJ-28F-ATHLETE",
    name: "Elena Rostova",
    chronologicalAge: 28,
    gender: "female_xx",
    ancestry: "European (EUR / GBR)",
    notes: "Elite aerobic athlete. Demonstrates exceptional telomere preservation (+1.8 kbp above cohort).",
    clinicalFocus: "Longevity & Cellular Reserve Audit",
    dnaSequenceSnippet:
      "TTAGGG TTAGGG TTAGGG ATCGATCG TACGATCG ATCGGCTA TTAGGG TTAGGG CCGATCGT AACGTTGC ATCGATCG TTAGGG TTAGGG GCTAGCTA TTACGGAT CGATCGAT TTAGGG TTAGGG ATCGATCG"
  },
  {
    id: "SUBJ-64M-CARDIAC",
    name: "Marcus Vance",
    chronologicalAge: 64,
    gender: "male_xy",
    ancestry: "Admixed American (AMR / PUR)",
    notes: "Chronic metabolic stress; elevated somatic variant load and shortened telomeric caps.",
    clinicalFocus: "Cardiometabolic Risk & Epigenetic Clock Acceleration",
    dnaSequenceSnippet:
      "ATCGATCG CCGATCGT CCTAGCTA AACGTTGC ATCGGCTA CCGATCGT ATCGATCG GCTAGCTA CGATCGAT CCGATCGT ATCGATCG AACGTTGC CCGATCGT ATCGATCG CGATCGAT CCGATCGT ATCGATCG"
  },
  {
    id: "SUBJ-42M-STABLE",
    name: "Dr. Liam Chen",
    chronologicalAge: 42,
    gender: "male_xy",
    ancestry: "East Asian (EAS / CHB)",
    notes: "Near-ideal alignment with middle-adult benchmark; minimal epigenetic drift.",
    clinicalFocus: "Routine Preventative Multi-Omic Healthscreen",
    dnaSequenceSnippet:
      "TTAGGG ATCGATCG CCGATCGT GCTAGCTA TTAGGG AACGTTGC ATCGGCTA CGATCGAT TTAGGG ATCGATCG CCGATCGT GCTAGCTA TTAGGG AACGTTGC ATCGGCTA CGATCGAT TTAGGG ATCGATCG"
  },
  {
    id: "SUBJ-102F-CENTENARIAN",
    name: "Margaret Campbell (Centenarian H104)",
    chronologicalAge: 102,
    gender: "female_xx",
    ancestry: "Global Consensus Reference",
    notes: "Super-centenarian cohort. Extreme enrichment of FOXO3 longevity alleles and resilient DSBR.",
    clinicalFocus: "Extreme Longevity Genetics & DNA Repair Resilience",
    dnaSequenceSnippet:
      "TTAGGG TTAGGG ATCGGCTA FOXO3_T FOXO3_T TTAGGG TTAGGG CCGATCGT TTAGGG TTAGGG AACGTTGC TTAGGG TTAGGG GCTAGCTA TTAGGG TTAGGG CGATCGAT TTAGGG TTAGGG ATCGATCG"
  }
];
