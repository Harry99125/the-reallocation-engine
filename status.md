---
project: the-reallocation-engine
status: active
updated: 2026-08-16
canonical: [SNICKERDOODLE.md, DOMAIN.md, AGENTS.md, outline.md, book.md, chapters/]
next:
  - "Named human reads the Step 3 evidence and records the privacy/honesty adequacy attestation"
  - "After that gate clears, execute and package the Step 4 honest run"
blocked_by: null
---

# Status — The Reallocation Engine

_Read this first for current state._ `DOMAIN.md` = what the repo **is**; `logs/RUN_LOG.md` = the full **history**; this file = **where we are now and what's next**.

## Where things stand
- **Manuscript:** 21 chapter files drafted (`chapters/00`–`99`), introduction through back matter.
- **Pipeline (runnable today):** SEC Form D, BLS/O*NET extracts, ATS scan/liveness, resumes → PDF, the Ch.11 Bayesian role scorer (`npm run score`), plus `npm run doctor` and `npm run verify`.
- **Context architecture:** root `AGENTS.md`/`CLAUDE.md` compile from `instructions/` modules; `.claude/` hooks (archive-guard + conformance) and a CI drift-guard are in place.
- **Data:** full SEC/BLS datasets are gitignored; small samples are shipped — see `DATA.md`.
- **Recipes:** all 42 carry lifecycle frontmatter; all are still `status: DRAFT`.

## The one thing that matters next
**Clear the named-human Step 3 gate.** The machine evidence packet now contains the complete field-family boundary, exhaustive numeric trace, metric reconciliation, and passing privacy/mechanical-honesty checks. A named human must read that evidence and record the honesty/adequacy decision before Step 4 can start.

## Open questions / decisions pending
- **Run-envelope schema** — defined in `recipes/pipeline.md` (worked sample: `data/examples/run-envelope.json`). The remaining step is wiring the Ch.7–10 feeds to *emit* it, tied to the honest run.
- **Scorer `[VERIFY]` defaults — checked:** neither Ch.11 nor the SDD pins them (confirmed unpinned). Open *authorial* call: `role_quality: 0.0` drops the Ch.9 role-quality signal from the composite — decide whether it should carry weight (and renormalise) before real decisions.

## Recently done (2026-06-14)
- Decluttered the root; dual-licensed (MIT code / CC BY 4.0 book); set up large-file handling (samples + gitignore + a pre-commit size guard, documented in `DATA.md`); added the CLI-agnostic AI tooling guide and a repo audit under `docs/`; reconciled agentic "skill" → "recipe" across the manuscript (gap #7); defined the pipeline run-envelope schema; verified the scorer [VERIFY] weights — confirmed unpinned by Ch.11 and the SDD (#3); executed the first gated, logged honest run (#4, sample mode — awaiting your adequacy attestation).

## Recently done (2026-08-15)

- Built the Chapter 13 ATS PDF/Markdown paste-test harness with zero-config generic inspection, automatic Markdown rendering, private-by-default outputs, source-line expectation validation, optional per-field name/title/date/heading PASS/FAIL, line-aware matching, linear-order checks, JSON + Markdown audits, and explicit parser/human limits. The anonymized sample passes 13/13 fields and 1/1 order check; a deliberate broken PDF fails closed. Ten unit/integration tests pass. Human adequacy remains pending.
- Built the Chapter 11/16 gate-behavior harness around an independent six-case truth table. Production passes 6/6 cases and 40/40 assertions; exact-zero liveness and timeline both force composite 0 and Skip. A deliberate gate-as-vote mutation incorrectly promotes the two high-vote witnesses to Apply and is caught. Ten unit/integration tests pass; the original scorer CLI and ATS suite still pass. Human adequacy remains pending.
- Completed the Step 2 two-customer pair: `recipes/Zening-AIRecipe.md` supplies the nine-section executable contract, and `recipes/Zening.card.md` supplies the maintainer view with thirteen named failure modes. A fresh public sample run passed both positive controls, rejected both deliberate failures, and exposed/fixed a misleading FAIL-report boundary sentence. Both paired artifacts are `RUNNABLE-SAMPLE`; attestation remains null.
- Built the Step 3 machine evidence gate: every public metric is recomputed, every numeric audit leaf traces to a script and record, controlled values are labeled `local-evidence`, and privacy plus mechanical honesty/provenance pass. The evidence-gate suite passes 4/4 mutation tests. Strict doctor is now clean on Windows after Python/Git/CRLF portability fixes. Named-human attestation is the only remaining Step 3 gate; Step 4 has not started.
- Completed the Step 6 employer-facing case study in two formats: `reports/generated/zening-teng-contribution/step6.md` and the responsive single-page site `step6.html`. Both use the script-backed 2/2 detection of the named gate-as-vote mutation witnesses and include the architecture, verified/inferred boundary, failure modes, limitation, and runnable demo without claiming a PR or real-world adequacy. The HTML version follows the repository visual system and includes responsive, dark-mode, reduced-motion, and print behavior.
- Rewrote all existing capstone human reports and the Step 6 site in short, plain language. Tables now appear only where they carry test results or the Step 3 evidence fields required by the assignment. The underlying scripts, evidence counts, privacy boundary, and incomplete Step 3/4/5 status remain unchanged.

_Update this file at the end of each working session: state, decisions, next actions. Keep it short — it's the current-state file, not a log._
