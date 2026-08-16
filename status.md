---
project: the-reallocation-engine
status: active
updated: 2026-08-15
canonical: [SNICKERDOODLE.md, DOMAIN.md, AGENTS.md, outline.md, book.md, chapters/]
next:
  - "Build the Step 3 verified-data boundary table and privacy + honesty ethics-gate evidence"
  - "Obtain named-human adequacy attestations, then prepare the honest-run evidence packet"
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
**Complete the Step 3 verified-data attestation.** The two modules are now packaged as one `RUNNABLE-SAMPLE` contribution with a paired AI recipe and human card. The next deliverable is the field-by-field verified/inferred boundary plus a recorded privacy and honesty ethics gate; named-human adequacy remains separate and pending.

## Open questions / decisions pending
- **Run-envelope schema** — defined in `recipes/pipeline.md` (worked sample: `data/examples/run-envelope.json`). The remaining step is wiring the Ch.7–10 feeds to *emit* it, tied to the honest run.
- **Scorer `[VERIFY]` defaults — checked:** neither Ch.11 nor the SDD pins them (confirmed unpinned). Open *authorial* call: `role_quality: 0.0` drops the Ch.9 role-quality signal from the composite — decide whether it should carry weight (and renormalise) before real decisions.

## Recently done (2026-06-14)
- Decluttered the root; dual-licensed (MIT code / CC BY 4.0 book); set up large-file handling (samples + gitignore + a pre-commit size guard, documented in `DATA.md`); added the CLI-agnostic AI tooling guide and a repo audit under `docs/`; reconciled agentic "skill" → "recipe" across the manuscript (gap #7); defined the pipeline run-envelope schema; verified the scorer [VERIFY] weights — confirmed unpinned by Ch.11 and the SDD (#3); executed the first gated, logged honest run (#4, sample mode — awaiting your adequacy attestation).

## Recently done (2026-08-15)

- Built the Chapter 13 ATS PDF/Markdown paste-test harness with zero-config generic inspection, automatic Markdown rendering, private-by-default outputs, source-line expectation validation, optional per-field name/title/date/heading PASS/FAIL, line-aware matching, linear-order checks, JSON + Markdown audits, and explicit parser/human limits. The anonymized sample passes 13/13 fields and 1/1 order check; a deliberate broken PDF fails closed. Ten unit/integration tests pass. Human adequacy remains pending.
- Built the Chapter 11/16 gate-behavior harness around an independent six-case truth table. Production passes 6/6 cases and 40/40 assertions; exact-zero liveness and timeline both force composite 0 and Skip. A deliberate gate-as-vote mutation incorrectly promotes the two high-vote witnesses to Apply and is caught. Ten unit/integration tests pass; the original scorer CLI and ATS suite still pass. Human adequacy remains pending.
- Completed the Step 2 two-customer pair: `recipes/reallocation-verification-harness.md` supplies the nine-section executable contract, and the paired `.card.md` supplies the maintainer view with ten named failure modes. A fresh public sample run passed both positive controls, rejected both deliberate failures, and exposed/fixed a misleading FAIL-report boundary sentence. Both paired artifacts are `RUNNABLE-SAMPLE`; attestation remains null.

_Update this file at the end of each working session: state, decisions, next actions. Keep it short — it's the current-state file, not a log._
