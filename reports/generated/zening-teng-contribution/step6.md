# Keeping Hard Gates Hard

## Verification infrastructure for an evidence-first job-search engine

**Zening Teng — Software Engineering Case Study**

[Open the responsive single-page site](step6.html).

An international student on an OPT timeline cannot afford to spend a day on an application that should have been rejected in seconds. The Reallocation Engine addresses that allocation problem with evidence from job-posting liveness, visa timing, sponsorship history, role quality, and other signals. Two quiet failures remained especially dangerous: a résumé PDF could look polished while its text parsed incorrectly, and a supposedly hard eligibility gate could be implemented as one more weighted vote.

I developed a unified verification contribution that turns both risks into executable contracts. It tests résumé extraction field by field, proves that liveness and timeline gates retain veto power in the production scorer, deliberately injects the named gate-as-vote bug, and emits machine-readable evidence without making the human decision for the user.

> **Primary result:** the harness caught **2 of 2 named zero-gate mutation witnesses**. Under the deliberately wrong implementation, the two roles received plausible-looking `0.80 / Apply` and `0.85 / Apply` results; the contract rejected both.

## The problem

The specific user is an early-career international candidate deciding where to spend limited application effort. That person faces two forms of information asymmetry.

First, a recruiter or applicant-tracking system does not evaluate the same visual résumé the candidate sees. It consumes extracted text. A PDF can appear correct while dropping a heading, separating a date from its role, or returning sections in the wrong order. Visual confidence is not extraction evidence.

Second, the scoring engine combines several signals, but liveness and visa timeline are not ordinary preferences. If the posting is closed or the start date is infeasible, a high sponsorship or role-quality score must not rescue it. Treating a gate as another weighted feature can produce a polished, numerically plausible `Apply` recommendation that is structurally wrong.

The repository documented both contracts, but documentation alone could not prove that later code changes preserved them. The missing control was an automated harness that passed on the production behavior and failed on the exact bug it was designed to prevent.

## What I built

The contribution is one verification system with three connected layers.

### 1. ATS paste-test and parse harness

The ATS layer accepts PDF or Markdown input. Markdown is rendered through the repository's maintained Playwright workflow; PDF.js then extracts the text layer with scripting and dynamic evaluation disabled. In generic inspection mode, the tool checks parser mechanics, character integrity, line structure, and common résumé signals while retaining `HUMAN_REVIEW_REQUIRED`.

Strict verification mode adds an independent expectation record. Each required name, title, date, or heading points back to a specific line in the public source Markdown. The harness validates that source relationship before evaluating the PDF, then reports per-field presence and declared reading order. A missing field is a deterministic failure, and a source/expectation mismatch is a contract error rather than an excuse to weaken matching.

Real résumé input and extracted output are private by default. The public regression fixture is generated at run time under ignored `.build/`; no résumé PDF is committed as source data.

### 2. Gate-behavior contract harness

The gate layer runs a six-case truth table through the production role scorer. It covers open gates, exact-zero liveness, exact-zero timeline, fractional scaling, and the configured closed-gate policy boundary. Each case checks the composite, gate trace, recommendation, and reason.

The same layer contains a deliberate mutation that changes liveness and timeline from multipliers into weighted addends. This is not a second production implementation. It is a test adversary: the suite succeeds only when production passes the contract and the mutation fails it.

### 3. Evidence and human handoff

Both modules emit JSON audits for machines and Markdown views for people. A separate evidence gate recomputes every headline count, enumerates numeric audit leaves, checks provenance labels, and rejects staged private paths or invented summaries. It can verify mechanical consistency; it cannot certify adequacy. Every report preserves the human-review boundary.

The implementation uses Node.js, the built-in `node:test` runner, PDF.js, Playwright, JSON fixtures, and Markdown audit views. The operating contract is delivered as a version-matched [AI recipe](../../../recipes/reallocation-verification-harness.md) and [human card](../../../recipes/reallocation-verification-harness.card.md).

## Measurable improvement

Before this contribution, the two named risks existed as written requirements without executable regression protection. After the contribution, the production gate contract passes **6 of 6 controlled cases and 40 of 40 assertions**, while the gate-as-vote mutation is rejected for **2 of 2 named witnesses**.

The primary improvement is the mutation result because it demonstrates sensitivity to the target failure, not merely that the happy path runs:

| Witness | Correct contract | Deliberately wrong result | Harness result |
|---|---|---|---|
| Zero liveness with strong votes | Composite `0`, `Skip` | `0.80`, `Apply` | Mutation caught |
| Zero timeline with strong votes | Composite `0`, `Skip` | `0.85`, `Apply` | Mutation caught |

The résumé module supplies a second control surface. Its public positive case passes **13 of 13 required fields and 1 of 1 order check**. An intentionally incomplete résumé passes only **7 of 13 fields and 0 of 1 order check**, and the overall verdict is `FAIL`. The regression suites currently pass 11 ATS tests, 10 gate tests, and 4 evidence-gate tests.

These numbers are script outputs, not estimates. They are recorded in the [gate audit](../gate-behavior/gate-behavior-audit.md), [ATS positive audit](../ats-paste-test/aarav-patel/paste-test-audit.md), [ATS break audit](../ats-paste-test/break-attempt/paste-test-audit.md), and exhaustive [verified-data evidence](step3.md).

## Verified vs. inferred: what the system knows

| The machine verifies | The machine does not know |
|---|---|
| PDF.js extracted a nonempty text layer from the named file | Whether a commercial ATS uses the same parser or produces the same result |
| Declared names, titles, dates, and headings are present under explicit match rules | Whether the résumé claims are true, persuasive, or sufficient |
| Declared fields appear in the required linear order | Whether the visual design is professionally effective |
| Production gate arithmetic matches the controlled truth table | Whether a real posting is currently live or a person's timeline input is legally correct |
| Exact-zero gates force composite zero and `Skip` | Whether scorer weights are calibrated for a particular job search |
| The named gate-as-vote mutation fails | Whether every possible future implementation defect is covered |
| Public counts reconcile to their JSON records | Whether the final human should apply to a role |

This boundary is intentional. Controlled gate values are labeled `local-evidence`; parser identity is an external dependency record; counts and verdicts are script output; real-world facts that the harness cannot observe remain missing.

## Failure modes designed into the workflow

- **Gate-as-vote regression:** a zero gate returns a nonzero composite or a non-`Skip` recommendation. The contract suite fails and blocks handoff.
- **Expectation drift:** an expected résumé field no longer matches its declared source line. Verification stops with a contract error instead of manufacturing a pass.
- **Missing or scrambled extraction:** required strings are absent or out of order. The audit names each failure and exits nonzero.
- **Private-data escape:** a real or external résumé attempts to write public artifacts. The workflow redirects or rejects the output, and the evidence gate scans staged and tracked paths.
- **Parser success mistaken for résumé quality:** mechanical extraction passes, but the report continues to require a person to inspect the extracted text and visual document.
- **Recipe/card drift:** the AI procedure and human operating card disagree on commands, outputs, or failure behavior. Their shared version contract requires them to be updated together.

## The limitation I would state in a design review

The system cannot verify real-world adequacy. In particular, a PDF.js pass is not proof that Workday, iCIMS, or another commercial ATS will parse the document identically, and a correct gate formula is only as truthful as the liveness and timeline records supplied to it. The harness protects the computation and the evidence boundary; it does not manufacture the missing reality.

## Runnable demo

From the repository root on PowerShell:

```powershell
npm.cmd run test:ats-parse
npm.cmd run test:gate-behavior
npm.cmd run test:capstone-step3
```

The expected handoff is 11/11 ATS tests, 10/10 gate tests, and 4/4 evidence-gate tests. The gate run must report that production passed and the deliberate mutation was caught. The evidence suite must also prove that a staged private path, an invented ATS count, and a mislabeled controlled value are rejected.

For a code review, start with the [ATS harness](../../../scripts/resumes/ats-parse-test.mjs), [gate contract core](../../../scripts/score/gate-behavior-core.mjs), and [production scorer integration](../../../scripts/score/role-scorer.mjs). The Markdown audits linked above show the human-facing output; their JSON twins provide the reproducible records.

## Engineering takeaway

The most important design choice was not adding more scoring logic. It was making incorrect confidence executable. The deliberate mutation produces answers that look reasonable, which is exactly why it belongs in the test suite. By pairing that adversarial check with source-backed résumé expectations, private-by-default artifacts, explicit provenance, and a human gate, the contribution makes a narrow promise and proves that promise continuously.
