# Two Safety Checks for the Reallocation Engine


[Open the single-page website](step6.html).

I added two checks to an evidence-based job-search project. One checks whether a résumé can be read after it becomes a PDF. The other checks whether the job scorer keeps its two hard gates.

The main result is simple: I made a wrong gate implementation on purpose, and the tests caught both bad results.

## The problem

An international student has limited time to apply for jobs. A bad system can waste that time in two ways.

First, a résumé can look correct on screen but turn into broken or missing text when software reads the PDF. A heading, date, or job title may disappear or move to the wrong place.

Second, the scorer can make a more serious mistake. Job liveness and visa timing are supposed to be hard gates. If a job is closed, or the timing cannot work, strong scores in other areas should not change the answer to `Apply`.

The project explained these rules, but it did not have tests for both of them.

## What I built

### ATS résumé checker

The first tool accepts a PDF or Markdown résumé. It extracts the text with PDF.js and checks for basic parsing problems.

For a normal résumé, it reports problems such as empty text, broken characters, or unusual layout. The result still asks a person to read the extracted text.

For the public test, the tool also checks a known list of names, titles, dates, headings, and their order. That list points back to the public source résumé, so the test cannot quietly change its expected answer.

Real résumé output is private by default.

### Gate-behavior checker

The role scorer should follow this rule:

```text
final score = liveness × timeline × weighted score
```

When liveness or timeline is zero, the final score must be zero and the result must be `Skip`.

I added a database reader for the stored SEC/H-1B CSV. It records the file hash, reads the first complete H-1B record in file order, and checks the approval rate against approvals and denials. This avoids typing a company score into the test.

The historical approval rate is used only to create a nonzero value before the gates. It is not called the full sponsorship probability.

I run three gate cases through the real scorer: both gates open, liveness zero, and timeline zero. The 0 and 1 gate values are test controls from Chapters 11 and 16, not claims about a real job or visa timeline. I also added a deliberately wrong version that adds the gates like normal scores. The tests pass only when the real scorer is correct and the wrong version is rejected.

### Evidence checker

The tools save JSON records and readable Markdown reports. A separate Step 3 program checks the totals, traces the numbers back to their files, and looks for private files in the proposed Git changes.

The [AI recipe](../../../recipes/Zening-AIRecipe.md) gives the full run process. The [human card](../../../recipes/Zening.card.md) gives a shorter operating guide.

### Honest run

After the earlier Step 3 review, I ran the ATS checker on the approved real résumé. The résumé, extracted text, and result stayed under `private/`. I did not turn any private result into a public score.

The gate evidence later changed to the database-backed version described here. Zening Teng reviewed and approved recipe 0.12.0 with the current database hash. I then reran the gate harness and both public ATS cases. The [Step 4 report](step4.md) contains that post-approval run.

I used the made-up public résumé only as a repeatable code test.

## Results

| Test | Result |
|---|---:|
| ATS tests | 11/11 passed |
| Public résumé fields | 13/13 passed |
| Public résumé order | 1/1 passed |
| Broken résumé | 7/13 fields and 0/1 order; final result `FAIL` |
| Gate tests | 10/10 passed |
| Production gate cases | 3/3 passed |
| Production gate assertions | 19/19 passed |
| Wrong gate examples | 2/2 caught |

The gate run read 30,369 stored rows and 20 columns. It found 1,557 complete H-1B records and 0 approval-rate arithmetic mismatches. The first complete record had 2 approvals, 0 denials, and a stored 100% approval rate; the script recomputed 100%.

The two wrong gate results are the most important evidence:

| Case | Correct result | Wrong result | Test result |
|---|---|---|---|
| Liveness is zero | `0 / Skip` | `1.35 / Apply` | Caught |
| Timeline is zero | `0 / Skip` | `1.35 / Apply` | Caught |

These are saved test-program results, not estimates or real-job recommendations. The H-1B inputs trace to the stored CSV. The records are in the [gate report](../gate-behavior/gate-behavior-audit.md), [good résumé report](../ats-paste-test/aarav-patel/paste-test-audit.md), [broken résumé report](../ats-paste-test/break-attempt/paste-test-audit.md), [Step 3 evidence report](step3.md), and [Step 4 honest run](step4.md).

## What the programs can check

- PDF.js returned readable text.
- Expected names, titles, dates, and headings are present.
- The expected fields are in the right order.
- The production scorer follows the database-backed gate cases.
- The selected H-1B record's approval rate matches its approvals and denials.
- A zero gate produces `0 / Skip`.
- The known gate-as-vote bug is caught.


## What the programs cannot know

- Whether Workday, iCIMS, or another ATS will read the PDF the same way.
- Whether the résumé claims are true or persuasive.
- Whether the résumé design looks professional.
- Whether a real job is still open.
- Whether a real visa timeline is legally correct.
- Whether the scoring weights are good for one person's search.
- Whether the person should apply.

## Failure cases I tested

- A résumé field is missing.
- Résumé fields appear in the wrong order.
- The expected field list no longer matches the public source.
- A zero gate is treated like a normal score.
- A private résumé tries to write a public report.
- The AI recipe and human card stop matching.


## Main limitation

A PDF.js pass does not prove that every commercial ATS will parse the résumé correctly. A correct gate formula also does not prove that the company join, current job liveness, full sponsorship probability, or visa input is true.

The tools check the code and the saved evidence. Missing real inputs stay `NOT IMPLEMENTED`; they are not replaced with made-up values.

## Run the demo

From the project root in PowerShell:

```powershell
npm.cmd run test:ats-parse
npm.cmd run test:gate-behavior
npm.cmd run test:capstone-step3
```

Read the fresh test output for the counts. A valid run must show every ATS test, every gate test, and every Step 3 test passing.

The main code is in the [ATS checker](../../../scripts/resumes/ats-parse-test.mjs), [database reader](../../../scripts/score/gate-database-evidence.mjs), [gate checker](../../../scripts/score/gate-behavior-core.mjs), and [production scorer](../../../scripts/score/role-scorer.mjs).

## What I learned

The hardest bugs are not always obvious crashes. The wrong gate code returned numbers that looked reasonable. Without the deliberate bad version, a normal test could have missed the problem.
