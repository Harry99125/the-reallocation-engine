# Step 2 — Contribution Build

## Outcome

The unified contribution is built and runnable. It contains the ATS paste-test submodule, the gate-behavior submodule, one AI recipe, and one human card. The original fork-based Step 2 implementation is preserved at commit `f4d0da7`; the upstream-based PR branch carries the same implementation contract in clean-port commit `7809f4b` without the fork's unrelated history.

## Working contribution

| Handoff claim | Observed result | Script | Record |
|---|---|---|---|
| ATS regression suite | 11/11 tests passed | `scripts/resumes/ats-parse-test.test.mjs` | `logs/RUN_LOG.md`, Step 2 entry |
| Public ATS positive control | 13/13 required fields and 1/1 order check passed | `scripts/resumes/ats-parse-test.mjs` | `reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json` |
| ATS deliberate break | 7/13 fields and 0/1 order check passed; overall verdict `FAIL` | `scripts/resumes/ats-parse-test.mjs` | `reports/generated/ats-paste-test/break-attempt/paste-test-audit.json` |
| Gate regression suite | 10/10 tests passed | `scripts/score/gate-behavior.test.mjs` | `logs/RUN_LOG.md`, Step 2 entry |
| Production gate contract | 6/6 cases and 40/40 assertions passed | `scripts/score/gate-behavior-harness.mjs` and production `role-scorer.mjs` | `reports/generated/gate-behavior/gate-behavior-audit.json` |
| Named gate-as-vote mutation | Zero-liveness witness became `0.80 / Apply`; zero-timeline witness became `0.85 / Apply`; both were caught as failures | `scripts/score/gate-behavior-core.mjs` | `reports/generated/gate-behavior/gate-behavior-audit.json` |
| Targeted Step 2 conformance | 22 contribution files conformed | `scripts/conformance.mjs` | `logs/RUN_LOG.md`, Step 2 entry |

These figures are script outputs copied from the named audit/run records, not estimates or model judgments.

## Two-customer pair

The current pair is:

- AI customer: `recipes/harness.md`
- Human customer: `recipes/harness.card.md`

The AI recipe contains the assignment's nine required sections: executive summary, required reads, phase gates, primary stored tools, workflow, output contract, verification checks, logging rules, and stop conditions. The human card states purpose, capabilities and limits, dependencies, annotated commands, outputs, success conditions, and named failures including drift and verified-data contract violation.

The original Step 2 pair shipped together as v0.1.0 in commit `f4d0da7`. Later evidence, report-contract, and portable-fixture maintenance advanced both files together; their current matching v0.8.0 is authoritative for present commands.

## Main maintained files

- `scripts/resumes/ats-parse-test.mjs`
- `scripts/resumes/ats-parse-test.test.mjs`
- `scripts/score/gate-behavior-core.mjs`
- `scripts/score/gate-behavior-harness.mjs`
- `scripts/score/gate-behavior.test.mjs`
- `scripts/score/role-scorer.mjs`
- `data/examples/aarav-patel-ats-expected.json`
- `data/examples/ats-paste-test-broken-render.md`
- `data/examples/gate-behavior-cases.json`
- `resumes/aarav-patel-cv.md` as the public source rendered to an ignored temporary PDF at test time
- The paired recipe and card named above

## Failure behavior demonstrated

- Missing or reordered résumé evidence produces deterministic `FAIL`, not a fluent success message.
- Expectation/source drift is a contract error rather than a weakened match.
- A gate-as-vote implementation fails the contract even when its result looks plausible.
- A private/external résumé cannot write public output through the generic command.
- Machine PASS retains `HUMAN_REVIEW_REQUIRED`; it cannot promote itself to adequate or verified.

## What Step 2 did not establish

- Universal compatibility with commercial ATS products
- Factual truth or quality of a real résumé
- Truth of upstream sponsorship, liveness, role-quality, or timeline inputs for a real job
- Calibration of scorer weights
- A final human Apply/Consider/Skip decision

## Step status

**Complete.** Code, public fixtures, positive controls, deliberate breaks, machine/human audits, and the two-customer pair are present and tested. Step 3 provides the separate verified-data boundary and ethics evidence.

## Record note

This report was added after Step 2 at the student's request for one plainly named report per material capstone step. Historical results above trace to the original audits, run log, and commit rather than being recreated from memory.
