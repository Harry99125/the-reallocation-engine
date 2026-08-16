# Step 5 — PR Status

## Short answer

The project is ready for a local review, but the pull request has not been created.

The current branch is:

```text
contrib/zening-teng-verification-harness
```

It was built from the teacher's current `upstream/main`. The older fork history was saved in a local archive branch so it would not appear in the PR.

## What is ready

- The code is under `scripts/`.
- The AI recipe and human card are under `recipes/`.
- Reports are under `reports/generated/`.
- The public résumé PDF is created at test time instead of being committed as source data.
- `verify` passes.
- Strict `doctor` passes.
- The proposed files contain no real résumé, private ATS records, passwords, or environment files.
- A PR title and description are ready below.

## What is not done

- Step 3 still needs a named human review.
- Step 4 has not been written or run.
- The branch has not been pushed.
- No GitHub PR exists yet.
- There is no PR link to submit.

Because of those missing items, this step is only locally ready. It is not finished as a GitHub submission.

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
- Six controlled gate cases that run through the production scorer.
- A deliberately wrong gate-as-vote version that the tests must reject.
- JSON audits, readable Markdown reports, automated tests, an AI recipe, and a human card.
- A Step 3 checker that traces the reported numbers and blocks private staged files.

### Chapters

- Chapter 11: Bayesian Role Scorer.
- Chapter 13: Résumés That Survive the Filter.
- Chapter 16: The Build and the Honest Run.

### Results

- ATS tests: 11/11 passed.
- Public résumé: 13/13 fields and 1/1 order check passed.
- Broken résumé: 7/13 fields and 0/1 order check passed, so the final result was `FAIL`.
- Gate tests: 10/10 passed.
- Production gate cases: 6/6 passed with 40/40 assertions.
- Gate-as-vote examples: 2/2 were caught.

The numbers come from the saved JSON audits and the test runs listed in `step2.md` and `step3.json`.

### What is verified

The programs can verify PDF.js extraction, expected field presence, field order, scoring arithmetic, and whether the known gate-as-vote bug is caught.

The gate examples are controlled test data. They are not presented as live job or visa records.

### Limitation

The tools cannot prove that every commercial ATS will behave like PDF.js. They also cannot tell whether a real job is live, whether a person's timeline is legally correct, or whether someone should apply.

### Privacy

The PR contains no real résumé, private extracted text, application tracker, `data/ats/` activity, credentials, or environment files.

### Tests

- `npm.cmd run test:ats-parse`
- `npm.cmd run test:gate-behavior`
- `npm.cmd run test:capstone-step3`
- `npm.cmd run capstone:step3`
- `npm.cmd run verify`
- `npm.cmd run doctor -- --strict`

## What must happen before publishing

1. A named person completes the Step 3 review.
2. Step 4 is completed and saved without private data.
3. All tests are run again.
4. The final Git diff is checked.
5. The student signs in to GitHub.
6. The branch is pushed to the student's fork.
7. The PR is opened against `nikbearbrown/the-reallocation-engine:main`.
8. The real PR link is copied into the submission.

Until those actions happen, this report must not claim that the PR was submitted.
