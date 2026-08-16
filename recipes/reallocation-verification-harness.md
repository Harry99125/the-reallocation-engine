---
status: RUNNABLE-SAMPLE
todos_open: 0
last_gate: "sample-run, 2026-08-15, logs/RUN_LOG.md#2026-08-15-step-2-reallocation-verification-harness"
attestation: null
recipe_version: 0.1.0
pair: recipes/reallocation-verification-harness.card.md
pair_version: 0.1.0
---

# Reallocation Verification Harness — AI Recipe

## 1. Executive Summary

Run the two capstone validation modules as one contribution:

1. Chapter 13 résumé paste-test: extract PDF text, inspect parser mechanics, and optionally verify independently declared name/title/date/heading fields and their order.
2. Chapter 11/16 gate-behavior harness: prove liveness and timeline remain multiplicative gates and detect the named gate-as-vote mutation.

Use public anonymized fixtures for the reproducible sample run. Keep every real résumé and every artifact derived from it under `private/` or another gitignored private path. This recipe verifies the two harnesses; it does not score a résumé against a real job, verify upstream sponsorship data, or clear human adequacy.

## 2. Required Reads

Read these files in order before running any command:

1. `SNICKERDOODLE.md`
2. `DOMAIN.md`
3. `_MANIFEST.md`
4. `DATA_CONTRACT.md`
5. `recipes/_shared.md`
6. `chapters/11-the-bayesian-role-scorer.md`
7. `chapters/13-resumes-that-survive-the-filter.md`
8. `chapters/16-the-build-and-the-honest-run.md`
9. `scripts/resumes/README.md`
10. `scripts/score/README.md`
11. `recipes/reallocation-verification-harness.card.md`

Treat the recipe and card as one versioned pair. If their `pair_version`, commands, outputs, or failure descriptions differ, stop for documentation drift.

## 3. Phase Gates

Do not advance past a failed gate.

| Gate | Testable handoff condition | Failure path |
|---|---|---|
| 1. Scope and provenance | The run declares `public-sample` or `private-resume`; every input path is named; public sample expectations trace to source Markdown; gate expectations trace to Chapters 11 and 16. | Stop and label the missing source. Do not substitute remembered fields or invented factors. |
| 2. Privacy and honesty | Public mode contains no private input. Private mode writes only under `private/`. No real résumé, extracted text, or `data/ats/` content is staged. Synthetic gate values are identified as controlled test inputs, not external records. | Stop before running or publishing. Move derived private output under `private/`; remove it from the proposed commit scope; record the blocker without personal details. |
| 3. Regression | Both maintained test suites exit `0`. | Stop. Record the failing test and do not regenerate success evidence. |
| 4. Positive controls | Public ATS strict verification reports all 13 declared fields and the order check passing. Production gate contract reports 6/6 cases and 40/40 assertions passing. | Stop. Treat any mismatch as a contract or fixture drift until explained and fixed. |
| 5. Deliberate breaks | The incomplete résumé exits `1` with missing/order failures. The gate-as-vote sentinel is rejected and both zero-gate witnesses are caught. | Stop. A missed break means the harness cannot detect its named failure and Step 2 is not complete. |
| 6. Output and conformance | JSON audits parse, Markdown reports exist, targeted conformance exits `0`, and the run has a privacy-safe `RUN_LOG.md` entry. | Stop. Invalid or unlogged output is not gradeable evidence. |
| 7. Human adequacy | A named human reads the extracted text, positive report, break report, and gate report and records what was observed. | Leave status at `RUNNABLE-SAMPLE`; do not self-attest or claim `VERIFIED`. |

## 4. Primary Stored Tools

Use only these maintained tools for this workflow:

| Tool | Purpose | Writes |
|---|---|---|
| `scripts/resumes/ats-parse-test.mjs` | Generic PDF/Markdown inspection and optional evidence-backed strict field verification | Private default output or the explicitly approved public sample report path |
| `scripts/resumes/ats-parse-test.test.mjs` | Résumé harness unit/integration regression suite | Temporary test output only |
| `scripts/resumes/generate-pdf.mjs` | Render the public broken Markdown fixture to a rebuildable PDF | `.build/ats-paste-test/` |
| `scripts/score/role-scorer.mjs` | Production Chapter 11 scoring function used by the contract harness | No output when imported by tests |
| `scripts/score/gate-behavior-core.mjs` | Evaluate the independent truth table and the deliberate gate-as-vote mutation | None |
| `scripts/score/gate-behavior-harness.mjs` | Generate gate machine audit and human report | `reports/generated/gate-behavior/` |
| `scripts/score/gate-behavior.test.mjs` | Gate regression, mutation, and CLI integration tests | Temporary test output only |
| `scripts/conformance.mjs` | Parse/compile the contribution artifacts | None |

No stored tool in this contribution converts a résumé plus a job description into a real-job recommendation. Report that capability as not implemented in this contribution.

## 5. Workflow

### A. Public reproducible sample

Run from the repository root in PowerShell.

1. Run both regression suites:

```powershell
npm.cmd run test:ats-parse
npm.cmd run test:gate-behavior
```

2. Run the ATS positive control against the anonymized PDF and its source-traced expectation record:

```powershell
npm.cmd run resumes:paste-test -- "output\resumes\aarav-patel-cv.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\aarav-patel"
```

3. Render and run the deliberate ATS break. Read `$LASTEXITCODE` immediately after the strict verification command; it must be `1`.

```powershell
npm.cmd run resumes:pdf -- "data\examples\ats-paste-test-broken-render.md" ".build\ats-paste-test\broken-render.pdf"
npm.cmd run resumes:paste-test -- ".build\ats-paste-test\broken-render.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\break-attempt"
$LASTEXITCODE
```

4. Run the production gate contract and its built-in deliberate mutation:

```powershell
npm.cmd run gate:behavior
```

5. Read the three human reports. Do not judge from terminal summaries alone.

```powershell
Get-Content "reports\generated\ats-paste-test\aarav-patel\paste-test-audit.md"
Get-Content "reports\generated\ats-paste-test\break-attempt\paste-test-audit.md"
Get-Content "reports\generated\gate-behavior\gate-behavior-audit.md"
```

6. Run targeted conformance:

```powershell
node scripts/conformance.mjs recipes/reallocation-verification-harness.md recipes/reallocation-verification-harness.card.md scripts/resumes scripts/score data/examples/aarav-patel-ats-expected.json data/examples/ats-paste-test-broken-render.md data/examples/gate-behavior-cases.json reports/generated/ats-paste-test reports/generated/gate-behavior package.json README.md
```

7. Append the run result to `logs/RUN_LOG.md` using the template below. Include actual observed counts and exit codes; do not copy numbers from this recipe without reading the new output.

### B. Approved private résumé inspection

Use this only after the privacy gate. A local PDF under `resumes/` is gitignored; all derived output defaults to `private/`.

```powershell
npm.cmd run resumes:paste-test -- "resumes\<resume>.pdf"
Get-Content "private\ats-paste-test\<resume-name>\inspection-audit.md"
Get-Content "private\ats-paste-test\<resume-name>\paste-test.txt"
$LASTEXITCODE
```

Read the extracted text yourself. A parser-floor PASS is not a field-correctness claim or universal ATS certification.

## 6. Output Contract

| Output | Audience | Required fields or sections | Authority |
|---|---|---|---|
| `reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json` | Machine | mode, input, parser, verdict, field results, order results, summary, limitations | Audit of the public positive run |
| `reports/generated/ats-paste-test/aarav-patel/paste-test-audit.md` | Human | summary, per-field table, order checks, parser details, limits | Human-readable view; not an adequacy verdict |
| `reports/generated/ats-paste-test/break-attempt/paste-test-audit.json` | Machine | FAIL verdict plus missing and order failures | Deliberate-break evidence |
| `reports/generated/ats-paste-test/break-attempt/paste-test-audit.md` | Human | visible failed fields/order and limits | Human-readable break evidence |
| `reports/generated/gate-behavior/gate-behavior-audit.json` | Machine | production case/assertion counts, per-check evidence, mutation result, witness failures | Chapter 11/16 mechanical handoff evidence |
| `reports/generated/gate-behavior/gate-behavior-audit.md` | Human | executable contract, production table, deliberate mutation table, limits | Human-readable handoff; remains `HUMAN_REVIEW_REQUIRED` |
| `private/ats-paste-test/<resume-name>/` | Human and local agent only | extracted text, inspection JSON/Markdown, optional rendered PDF | Private local evidence; never commit |
| `logs/RUN_LOG.md` | Maintainers | date, recipe, inputs, commands, outputs, observed results, break result, limitations | Ground-truth run history without PII |

Exit-code contract:

- `0`: expected positive test or inspection passed.
- `1`: deterministic verification failure; expected only for the deliberate ATS break.
- `2`: input, provenance, parser, rendering, or write error; never count this as a successful break.

## 7. Verification Checks

| ID | Check | Evidence required |
|---|---|---|
| VH-01 | ATS regression | Test runner exits `0`; every listed test passes. |
| VH-02 | ATS positive control | Strict audit reports 13/13 fields and 1/1 order check passing. |
| VH-03 | ATS provenance | Expectation values still match their declared source Markdown lines; any drift exits `2`. |
| VH-04 | ATS deliberate break | Strict audit exits `1`, has a FAIL verdict, and exposes missing and/or scrambled required evidence. |
| VH-05 | Gate regression | Test runner exits `0`; exact-zero liveness and timeline tests pass. |
| VH-06 | Production gate contract | Production reports 6/6 cases and 40/40 assertions passing. |
| VH-07 | Gate mutation | Deliberate gate-as-vote implementation fails the contract; both named witnesses show nonzero Apply results and are marked caught. |
| VH-08 | Vote/gate trace separation | Production trace lists liveness and timeline under gates and excludes both from weighted votes. |
| VH-09 | Privacy | No private résumé, extraction, expectation file, or `data/ats/` personal output enters the public contribution. |
| VH-10 | Human boundary | Every report distinguishes machine conformance from human adequacy and does not self-attest. |
| VH-11 | Pair drift | Recipe and card have identical `pair_version`, commands, output paths, and exit-code meanings. |
| VH-12 | Conformance | Targeted conformance exits `0` for code, JSON fixtures/audits, reports, recipe, card, package, and README. |

## 8. Logging Rules

Log every public sample run, every private real-data run without personal details, every deliberate break, every audit regeneration, every blocker, and every recipe/card version change in `logs/RUN_LOG.md`.

Use this template:

```markdown
## YYYY-MM-DD -- Reallocation verification harness

- **Recipe:** `reallocation-verification-harness` v0.1.0
- **Mode:** public-sample | private-resume
- **Inputs:** public fixture paths, or "approved private résumé; details withheld"
- **Commands:** stored command names that actually ran
- **Positive controls:** observed ATS fields/order; observed gate cases/assertions
- **Deliberate breaks:** observed exit/verdict and the failure caught
- **Outputs:** machine audits and human reports
- **Conformance:** observed file count and result
- **Human gate:** pending, or named reviewer/date/record path
- **Limits:** what the scripts could not verify
```

Never log a real name, email, phone number, résumé text, target company, application note, or private filesystem path.

## 9. Stop Conditions

Stop immediately when any of these is true:

- A required read, stored script, fixture, source Markdown, expectation record, or public PDF is missing.
- The expectation/source contract drifts or cannot be verified.
- A real résumé or derived artifact would be written outside `private/` or another approved gitignored private path.
- A private path or `data/ats/` personal artifact is staged or tracked.
- A positive regression or positive sample exits nonzero.
- The ATS deliberate break exits `0` or `2` instead of the expected deterministic `1`.
- Either gate mutation witness is not caught.
- Liveness or timeline appears in the weighted-vote trace.
- A JSON audit fails to parse, a Markdown report is missing, or conformance fails.
- Recipe and card commands, versions, outputs, or limits differ.
- Anyone asks the harness to certify universal ATS compatibility, factual résumé correctness without independent evidence, real-job sponsorship, real-job fit, visa legality, or final application worthiness.
- No named human has read the reports but the run is being described as adequate, attested, or verified.
