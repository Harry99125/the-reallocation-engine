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

The test sends six controlled cases through the real scorer. It also runs a deliberately wrong version where the gates are treated like normal scores. That wrong version produces believable `Apply` results, so the test must catch it.

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
| Production gate cases | 6/6 passed |
| Production gate assertions | 40/40 passed |
| Deliberately wrong gate cases | 2/2 caught |

The wrong gate version returned `0.80 / Apply` when liveness was zero and `0.85 / Apply` when timeline was zero. The test rejected both results.

## AI recipe and human card

The two modules share one pair of instructions:

- AI recipe: `recipes/Zening-AIRecipe.md`
- Human card: `recipes/Zening.Humancard.md`

The recipe gives the full run order, checks, outputs, and stop rules. The card is the shorter version for a person. It explains what the tools do, how to run them, and what can go wrong.

Both files use version `0.11.0` and point to each other.

## Main code

- ATS program: `scripts/resumes/ats-parse-test.mjs`
- ATS tests: `scripts/resumes/ats-parse-test.test.mjs`
- Gate logic: `scripts/score/gate-behavior-core.mjs`
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

The ATS test does not represent every commercial ATS. It does not judge whether a résumé is true or well written. The gate test does not prove that live job, sponsorship, or visa inputs are correct. A person still makes the final application decision.

## Status

Step 2 is complete. Step 3 checks where every important number came from.
