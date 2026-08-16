# Step 1 — Contribution Selection

## Decision

The selected contribution is **Reallocation Verification Harness**, one unified validation contribution with two tightly scoped submodules:

- Chapter 11/16 gate-behavior harness: prove that liveness and timeline are multipliers and catch the named gate-as-vote failure.
- Chapter 13 ATS paste-test harness: extract résumé PDF/Markdown text and report deterministic field/order results.

This scope came from the student's explicit project choice (`your-input`). The unified packaging decision also came from the student: one recipe/card pair covers both submodules.

## Why this clears the selection bar

| Assignment bar | Planned implementation | Boundary |
|---|---|---|
| Real repository contribution | Maintained scripts under lowercase `scripts/`, fixtures under `data/examples/`, audits under `reports/generated/` | No prompt-only or finding-shaped substitute |
| Every number traces | ATS figures derive from extracted-text records; gate figures derive from a controlled truth table and production scorer output | Controlled values are `local-evidence`, not real job records |
| Two-customer pair | One imperative AI recipe plus one human `.card.md` | Both are versioned and updated together |
| Phase gates | Privacy, provenance, regression, positive-control, deliberate-break, conformance, and human-review handoffs | Every failure path stops the workflow |
| Audits and logging | JSON machine audits, Markdown human reports, and `logs/RUN_LOG.md` entries | Reports do not replace underlying records |
| Privacy | Real résumé inputs and derived artifacts remain under gitignored private paths | No personal résumé content enters this report |
| Honest limitation | The harnesses verify mechanics, not universal ATS behavior, résumé truth, live-job truth, visa legality, or whether to apply | Missing evidence remains missing |

## Relevant chapters and sources

- `chapters/11-the-bayesian-role-scorer.md`
- `chapters/13-resumes-that-survive-the-filter.md`
- `chapters/16-the-build-and-the-honest-run.md`
- Capstone assignment supplied by the student
- Repository governance: `SNICKERDOODLE.md`, `DOMAIN.md`, `_MANIFEST.md`, and `DATA_CONTRACT.md`

## Scope boundary

The contribution tests two dangerous seams in the engine. It does not build a new external data connector, calculate real sponsorship probabilities, give immigration advice, certify every commercial ATS, or make the final application decision.

## Step status

**Complete.** The student selected and retained this scope. Implementation evidence is summarized in `step2.md`.

## Record note

This report was added after implementation at the student's request for one plainly named report per material capstone step. It summarizes the recorded selection; it is not presented as contemporaneous terminal output.
