# Two Safety Checks for the Reallocation Engine

**Zening Teng — Software Engineering Case Study**

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

I wrote six controlled cases and ran them through the real scorer. I also added a deliberately wrong version that treats the gates as normal scores. The tests pass only when the real scorer is correct and the wrong version is rejected.

### Evidence checker

The tools save JSON records and readable Markdown reports. A separate Step 3 program checks the totals, traces the numbers back to their files, and looks for private files in the proposed Git changes.

The [AI recipe](../../../recipes/Zening-AIRecipe.md) gives the full run process. The [human card](../../../recipes/Zening.Humancard.md) gives a shorter operating guide.

## Results

| Test | Result |
|---|---:|
| ATS tests | 11/11 passed |
| Public résumé fields | 13/13 passed |
| Public résumé order | 1/1 passed |
| Broken résumé | 7/13 fields and 0/1 order; final result `FAIL` |
| Gate tests | 10/10 passed |
| Production gate cases | 6/6 passed |
| Production gate assertions | 40/40 passed |
| Wrong gate examples | 2/2 caught |

The two wrong gate results are the most important evidence:

| Case | Correct result | Wrong result | Test result |
|---|---|---|---|
| Liveness is zero | `0 / Skip` | `0.80 / Apply` | Caught |
| Timeline is zero | `0 / Skip` | `0.85 / Apply` | Caught |

These are saved program results, not estimates. The records are in the [gate report](../gate-behavior/gate-behavior-audit.md), [good résumé report](../ats-paste-test/aarav-patel/paste-test-audit.md), [broken résumé report](../ats-paste-test/break-attempt/paste-test-audit.md), and [Step 3 evidence report](step3.md).

## What the programs can check

- PDF.js returned readable text.
- Expected names, titles, dates, and headings are present.
- The expected fields are in the right order.
- The production scorer follows the controlled gate cases.
- A zero gate produces `0 / Skip`.
- The known gate-as-vote bug is caught.
- The reported totals match their JSON files.

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

Each of these cases has a clear failure result. The program does not hide it behind a friendly summary.

## Main limitation

A PDF.js pass does not prove that every commercial ATS will parse the résumé correctly. A correct gate formula also does not prove that the job or visa inputs are true.

The tools check the code and the saved evidence. They do not replace real records or human review.

## Run the demo

From the project root in PowerShell:

```powershell
npm.cmd run test:ats-parse
npm.cmd run test:gate-behavior
npm.cmd run test:capstone-step3
```

The expected results are 11/11 ATS tests, 10/10 gate tests, and 4/4 Step 3 tests.

The main code is in the [ATS checker](../../../scripts/resumes/ats-parse-test.mjs), [gate checker](../../../scripts/score/gate-behavior-core.mjs), and [production scorer](../../../scripts/score/role-scorer.mjs).

## What I learned

The hardest bugs are not always obvious crashes. The wrong gate code returned numbers that looked reasonable. Without the deliberate bad version, a normal test could have missed the problem.

This project taught me to test the wrong answer on purpose, save the evidence, and be clear about what the program still cannot know.
