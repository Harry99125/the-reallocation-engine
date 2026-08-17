# Step 4 — Honest Run

I ran the two modules after the named Step 3 review. I used my resume  in the private ATS run. 

## Private résumé run

The ATS inspection ran on the approved real PDF. The input, extracted text, and report stayed under `private/ats-paste-test/`, which Git ignores.

I did not copy the résumé text, private path, or résumé-derived counts into this public report. The private run proves that the command works on the approved file. It does not prove that the résumé is good or that every ATS will parse it the same way.

## Real terminal output

These lines were copied from the current public run on August 16, 2026.

### Public ATS positive control

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

### ATS deliberate break

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

### Gate behavior harness

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

The source records are the [positive ATS audit](../ats-paste-test/aarav-patel/paste-test-audit.json), [broken ATS audit](../ats-paste-test/break-attempt/paste-test-audit.json), and [gate audit](../gate-behavior/gate-behavior-audit.json).


## Break attempts

I tried to break both modules.

For ATS, I used an intentionally incomplete public PDF. The checker returned `7/13` fields, `0/1` order checks, `FAIL`, and exit code `1`.

For Gate behavior, I ran deliberately wrong code that added liveness and timeline like ordinary votes. With liveness closed, the wrong code returned `1.35 / Apply`. With timeline closed, it also returned `1.35 / Apply`. The correct contract required `0 / Skip`, so the harness caught both wrong results.

## Metric readout

These are controlled software-test results, not real-job performance rates:

- Public ATS positive control: `13/13` fields and `1/1` order check passed.
- ATS break: `7/13` fields and `0/1` order checks passed; final verdict `FAIL`.
- Production Gate contract: `3/3` cases and `19/19` assertions passed.
- Gate-as-vote break: `2/2` wrong `Apply` witnesses were caught.

Each number above comes from one of the three linked JSON audits. Step 3 lists the script and source for every numeric field.

## What the machine could not know

The tools could not know:

- whether every commercial ATS will parse the résumé the same way;
- whether résumé claims are true, strong, or visually good;
- whether a real job is still open;
- the full sponsorship probability for a real role;
- whether a personal visa timeline is legally possible;
- whether the stored company join is correct without the missing raw match evidence;
- whether a person should apply.

These items stay unknown or `NOT_IMPLEMENTED`. A human owns the final decision.

## Honest result

The public positive controls passed. Both deliberate breaks were detected. The real résumé run stayed private. The scripts did not claim a real liveness value, a personal timeline, or a real-job recommendation.

This is evidence that the two harnesses behave as claimed. It is not a universal ATS certificate and it is not an application decision.
