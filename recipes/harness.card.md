---
status: RUNNABLE-SAMPLE
todos_open: 0
last_gate: "sample-run, 2026-08-15, logs/RUN_LOG.md#2026-08-15-step-2-reallocation-verification-harness"
attestation: null
recipe_version: 0.9.0
pair: recipes/harness.md
pair_version: 0.9.0
type: human-card
---

# Reallocation Verification Harness — Human Card

## Purpose

This contribution adds two narrow safety checks to The Reallocation Engine. The résumé harness checks whether ATS-relevant text survives PDF/Markdown extraction. The gate harness proves that liveness and timeline remain multipliers and catches the Chapter 16 gate-as-vote bug.

It is a validation contribution, not an end-to-end job-scoring system.

## What It Can Verify

- A supported PDF exposes a nonempty, structurally readable text layer through the pinned PDF.js parser.
- Independently declared name, title, date, and heading fields appear in the extracted text in the required order.
- Missing or scrambled declared fields make strict verification fail.
- Exact-zero liveness or timeline forces the production composite to zero and machine recommendation to `Skip`.
- Liveness and timeline are recorded as gates rather than weighted votes.
- The test suite rejects the deliberate gate-as-vote implementation.

## What It Cannot Verify

- Whether every commercial ATS parser will behave like PDF.js.
- Whether résumé claims are factually true unless a human supplies independent evidence.
- Whether a visually attractive résumé is persuasive or ready to submit.
- Whether an upstream liveness observation is current or a timeline input is legally correct.
- Whether sponsorship, fit, role quality, or the configured weights are valid for a real role.
- Whether a person should apply. That remains a human decision.

## Dependencies

| Dependency | Why it matters |
|---|---|
| Node.js and npm dependencies from `package.json` | Runs both harnesses and test suites. |
| Exact `pdfjs-dist` version declared in `package.json` | Extracts PDF text with scripting/eval disabled; update the declared version and rerun all evidence together. |
| Playwright with Chromium | Renders Markdown fixtures and résumé PDFs. |
| `resumes/aarav-patel-cv.md` | Public anonymized source of truth; render its temporary PDF under `.build/` before verification. |
| `data/examples/aarav-patel-ats-expected.json` | Independent, source-line-traced strict expectation record. |
| `data/examples/ats-paste-test-broken-render.md` | Public incomplete résumé used for the deliberate break. |
| `data/examples/gate-behavior-cases.json` | Independent Chapter 11/16 gate truth table. |
| `scripts/score/role-scorer.mjs` | Production scoring function under test. |
| `scripts/verified-data-evidence.mjs` | Reconciles every reported metric, traces numeric leaves, and checks the Step 3 privacy/mechanical-honesty gate. |
| `recipes/harness.md` | Exact execution contract paired with this card. |

## How to Run

Run from the repository root in PowerShell.

### 1. Regression tests

```powershell
npm.cmd run test:ats-parse
npm.cmd run test:gate-behavior
```

The first command checks parser normalization, field/order failures, provenance drift, generic inspection, and the public PDF integration. The second checks the six-case gate truth table, exact-zero gates, fractional scaling, policy boundary, mutation detection, and CLI report writing.

### 2. Public ATS positive control

```powershell
npm.cmd run resumes:pdf -- "resumes\aarav-patel-cv.md" ".build\ats-paste-test\aarav-patel-public.pdf"
npm.cmd run resumes:paste-test -- ".build\ats-paste-test\aarav-patel-public.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\aarav-patel"
```

Expect exit `0`, 13/13 declared fields, and 1/1 order check. Read the Markdown audit; do not accept only the console summary.

### 3. ATS deliberate break

```powershell
npm.cmd run resumes:pdf -- "data\examples\ats-paste-test-broken-render.md" ".build\ats-paste-test\broken-render.pdf"
npm.cmd run resumes:paste-test -- ".build\ats-paste-test\broken-render.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\break-attempt"
$LASTEXITCODE
```

Expect the strict verification command and `$LASTEXITCODE` to show deterministic exit `1`. Exit `0` means the harness missed the break; exit `2` means the run itself failed and is not valid break evidence.

### 4. Production gate handoff plus mutation sentinel

```powershell
npm.cmd run gate:behavior
```

Expect exit `0` only when production passes every contract assertion and both gate-as-vote witnesses are caught.

### 5. Read the reports

```powershell
Get-Content "reports\generated\ats-paste-test\aarav-patel\paste-test-audit.md"
Get-Content "reports\generated\ats-paste-test\break-attempt\paste-test-audit.md"
Get-Content "reports\generated\gate-behavior\gate-behavior-audit.md"
```

### 6. Check the complete contribution

```powershell
node scripts/conformance.mjs recipes/harness.md recipes/harness.card.md scripts/resumes scripts/score data/examples/aarav-patel-ats-expected.json data/examples/ats-paste-test-broken-render.md data/examples/gate-behavior-cases.json reports/generated/ats-paste-test reports/generated/gate-behavior package.json README.md
```

Conformance proves the files parse and compile. It does not clear human adequacy.

### 7. Generate and review the Step 3 evidence

```powershell
npm.cmd run capstone:step3
Get-Content "reports\generated\zening-teng-contribution\step3.md"
$LASTEXITCODE
npm.cmd run test:capstone-step3
npm.cmd run doctor -- --strict
```

Expect the machine evidence, privacy gate, and mechanical honesty/provenance gate to report `PASS`, while human attestation remains required. Read the boundary table and the underlying three Markdown audits yourself before clearing Step 4.

### Optional private résumé inspection

```powershell
npm.cmd run resumes:paste-test -- "resumes\<resume>.pdf"
Get-Content "private\ats-paste-test\<resume-name>\inspection-audit.md"
Get-Content "private\ats-paste-test\<resume-name>\paste-test.txt"
$LASTEXITCODE
```

Private output must remain untracked. Read `paste-test.txt` before deciding whether the résumé is adequate.

## What It Produces

| Artifact | Meaning |
|---|---|
| `reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json` | Machine-readable positive ATS result. |
| `reports/generated/ats-paste-test/aarav-patel/paste-test-audit.md` | Human-readable per-field and order result. |
| `reports/generated/ats-paste-test/break-attempt/paste-test-audit.json` | Machine-readable expected failure. |
| `reports/generated/ats-paste-test/break-attempt/paste-test-audit.md` | Human-readable deliberate-break evidence. |
| `reports/generated/gate-behavior/gate-behavior-audit.json` | Machine-readable production contract and mutation results. |
| `reports/generated/gate-behavior/gate-behavior-audit.md` | Human-readable gate handoff and limits. |
| `reports/generated/zening-teng-contribution/step3.json` | Machine-readable Step 3 checks, complete boundary, and exhaustive numeric-leaf trace. |
| `reports/generated/zening-teng-contribution/step3.md` | Human-readable Step 3 evidence and named-review handoff. |
| `reports/generated/zening-teng-contribution/step1.md` | Human-readable contribution-selection and scope record. |
| `reports/generated/zening-teng-contribution/step2.md` | Human-readable build, pair, failure, and limitation summary traced to original evidence. |
| `reports/generated/zening-teng-contribution/step5.md` | Human-readable PR readiness audit and maintainer-ready description draft; it does not prove a PR was published. |
| `private/ats-paste-test/<resume-name>/` | Private extraction and inspection artifacts for a real résumé. |
| `logs/RUN_LOG.md` | Privacy-safe record of what actually ran. |

## What Success Looks Like

- Both test suites exit `0`.
- The public ATS positive control passes every declared field and order check.
- The incomplete résumé fails deterministically and explains the missing/order evidence.
- Production gate behavior passes every case and assertion.
- The deliberate gate-as-vote implementation produces plausible but wrong nonzero Apply results for both closed-gate witnesses, and the harness marks both caught.
- Reports retain a human-review boundary; no script claims universal ATS compatibility, factual résumé truth, or a real-job decision.
- The Step 3 evidence reconciles every public metric, reports privacy and mechanical honesty/provenance PASS, and still requires a named human before Step 4.

## Failure Modes

1. **Contract violation — a gate becomes a vote.** A zero-liveness or zero-timeline witness returns a nonzero composite or Apply/Consider. Stop immediately; the production scorer has violated the Chapter 11/16 contract. Restore multiplicative gates and rerun the complete gate suite.

2. **Expectation/source contract drift.** A strict ATS expected value no longer matches its declared Markdown source line. The harness must exit `2`. Update the source and expectation together only when the underlying public résumé intentionally changes; never weaken matching merely to recover PASS.

3. **Recipe/card drift.** Commands, output paths, exit meanings, limits, or `pair_version` differ between this card and the AI recipe. Stop using both documents until they are reconciled and updated in the same commit.

4. **Verified-data contract violation.** Synthetic gate inputs, heuristic inventory, or model judgment are reported as real external records; or a number is copied from prose rather than read from a fresh script output. Reject the report, correct the provenance label, regenerate it, and record the violation.

5. **Parser PASS mistaken for universal ATS certification.** PDF.js extracts readable text, but another ATS may parse it differently. Keep the result scoped to the named parser and require a human paste/read check before submission.

6. **Presence mistaken for correct order.** Every field exists, but titles, dates, or headings are scrambled. Strict order checks must fail; do not reduce the test to document-wide substring presence.

7. **Private-data leak.** A real résumé, extracted text, expectation record, preview, or ATS search artifact appears outside `private/` or is staged. Stop, move derived artifacts to the private area, remove them from the proposed commit scope, and rerun the privacy gate. Do not copy personal details into `RUN_LOG.md`.

8. **False break evidence.** The deliberate ATS command exits `2` because the PDF is missing or the parser crashes. That is an execution error, not proof that missing fields were detected. Repair the run and require deterministic exit `1` plus a readable FAIL audit.

9. **Dependency or security drift.** PDF.js/Playwright changes alter extraction or a dependency becomes vulnerable. Re-run both suites and both sample audits after updating; never preserve an unsafe version merely to keep snapshots green.

10. **Human gate silently skipped.** All machine checks pass and someone labels the contribution adequate or verified without reading the reports. Keep `HUMAN_REVIEW_REQUIRED` and lifecycle status below `VERIFIED` until a named human records the attestation.

11. **Untraced-number or provenance-label drift.** A new numeric output is added without a script/record trace, or a controlled fixture value is mislabeled as a real record/model judgment. The Step 3 gate must fail; update the boundary/trace logic and regenerate before any run.

12. **Ethics gate run too late.** A real/private run happens before privacy and honesty evidence pass and a named human reviews it. Treat the run as invalid, do not publish its output, and repeat the gate before any replacement run.

## Maintenance and Update Trigger

Update this card and `recipes/harness.md` together whenever any command, fixture schema, output filename, exit code, parser, scoring formula, gate threshold, limitation, or failure behavior changes. Increment both `pair_version` values in the same commit and rerun the complete public sample.
