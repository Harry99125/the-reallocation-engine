# Step 4 — Honest Run

I ran the two modules after the named Step 3 review. I used a real résumé only in the private ATS run. I used public test data for the reproducible terminal evidence below.

## Private résumé run

The ATS inspection ran on the approved real PDF. The input, extracted text, and report stayed under `private/ats-paste-test/`, which Git ignores.

I did not copy the résumé text, private path, or résumé-derived counts into this public report. The private run proves that the command works on the approved file. It does not prove that the résumé is good or that every ATS will parse it the same way.

## Real terminal output

These lines were copied from the current public run on August 16, 2026.

### Normal public PDF

Command:

```powershell
npm.cmd run resumes:paste-test -- ".build\ats-paste-test\aarav-patel-public.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\aarav-patel"
```

Output:

```text
ATS paste test: PASS
  parser: pdfjs-dist 6.2.108
  pages: 2
  required fields: 13/13 PASS
  order checks: 1/1 PASS
  artifacts: reports\generated\ats-paste-test\aarav-patel\paste-test.txt, reports\generated\ats-paste-test\aarav-patel\paste-test-audit.json, reports\generated\ats-paste-test\aarav-patel\paste-test-audit.md
  human gate: read paste-test.txt; this harness does not certify every ATS
```

### Broken public PDF

Command:

```powershell
npm.cmd run resumes:paste-test -- ".build\ats-paste-test\broken-render.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\break-attempt"
$LASTEXITCODE
```

Output:

```text
ATS paste test: FAIL
  parser: pdfjs-dist 6.2.108
  pages: 1
  required fields: 7/13 PASS
  order checks: 0/1 PASS
  artifacts: reports\generated\ats-paste-test\break-attempt\paste-test.txt, reports\generated\ats-paste-test\break-attempt\paste-test-audit.json, reports\generated\ats-paste-test\break-attempt\paste-test-audit.md
  human gate: read paste-test.txt; this harness does not certify every ATS
1
```

Exit code `1` is expected for this break. It means the checker found missing fields or broken order. It is not a crash.

### Gate check

Command:

```powershell
npm.cmd run gate:behavior
```

Output:

```text
PASS gate contract: production 3/3 cases; gate-as-vote mutation caught
Database: data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv (b04a2f21ddc9214cbec9ba6943a8d4dd245c5fbc9e13cef74d6d989d8bc7ecbb)
Record: 1LIFE HEALTHCARE INC; approvals 2; denials 0; stored rate 100.0000%
NOT IMPLEMENTED: real liveness, personal timeline, full sponsorship probability, or real-role recommendation
Human decision: HUMAN_REVIEW_REQUIRED
reports\generated\gate-behavior\gate-behavior-audit.md
```

The source records are the [normal ATS report](../ats-paste-test/aarav-patel/paste-test-audit.json), [broken ATS report](../ats-paste-test/break-attempt/paste-test-audit.json), and [Gate report](../gate-behavior/gate-behavior-audit.json).

## Did the results make sense?

I checked the math instead of trusting the word `PASS`.

The Gate script selected the first complete H-1B record in file order. It has 2 approvals and 0 denials, so the saved rate is 100%. The script changed 100% to `1.0` and multiplied it by the Chapter 11 weight `0.35`. The starting value was `0.35`.

The three cases followed the rule:

- Both gates open: expected `0.35`; observed `0.35`.
- Liveness zero: expected `0 / Skip`; observed `0 / Skip`.
- Timeline zero: expected `0 / Skip`; observed `0 / Skip`.

The result makes sense: multiplying by zero closes the gate. A correct `Skip` is a successful result because the role did not pass a hard requirement.

This old H-1B rate is only a test starting value. It is not a full sponsorship probability. The Gate values `0` and `1` are test values from Chapters 11 and 16. They are not facts about a real job or a real visa case.

The ATS result also makes sense. The complete public test PDF passed its listed fields and order. The incomplete test PDF returned `FAIL` instead of hiding missing information.

## How I tried to break the tools

I tried to break both modules.

For ATS, I used an intentionally incomplete public PDF. The checker returned `7/13` fields, `0/1` order checks, `FAIL`, and exit code `1`.

For Gate behavior, I ran deliberately wrong code that added the two gates like ordinary scores. When either gate was closed, the wrong code returned `1.35 / Apply`. The correct rule required `0 / Skip`, so the test caught both wrong results.

## Main results

These numbers come from test cases, not real jobs:

- Normal public ATS test: `13/13` fields and `1/1` order check passed.
- ATS break: `7/13` fields and `0/1` order checks passed; final verdict `FAIL`.
- Real Gate code: `3/3` cases and `19/19` checks passed.
- Wrong Gate code: `2/2` bad `Apply` results were caught.

Each number comes from one of the three linked JSON reports. Step 3 names the script and saved source for every number.

## What the tools do not know

The tools could not know:

- whether every commercial ATS will parse the résumé the same way;
- whether résumé claims are true, strong, or visually good;
- whether a real job is still open;
- the full sponsorship probability for a real role;
- whether a personal visa timeline is legally possible;
- whether the company in one data source is really the same company in another source, because the original matching evidence is missing;
- whether a person should apply.

These items stay unknown or `NOT_IMPLEMENTED`. A human owns the final decision.

## Final result

The normal public tests passed. Both deliberate breaks were detected. The real résumé run stayed private. The scripts did not claim a real job-opening value, a personal visa timeline, or a real-job recommendation.

This is evidence that the two harnesses behave as claimed. It is not a universal ATS certificate and it is not an application decision.
