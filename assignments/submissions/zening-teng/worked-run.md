## Inputs you used (anonymized if drawn from private data).-- 80 days dataset

## Commands you ran, verbatim, and their real terminal output (paste it; don't describe it).
1.$    npm run ats:scan -- --dry-run

> the-reallocation-engine@1.0.0 ats:scan
> node scripts/ats/scan.mjs --dry-run

Scanning 1 companies via providers (0 local parser; 0 skipped — no provider matched)
(dry run — no files will be written)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal Scan — 2026-07-07
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Companies scanned:     1
Total jobs found:      789
Filtered by title:     347 removed
Filtered by location:  389 removed
Duplicates:            1 skipped
New offers added:      52

New offers:
  + Databricks | AI Engineer - FDE (Forward Deployed Engineer) | Remote - India
  + Databricks | Delivery Solutions Architect - Communications, Media, Entertainment & Games | United States
  + Databricks | Director, AI Forward Deployed Engineering (FDE) | United States
  + Databricks | Director, Lakebase Sales Specialists - Retail | United States
  + Databricks | Forward Deployed Engineer | Remote - India
  + Databricks | Forward Deployed Engineer - FDE (Fullstack) - Digital Native Business  | United States
  + Databricks | Lakebase Sales Specialist - Retail | United States
  + Databricks | Manager, Field Engineering - Strategic Digital Native Business | Remote - California; Remote - Colorado; Remote - Oregon; Remote - Washington
  + Databricks | Manager, Forward Deployed Engineering - CMEG | Remote - Washington D.C.
  + Databricks | Manager, Forward Deployed Engineering - Manufacturing | Remote - California
  + Databricks | Pre-sales Manager, Field Engineering - Named Accounts | Remote - Denmark
  + Databricks | Principal Security Field Engineer | Remote - California
  + Databricks | Product Marketing Director, AI | United States
  + Databricks | Product Marketing Director, Lakewatch | United States
  + Databricks | RVP, Retail | United States
  + Databricks | Senior Manager, Forward Deployed Engineering (Full Stack) x 2 New roles | Remote - France
  + Databricks | Senior Solutions Engineer | Aarhus, Denmark; Remote - Denmark
  + Databricks | Senior Specialist Solutions Architect - AI & ML Engineer | Finland; Remote - Denmark; Stockholm, Sweden
  + Databricks | Solutions Architect, Retail  | Remote - Ohio
  + Databricks | Solutions Architect, Retail - CPG | Central - United States
  + Databricks | Solutions Architect - Strategic AI Natives | Remote - California; Remote - Colorado; Remote - Oregon; Remote - Washington
  + Databricks | Specialist Solutions Architect - AI/ML | United States
  + Databricks | Specialist Solutions Architect - Data Engineering & Warehousing | United States
  + Databricks | Specialist Solutions Architect - Data Warehousing (Healthcare & Life Sciences) | Northeast - United States
  + Databricks | Sr. Delivery Solutions Architect - AI Native | Remote - California; Remote - Colorado; Remote - Oregon; Remote - Washington
  + Databricks | Sr. Director, Enterprise - Retail Vertical - Strategic Accounts  | Remote - New York
  + Databricks | Sr. Director, Field Engineering (Lakebase) | United States
  + Databricks | Sr. Engagement Manager, Forward Deployed Engineering | United States
  + Databricks | Sr. Engagement Manager, Forward Deployed Engineering - LATAM | Remote - Mexico
  + Databricks | Sr. Field Technical Program Manager, Forward Deployed Engineering | United States
  + Databricks | Sr Forward Deployed Engineer | Remote - India
  + Databricks | Sr. Forward Deployed Engineer - Communications, Media, Entertainment & Games | United States
  + Databricks | Sr. Forward Deployed Engineer - Financial Services | Central - United States
  + Databricks | Sr. Forward Deployed Engineer - Public Sector | Central - United States; Northeast - United States; Southeast - United States
  + Databricks | Sr. Manager, Field Engineering - Digital Native Business | Colorado; Remote - California; Remote - Oregon; Remote - Washington
  + Databricks | Sr. Manager, Field Engineering - Lakebase | Atlanta, Georgia; Chicago, Illinois; Dallas, Texas; New York City, New York; San Francisco, California; United States
  + Databricks | Sr. Manager, Field Engineering (Specialist) - HCLS | Northeast - United States
  + Databricks | Sr. Product Marketing Manager, Lakebase | United States
  + Databricks | Sr Security Engineer, Incident Response | Belgium; Finland; Remote - Denmark; Remote - France; Remote - Germany; Remote - Netherlands; Remote - Spain; Remote - Sweden; Remote - United Kingdom; Switzerland
  + Databricks | Sr. Solutions Architect - AI Natives Business | Remote - California; Remote - Oregon; Remote - Washington
  + Databricks | Sr. Solutions Architect, Retail | West Coast - United States
  + Databricks | Sr. Solutions Architect, Retail  | Northeast - United States
  + Databricks | Sr. Solutions Engineer | United States
  + Databricks | Sr. Solutions Engineer - AI Natives Business | Remote - California; Remote - Colorado; Remote - Oregon; Remote - Washington
  + Databricks | Sr. Specialist Solutions Architect - Data Engineering & Warehousing | United States
  + Databricks | Sr. Staff Product Security Engineer | United States
  + Databricks | Sr. Technical Marketing Engineer - Lakebase/Apps | United States
  + Databricks | Staff Enterprise Security Engineer | Remote - California
  + Databricks | Staff Security Assurance Engineer  | Remote - Washington D.C.; Washington, D.C.
  + Databricks | Staff Security Detection Engineer  | United States
  + Databricks | Strategic Core Account Executive - Retail  | Remote - Ohio
  + Databricks | Strategic Genie and AI Sales Specialist | Remote - New York

(dry run — run without --dry-run to save results)

Review new offers in data/ats/pipeline.md.

2.$ npm run doctor

> the-reallocation-engine@1.0.0 doctor
> node scripts/doctor.mjs

RECIPE DOCTOR — The Reallocation Engine
==========================================

ENVIRONMENT (required)
  ✓ node       v24.15.0
  ✓ python3    Python 3.13.9

ENVIRONMENT (optional — features degrade without these)
  ✓ pandoc     pandoc 3.8
  — libreoffice not found (PDF fallback)
  ✓ playwright installed

RUNNABLE COMMANDS (npm script → target file present?)
  ✓ verify         scripts/conformance.mjs
  ✓ manifest-check scripts/manifest-check.mjs
  ✓ eval:score     scripts/eval/score-run.mjs
  ✓ eval:report    scripts/eval/report.mjs
  ✓ doctor         scripts/doctor.mjs
  ✓ build-instructions scripts/build-instructions.mjs
  ✓ to-markdown    scripts/to-markdown.mjs
  ✓ score          scripts/score/role-scorer.mjs
  ✓ ats:dedup      scripts/ats/dedup-tracker.mjs
  ✓ ats:liveness   scripts/ats/check-liveness.mjs
  ✓ ats:merge      scripts/ats/merge-tracker.mjs
  ✓ ats:normalize  scripts/ats/normalize-statuses.mjs
  ✓ ats:scan       scripts/ats/scan.mjs
  ✓ ats:verify     scripts/ats/verify-pipeline.mjs
  ✓ resumes:pdf    scripts/resumes/generate-pdf.mjs
  ✓ svg-to-png     scripts/svg-to-png.mjs
  ✓ audit:layout   scripts/svg-layout-audit.mjs
  ✓ postsvg-to-png scripts/svg-layout-audit.mjs

DOMAIN DIRECTORIES
  ✓ data/sec
  ✓ data/bls
  ✓ data/ats
  ✓ data/80-days-to-stay
  ✓ scripts/sec
  ✓ scripts/bls
  ✓ scripts/ats
  ✓ scripts/resumes

PRIVACY (no personal data committed)
  ✓ no private/PII paths are tracked

RECIPES (43)
  with lifecycle frontmatter: 1   missing: 42
  by status: RUNNABLE-SAMPLE 1
  open TODOs: 9 declared (in frontmatter) · 526 [TODO markers in bodies
  ! missing frontmatter (42) — add: status / todos_open / last_gate / attestation / recipe_version
      apply.md
      auto-pipeline.md
      batch.md
      case-backend-swe-opt-triage.md
      case-data-ml-h1b-triage.md
      case-ds-faang-opt-runway.md
      case-fullstack-swe-sponsor-triage.md
      case-funded-systems-analyst.md
      … +34 more

SUMMARY
  environment: ✓ runnable
  recipes: 1/43 carry lifecycle frontmatter — 42 need it (gap toward DRAFT→VERIFIED discipline)
  next: backfill recipe frontmatter

3. $ npm run resumes:pdf -- --all

> the-reallocation-engine@1.0.0 resumes:pdf
> node scripts/resumes/generate-pdf.mjs --all

resumes\aarav-patel-cv.md -> output\resumes\aarav-patel-cv.pdf (2 pages)
resumes\maya-sehgal-cv.md -> output\resumes\maya-sehgal-cv.pdf (2 pages)
resumes\priya-nair-cv.md -> output\resumes\priya-nair-cv.pdf (2 pages)
resumes\rohan-desai-cv.md -> output\resumes\rohan-desai-cv.pdf (2 pages)

4.(base) PS D:\nick\the-reallocation-engine> npm run score -- data/examples/research-like-roles.json --profile data/examples/research-like-profile.json --out-dir reports/generated --md reports/generated/case-mscs-opt-research-like-ai-software-2026-07-06.md
>> 

> the-reallocation-engine@1.0.0 score
> node scripts/score/role-scorer.mjs data/examples/research-like-roles.json --profile data/examples/research-like-profile.json --out-dir reports/generated --md reports/generated/case-mscs-opt-research-like-ai-software-2026-07-06.md

✓ scored 8 roles → Apply 2 · Consider 3 · Skip 3 (skip 38%)
  reports\generated\role-scores.json  +  reports\generated\case-mscs-opt-research-like-ai-software-2026-07-06.md

  5.(base) PS D:\nick\the-reallocation-engine> npm run ats:liveness -- https://www.databricks.com/company/careers/engineering---pipeline/software-engineer---genai-inference--8202670002          

> the-reallocation-engine@1.0.0 ats:liveness
> node scripts/ats/check-liveness.mjs https://www.databricks.com/company/careers/engineering---pipeline/software-engineer---genai-inference--8202670002

Checking 1 URL(s)...

✅ active     https://www.databricks.com/company/careers/engineering---pipeline/software-engineer---genai-inference--8202670002

Results: 1 active  0 expired  0 uncertain

  
Verified vs. inferred — a line-by-line split of what the data/scripts established versus what you or an LLM judged.
Verification — how you confirmed the output was real: re-ran with --dry-run, parsed the JSON, cross-checked a count against the source, deliberately tried to break it (see the Attestation format).
Reflection — what went well, what the mode got wrong or missed, and your next steps. Nothing is perfect; say where yours isn't.

## Attestation
- Recipe: `opt-research-like-job` v0.2.0
- By: Zening Teng · 2026-07-07

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run ats:scan -- --dry-run` | 1 company scanned, 789 jobs found, 52 new, live Databricks/Greenhouse data, no files written | Real ATS liveness surface, side-effect-free ✓ |
| `npm run doctor` | environment ✓ runnable (node + python3), privacy ✓ no PII/private paths tracked | Env + privacy gate green before submit ✓ |
| `npm run score -- data/examples/research-like-roles.json --profile data/examples/research-like-profile.json` | 8 roles → Apply 2 · Consider 3 · Skip 3 (skip 38%); 2 roles gated to composite 0.000 | Ranked table with per-term sourced audit trace ✓ |
| `npm run ats:liveness -- <Databricks GenAI Inference SWE URL>` | `✅ active` · Results: 1 active 0 expired | Confirm a posting is live before setting `liveness.factor = 1.0` ✓ |
| BREAK: malformed JSON input (`[{ "role_id": "bad",, }]`) | JSON parse error, `exit=1`, no output written | Halt the run, don't emit a garbage score ✓ |
| BREAK: citizen profile (`authorization: "us citizen"`) | sponsorship weight → 0; Apply 2→0, Consider 3→4, skip 38%→50% | Profile-conditional weighting flips the ranking — mode is visa-aware ✓ |

### Did not test
- No live H-1B join — `sponsorship.p`/`.tier` are illustrative fixtures, not a real lookup against `data/80-days-to-stay/` (that join is `[TODO: DATA SOURCE]`).
- The `liveness.factor` values inside `research-like-roles.json` are hand-set; I proved the liveness surface on one real Databricks URL but did not wire per-URL liveness into the score run.
- The proposed `.py` enrichment scripts were not built or run — they remain typed `[TODO: DEV]`.
- `role_quality` (weight 0) was not exercised — the Ch.9 / O*NET signal contributes nothing today (repo gap #3).
- `npm run resumes:pdf` ran on the repo's example CVs (aarav-patel etc.), not on my own résumé and not part of this mode's decision path.

### Broke during testing, fixed
- Unbalanced code fence in the original draft recipe: the ```` ```json ```` agent-log block was never closed → `conformance.mjs` reported "unbalanced code fences" and the file was ungradeable. Fixed in the rewrite; `node scripts/conformance.mjs` now exits 0 (`✓ all conform`).
- `python3` not on PATH — only Anaconda `python` was, so `conformance.mjs`'s `python3 -m py_compile` failed on all 30 `.py` files + `metadata.yaml`. Fixed by adding a `python3.exe` shim in the on-PATH Anaconda folder; `npm run doctor` now shows `✓ python3 Python 3.13.9` and the environment reads `✓ runnable`.