# Umbrella OS

AI-Native Computational Biology Operating System

## What It Is
Umbrella OS is an advanced, fully integrated desktop operating system built entirely for the web. It is designed specifically for computational biology, sequence analysis, and real-time genomic exploration. 

Unlike traditional bioinformatics pipelines which rely on disparate CLI tools, disjointed web servers, and static reports, Umbrella OS unifies high-performance algorithms into a single immersive graphical environment. It behaves exactly like a native operating system (complete with draggable windows, taskbars, and real-time multitasking) while running directly in your browser.

At its core, it hosts an ecosystem of native scientific applications capable of 3D genomic visualization, antimicrobial resistance (AMR) detection, targeted mutagenesis simulation, and biophysical stress modeling.

## How It Works
The system operates on a highly decoupled, modern microservice architecture:
1. **The Web OS (Frontend)**: Built with React, Next.js, and Zustand, it renders a high-performance window manager and handles complex WebGL/Canvas data visualizations (e.g., rendering millions of base pairs instantly).
2. **The Compute Core (Backend)**: A Python FastAPI application that acts as the secure gatekeeper. It handles authentication, data validation, and routing.
3. **The Data Lake**: PostgreSQL manages relational metadata, RBAC, and provenance trails, while massive raw genomic files (FASTA/FASTQ) are streamed securely to and from an S3-compatible Object Storage (MinIO).
4. **Asynchronous Workers**: Heavy bioinformatics jobs (like sequence alignment) are offloaded to Python Celery workers via a Redis queue, ensuring the UI remains perfectly fluid regardless of the computational load.
5. **AI Orchestration (Vella)**: Powered by Google Gemini, Vella is an AI agent embedded in the OS. It interprets natural language commands, selects the appropriate internal APIs, executes pipelines, and synthesizes the data into grounded scientific explanations.

## Why It Was Made
Bioinformatics suffers from extreme fragmentation. Researchers often spend more time wrestling with software dependencies, bash scripts, and data formats than analyzing biological realities. 

Umbrella OS was created to solve this by providing a "zero-friction" environment. We built it to:
- **Democratize Sequence Analysis**: Provide researchers with an intuitive, visual interface for complex genetic comparisons.
- **Ensure Absolute Reproducibility**: Introduce strict, cryptographic data provenance so that every simulation and report can be traced back to its raw origins and exact software versions.
- **Pioneer AI-Assisted Research**: Prove that Large Language Models (LLMs) can be safely integrated into scientific workflows not just as chatbots, but as verifiable orchestration engines that execute real computational pipelines securely.

---

## DEMO / LOCAL AUTHORIZATION

To enter the Umbrella OS environment during local development or in demonstration deployments, you must pass the initial cinematic boot sequence.

**Authorization ID to enter the site**: `058726110`

*Note: This is a demonstration authorization mechanism explicitly hardcoded for showcase purposes. It is NOT a substitute for production authentication. In a real-world, clinical, or enterprise deployment, this ID barrier is removed and replaced entirely by secure OAuth 2.0 or Enterprise SSO integrations.*

---

## System Structure & Applications

The OS ecosystem currently ships with the following deeply integrated applications:

### 1. GENOME ANALYSIS
**Genome Analyzer**: The core sequence viewer handles gigabytes of nucleotide data seamlessly. It allows users to jump instantly to critical structural landmarks (ORIGIN, TERMINUS, GC SKEW MAX, REPLICATION FORK) and visualizes the raw sequence in an ATGC matrix.

### 2. AMR SURVEILLANCE
**AMR Sentinel**: Scans sequences for known antimicrobial resistance genes, virulence factors, and stress response elements. Results are cross-referenced with a unified pathogen database to present an immediate threat analysis and drug panel overview.

### 3. SEQUENCE COMPARISON
**Genome Competitor**: Users can overlay a query sequence against a canonical reference sequence. The visualization engine highlights Structural Variations (SVs), Single Nucleotide Polymorphisms (SNPs), and Insertions/Deletions (INDELs) in a responsive 3D space powered by WebGL/Three.js.

### 4. MUTATION ANALYSIS
**Mutation Lab**: Simulates targeted edits on a given sequence. By programmatically introducing base transversions and transitions, the system computes simulated viability scores (PASS/FAIL), evaluating if essential replication mechanics are compromised.

### 5. COMPUTATIONAL SIMULATION
**Stress Lab**: Simulates bacterial response curves against environmental stressors (Heat Shock, Chemical Mutagen, Radiation). It dynamically models Gompertz growth curves over simulated time.

### 6. SCIENTIFIC RESEARCH
**Sample Vault / Sample Board**: The persistent cross-application memory bank. Umbrella OS inherently links samples to their provenance, origin metadata, QC status, and computational history.

### 7. AI ORCHESTRATION
**Vella**: The resident AI intent engine. It possesses tool-calling permissions across the entire OS, allowing it to autonomously spin up analysis modules, run comparisons, fetch logs, and synthesize multi-modal scientific conclusions.

### 8. REPRODUCIBLE REPORTING
**Report Studio**: Every generated insight and model prediction can be bundled into a verifiable dossier, locking software versions and raw data hashes in an immutable record.

---

## Development & Deployment
For detailed guides on spinning up the infrastructure, refer to our comprehensive documentation suite:
- `docs/ARCHITECTURE.md` - In-depth microservice topology.
- `docs/SYSTEM_WORKFLOW.md` - Step-by-step lifecycles of data processing.
- `docs/DATA_AND_PROVENANCE.md` - Data lineage and cryptographic hashing details.
- `docs/DEVELOPMENT.md` - Local Docker Compose and script execution instructions.
- `docs/DEPLOYMENT.md` - Cloud architecture mapping for Vercel, Render, and S3.

## Live Production Environments
- **Frontend OS**: [https://umbrella-os.vercel.app](https://umbrella-os.vercel.app)
- **Backend API**: *(Deploy via Render Dashboard using Github integration)*

## Scientific Limitations
This system is strictly intended for **computational biology research, education, and simulation**. Results are computed models and statistical inferences, NOT ground-truth laboratory observations. The system provides heuristic guidance based on input algorithms. Always validate theoretical findings in a physical wet-lab environment before clinical or applied scientific use.

## Contributors
See `AUTHORS.md`.

## License
Proprietary / Open Source Hybrid (See LICENSE).
