# Step 5 — PR Status

## Short answer

The project is ready for its final local checks, but the pull request has not been created.

The current branch is:

```text
contrib/zening-teng-verification-harness
```

It was built from the teacher's current `upstream/main`. The older fork history was saved in a local archive branch so it would not appear in the PR.

## What is ready

- The code is under `scripts/`.
- The AI recipe and human card are under `recipes/`.
- Reports are under `reports/generated/`.


## What is not done

- The branch has not been pushed.
- No GitHub PR exists yet.
- There is no PR link to submit.

Because the GitHub actions are still missing, this step is locally ready but not externally complete.

## Proposed PR title

Add ATS paste-test and gate-behavior verification harnesses

## Proposed PR description

### Problem

This PR adds tests for two gaps named in the book.

Chapter 13 needs a repeatable way to check whether important résumé text survives PDF extraction. Chapters 11 and 16 need a test that proves liveness and timeline are hard gates, not normal weighted scores.

### What I added

- A PDF and Markdown résumé inspection command.
- Optional checks for expected names, titles, dates, headings, and reading order.
- Private output by default for real résumé files.
- A database reader that hashes the stored SEC/H-1B CSV, selects the first complete H-1B record in file order, and checks its approval-rate arithmetic.
- Three Chapter 11/16 gate cases that run the database-derived proxy through the production scorer.
- A deliberately wrong gate-as-vote version that the tests must reject.
- JSON audits, readable Markdown reports, automated tests, an AI recipe, and a human card.
- A Step 3 checker that traces the reported numbers and blocks private staged files.
- A completed Step 4 honest run with post-approval public terminal output, a plausibility audit, deliberate breaks, and a private real-résumé run whose details are withheld.

### Chapters

- Chapter 11: Bayesian Role Scorer.
- Chapter 13: Résumés That Survive the Filter.
- Chapter 16: The Build and the Honest Run.

### Results

- ATS tests: 11/11 passed.
- Public résumé: 13/13 fields and 1/1 order check passed.
- Broken résumé: 7/13 fields and 0/1 order check passed, so the final result was `FAIL`.
- Gate tests: 10/10 passed.
- Production gate cases: 3/3 passed with 19/19 assertions.
- Gate-as-vote examples: 2/2 were caught.

The numbers come from the saved JSON audits and the test runs listed in `step2.md` and `step3.json`.

Step 4 records the approved private run, the post-approval public rerun, and what the machine could not know. The real résumé and all derived private results stay outside the PR.

### What is verified

The programs can verify PDF.js extraction, expected field presence, field order, scoring arithmetic, and whether the known gate-as-vote bug is caught.

The gate business input comes from `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`. The saved run read 30,369 rows, found 1,557 complete H-1B records, and found 0 approval-rate arithmetic mismatches. The selected record was the first complete record in file order; it was not hand-picked.

The stored historical approval rate is used only as a nonzero proxy for the mechanical gate test. It is not presented as the full sponsorship probability. The 0/1 gate values are Chapter contract controls, not live job or visa findings. Real liveness, personal timeline, full sponsorship probability, and a real-role recommendation remain `NOT IMPLEMENTED`.

### Limitation

The tools cannot prove that every commercial ATS will behave like PDF.js. The stored database also lacks the raw employer-match evidence needed to verify its company join, and it lacks the inputs needed for a full sponsorship probability. The tools cannot tell whether a real job is live, whether a person's timeline is legally correct, or whether someone should apply.

### Privacy

The PR contains no real résumé, private extracted text, application tracker, `data/ats/` activity, credentials, or environment files.

### Tests

- `npm.cmd run test:ats-parse`
- `npm.cmd run test:gate-behavior`
- `npm.cmd run test:capstone-step3`
- `npm.cmd run capstone:step3`
- `npm.cmd run verify`
- `npm.cmd run doctor -- --strict`
