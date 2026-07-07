# RUN_LOG entry — `opt-research-like-job`

> Append this block to `logs/RUN_LOG.md`. No secrets, no personal contact
> details, no private application notes (per SNICKERDOODLE.md logging rules).

## 2026-07-06 -- Mode build: `opt-research-like-job` (sample run)

- Recipe: `opt-research-like-job` (F-1 MSCS/MSIS student, pre-OPT; research-like AI-era software roles). Mode: sample. Run id: `opt-research-like-job-2026-07-06-001`. Renamed from the untracked draft `recipes/research-like job searching.md` (DRAFT, 12 open TODOs, all-proposed `.py` scripts) and re-grounded on a script that runs today. Status DRAFT → RUNNABLE-SAMPLE.
- Commands (verbatim, stored scripts — no ad-hoc code):
  - `npm run score -- data/examples/research-like-roles.json --profile data/examples/research-like-profile.json --out-dir reports/generated --md reports/generated/opt-research-like-job-2026-07-06.md`
  - Control: `npm run score -- data/examples/ch11-roles.json` (reproduces Ch.11)
  - Liveness surface: `npm run ats:scan -- --dry-run` (real live Greenhouse data, no writes)
- Inputs: anonymized fixtures `data/examples/research-like-roles.json` (8 roles) + `data/examples/research-like-profile.json` (`needs_sponsorship = true`). No personal data.
- Gates: 1 Source ✓ · 2 Scope ✓ (sample) · 3 Data-shape ✓ · 4 Script-readiness ✓ · 5 Approval n/a · 6 Liveness ✓ (fired: ghost posting → Skip) · 7 Timeline ✓ (fired: early start → Skip) · 8 Report ✓. Human adequacy gate: PENDING attestation (drafted in worked-run.md).
- Result: 8 roles → Apply 2 · Consider 3 · Skip 3 (skip 38%). 2 roles gated to composite 0.000 as designed. Control run reproduces Ch.11. Output fully sourced (record / model-judgment / your-input).
- Break tests: missing file → exit 2; malformed JSON → exit 1 (halts, no garbage); override without reason → ignored + warned; citizen profile → sponsorship weight → 0, skip 38% → 50% (profile-conditional weighting verified).
- Artifacts: `recipes/opt-research-like-job.md`, `logs/case-mscs-opt-research-like-ai-software-2026-07-06.json` (agent log), `reports/generated/case-mscs-opt-research-like-ai-software-2026-07-06.{md,json}`, `data/examples/research-like-{roles,profile}.json`, `assignments/submissions/zening-teng/{domain-justification,worked-run,run-log-entry}.md`.
- Fixed: unbalanced ```` ``` ```` code fence in the original draft (conformance "unbalanced code fences") — recipe now passes conformance. Also fixed a pre-existing env issue: `python3` was not on PATH (only Anaconda `python`), so `conformance.mjs`'s `python3 -m py_compile` failed on all 30 `.py` files + `metadata.yaml`; added a `python3.exe` shim in the on-PATH Anaconda folder → `node scripts/conformance.mjs` now exits 0 (`✓ all conform`).
- Open issues: skip-rate 38% < 50% (curated fixture, not a live board); `role_quality` weight 0 [VERIFY] drops the Ch.9/O*NET signal (repo gap #3); `sponsorship`/`liveness` values are illustrative fixtures, not live joins ([TODO: DATA SOURCE]); proposed `.py` enrichment scripts remain [TODO: DEV]. Promotion past RUNNABLE-SAMPLE requires a live-data run with a human clearing gates 6 & 7, plus attestation.
