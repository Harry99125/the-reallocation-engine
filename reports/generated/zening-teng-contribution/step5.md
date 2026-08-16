# Step 5 — GitHub PR Readiness

## Current verdict

**Local PR readiness: PASS. External submission: PENDING.**

The fork, compliant local branch, file placement, conformance, doctor, privacy boundary, and maintainer-ready PR description are prepared. The original fork-based capstone history was preserved under local archive branch `archive/zening-teng-verification-harness-origin-main`; the active branch was rebuilt directly from current `upstream/main` with only capstone work. No branch was pushed and no PR was created. Publication remains blocked until the named-human Step 3 gate and Step 4 honest run are complete, then every release gate is rerun.

## Requirement-by-requirement audit

| Teacher requirement | Status | Evidence | Remaining action |
|---|---|---|---|
| Fork the repository | PASS | `origin` is `ZeningTeng-Harry/the-reallocation-engine`; `upstream` is `nikbearbrown/the-reallocation-engine` | None locally |
| Branch `contrib/<name>-<component>` | PASS locally | Current branch is `contrib/zening-teng-verification-harness`, created from fetched `upstream/main`; old history is preserved separately | Push only after Step 4 and the final rerun |
| Contribution code under `scripts/` and `recipes/` | PASS | Maintained harness/test files are under `scripts/resumes/`, `scripts/score/`, and `scripts/`; paired operating documents are under `recipes/` | None |
| Docs/audits in the right folder | PASS | Human step reports are under `reports/generated/zening-teng-contribution/`; module audits are under their named `reports/generated/` subfolders | Keep them evidence-only |
| Nothing generated committed as source of truth | PASS | The public Markdown and expectation record define the ATS case; its PDF is rendered into ignored `.build/` at run time. Generated reports are labeled evidence and are not implementation inputs | Regenerate evidence after any source change |
| Run `npm run verify` | PASS | Full conformance and manifest check completed without errors or warnings after the Windows portability repair | Rerun immediately before push |
| Run `npm run doctor` | PASS | Strict doctor reports runnable environment, privacy clean, complete recipe frontmatter, and reconciled TODO counts | Rerun immediately before push |
| No PII or `data/ats/` contents | PASS for the clean proposed diff | The full upstream-based file scope contains no `private/`, `data/ats/`, real résumé PDF, environment file, fork-only assignment, or fork-only generated résumé | Recheck staged and upstream diffs immediately before push |
| PR description names gap, chapters, boundary, limitation | PASS as draft | The complete draft appears below | Re-read after Step 4 updates the evidence |
| Submit PR link | PENDING | GitHub CLI is not authenticated; the new branch is intentionally not pushed | Human authenticates, approves publication, creates PR, and submits its URL |

## Base-repository decision

A fresh fetch first showed that the old branch would have contributed sixteen commits relative to `upstream/main`, including ten older fork-only commits. The public upstream repository exposes pull-request review, so there was no verified basis to invoke the assignment's own-fork fallback. The complete old history was preserved under a local archive branch; the active assignment-named branch was recreated directly from fetched `upstream/main`, and only capstone implementation, public fixtures, generated evidence, recipes, reports, and required repository-portability fixes were carried forward. An own-fork PR remains only the fallback if an actual upstream policy or maintainer response blocks the external PR.

## Proposed PR title

Add ATS paste-test and gate-behavior verification harnesses

## Maintainer-ready PR description

### Gap closed

The repository named two validation gaps but did not have executable handoff evidence for either one: Chapter 13 résumé PDFs lacked a deterministic paste-test with per-field/order failures, and the Chapter 11/16 scorer lacked a contract test that proves liveness and timeline remain gates rather than weighted votes.

### What changed

- Added a generic PDF/Markdown ATS inspection mode with private-by-default output.
- Added strict, source-line-backed name/title/date/heading and reading-order verification.
- Added a production gate truth table covering open, zero, fractional, and policy-boundary behavior.
- Added a deliberate gate-as-vote mutation that the contract must reject.
- Added JSON machine audits, Markdown human reports, regression suites, and one versioned AI recipe/human card pair.
- Added a Step 3 evidence gate that reconciles metrics, traces numeric output to scripts/records, and blocks staged private paths or invented counts.

### Chapters satisfied

- Chapter 11 — Bayesian Role Scorer
- Chapter 13 — Résumés That Survive the Filter
- Chapter 16 — The Build and the Honest Run

### Verified vs. inferred

Verified script output includes PDF.js page/text extraction, declared field presence, declared linear order, production composite behavior, gate-trace separation, aggregate test assertions, and deliberate-mutation detection. Expected résumé fields trace to public source Markdown records; controlled gate values are labeled `local-evidence`. Universal ATS behavior, factual résumé truth, current real-job evidence, legal timeline correctness, and final application worthiness remain missing or human judgments rather than findings.

### Evidence

- ATS regression: 11/11 tests passed.
- Public ATS positive control: 13/13 required fields and 1/1 order check passed.
- ATS deliberate break: 7/13 fields and 0/1 order check passed; overall verdict `FAIL`.
- Gate regression: 10/10 tests passed.
- Production gate contract: 6/6 cases and 40/40 assertions passed.
- Gate-as-vote mutation: both named zero-gate witnesses produced plausible wrong `Apply` results and were caught.

Every figure above traces to the public audit JSON or the logged test run named in `step2.md` and `step3.json`.

### Privacy and honesty

The proposed contribution contains no real résumé, private extracted text, application tracker, `data/ats/` activity, credentials, or environment files. Public résumé data is anonymized example material. Controlled gate values are not represented as external records, and every machine report retains `HUMAN_REVIEW_REQUIRED` where adequacy cannot be automated.

### One limitation it cannot verify

This contribution verifies mechanical contracts, not real-world adequacy: it cannot determine whether a commercial ATS will behave like PDF.js or whether a real job/timeline input is currently true enough to justify applying.

### Test plan

- `npm.cmd run test:ats-parse`
- `npm.cmd run test:gate-behavior`
- `npm.cmd run test:capstone-step3`
- `npm.cmd run capstone:step3`
- `npm.cmd run verify`
- `npm.cmd run doctor -- --strict`

## Human publication sequence

1. Complete the named-human Step 3 attestation.
2. Complete Step 4 and add `step4.md`/`step4.json` without private content.
3. Rerun every command in the test plan and inspect the final diff.
4. Authenticate GitHub CLI under the student's account.
5. Push `contrib/zening-teng-verification-harness` to `origin`.
6. Create the cross-fork PR against `nikbearbrown/the-reallocation-engine:main` using this file as the body.
7. Open the PR in a browser, verify formatting and file scope, then submit the PR URL for grading.

No script may claim that steps 4–7 happened until GitHub returns the actual branch/PR state and a human approves publication.
