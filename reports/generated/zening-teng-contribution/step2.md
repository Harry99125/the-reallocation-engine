# Step 2 — What I Built

## Short version

I built both parts of the contribution and connected them to the real project.

The first part checks whether a résumé survives PDF text extraction. The second part checks whether the role scorer treats liveness and timeline as hard gates. Both parts have automated tests and saved reports.

## Part 1: ATS résumé checker

The checker accepts a PDF or Markdown file.

For a normal résumé, it extracts the text and looks for basic problems such as empty output, broken characters, and unusual reading order. The output goes to `private/` by default.

For a controlled test, it can also compare the PDF with a list of expected names, job titles, dates, and headings. Each field receives `PASS` or `FAIL`.

The public regression test uses a made-up résumé fixture so anyone can repeat the same check. I also made an incomplete version on purpose. The complete version passes. The incomplete version fails and shows exactly which fields are missing.

This public fixture is only a code test. The real résumé used later in Step 4 stays private and is not used as the public answer key.

## Part 2: gate-behavior checker

The scorer should work like this:

```text
final score = liveness × timeline × weighted score
```

If liveness or timeline is zero, the final score must be zero and the result must be `Skip`.

The test does not contain a hand-written company score. It reads `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`, records the file hash, and selects the first complete H-1B record in stored file order. It checks that the stored approval rate agrees with approvals divided by total petitions.

The historical approval rate is normalized only to create a nonzero value before the gates. It is a test proxy, not the full sponsorship probability.

The harness sends three cases through the real scorer: both gates open, liveness zero, and timeline zero. The gate values 0 and 1 come from the Chapter 11/16 test contract. They are not statements about a real job or a real visa timeline.

The harness also runs a deliberately wrong version where the gates are added like normal scores. The test must reject it.

## Test results

These numbers came from the saved test reports.

| Test | Result |
|---|---:|
| ATS automated tests | 11/11 passed |
| Public résumé fields | 13/13 passed |
| Public résumé order check | 1/1 passed |
| Broken résumé fields | 7/13 passed |
| Broken résumé order check | 0/1 passed; final result `FAIL` |
| Gate automated tests | 10/10 passed |
| Production gate cases | 3/3 passed |
| Production gate assertions | 19/19 passed |
| Deliberately wrong gate cases | 2/2 caught |

The database scan read 30,369 rows and 20 columns. It found 1,557 complete H-1B records and 0 approval-rate arithmetic mismatches. These counts came from the fresh gate run, not from this report.

The selected stored record was record 80, `1LIFE HEALTHCARE INC`: 2 approvals, 0 denials, and a stored approval rate of 100%. The script recomputed 100%, so the arithmetic check passed. The repository does not include the raw employer-match evidence, so the company join is still unverified.

The deliberately wrong gate version returned `1.35 / Apply` for both closed-gate witnesses. These are outputs from intentionally broken test code, not real company recommendations. The harness rejected both results.

## AI recipe and human card

The two modules share one pair of instructions:

- AI recipe: `recipes/Zening-AIRecipe.md`
- Human card: `recipes/Zening.card.md`

The recipe gives the full run order, checks, outputs, and stop rules. The card is the shorter version for a person. It explains what the tools do, how to run them, and what can go wrong.


## Main code

- ATS program: `scripts/resumes/ats-parse-test.mjs`
- ATS tests: `scripts/resumes/ats-parse-test.test.mjs`
- Gate logic: `scripts/score/gate-behavior-core.mjs`
- Gate database reader: `scripts/score/gate-database-evidence.mjs`
- Gate report program: `scripts/score/gate-behavior-harness.mjs`
- Gate tests: `scripts/score/gate-behavior.test.mjs`
- Production scorer: `scripts/score/role-scorer.mjs`

The public test records are under `data/examples/`. The saved reports are under `reports/generated/`.

## What the tests can catch

- A résumé field is missing or appears in the wrong order.
- The expected field list no longer matches the public source résumé.
- A gate is changed into a normal weighted score.
- A private résumé tries to write a public report.
- A machine report tries to sound more certain than the evidence allows.

## What this step did not prove

The ATS test does not represent every commercial ATS. It does not judge whether a résumé is true or well written.

The gate database has historical H-1B fields, but it cannot verify the full sponsorship probability, current job liveness, or a personal visa timeline. Those outputs are `NOT IMPLEMENTED`. A person still makes the final application decision.

## Status

Step 2 is complete. Step 3 checks where every important number came from.
