# Step 4 — Honest Run

I ran both tools after Step 3 was approved. The real résumé and its report stayed in `private/`. Nothing private is copied here.

## Real terminal output

These lines came from the August 16, 2026 run.

### Normal public PDF

```powershell
npm.cmd run resumes:paste-test -- ".build\ats-paste-test\aarav-patel-public.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\aarav-patel"
```

```text
ATS paste test: PASS
  parser: pdfjs-dist 6.2.108
  pages: 2
  required fields: 13/13 PASS
  order checks: 1/1 PASS
```

### Broken public PDF

```powershell
npm.cmd run resumes:paste-test -- ".build\ats-paste-test\broken-render.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\break-attempt"
$LASTEXITCODE
```

```text
ATS paste test: FAIL
  parser: pdfjs-dist 6.2.108
  pages: 1
  required fields: 7/13 PASS
  order checks: 0/1 PASS
1
```

Exit code `1` means the broken PDF was caught. It is not a crash.

### Gate check

```powershell
npm.cmd run gate:behavior
```

```text
PASS gate contract: production 3/3 cases; gate-as-vote mutation caught
Database: data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv (b04a2f21ddc9214cbec9ba6943a8d4dd245c5fbc9e13cef74d6d989d8bc7ecbb)
Record: 1LIFE HEALTHCARE INC; approvals 2; denials 0; stored rate 100.0000%
NOT IMPLEMENTED: real liveness, personal timeline, full sponsorship probability, or real-role recommendation
Human decision: HUMAN_REVIEW_REQUIRED
reports\generated\gate-behavior\gate-behavior-audit.md
```

Records: [good ATS](../ats-paste-test/aarav-patel/paste-test-audit.json), [broken ATS](../ats-paste-test/break-attempt/paste-test-audit.json), and [Gate](../gate-behavior/gate-behavior-audit.json).

## My check and break attempt

- Math: `2 approvals / (2 approvals + 0 denials) = 100%`; `1.0 × 0.35 = 0.35`.
- Correct Gate code: open = `0.35`; liveness zero = `0 / Skip`; timeline zero = `0 / Skip`; `3/3` cases and `19/19` checks passed.
- Broken ATS PDF: `7/13` fields, `0/1` order, `FAIL`, exit code `1`.
- Wrong Gate code: each closed Gate gave `1.35 / Apply`; both wrong results were caught.

The H-1B rate is only a test value. It is not a real sponsorship chance. Step 3 gives the code and record for every number.

## What the tools do not know

They do not know if every ATS will agree, if résumé claims are good, if a real job is open, if sponsorship or visa timing works, or if a person should apply. These stay `NOT_IMPLEMENTED`. A person makes the final choice.

The public tests passed, both breaks were caught, and the real résumé stayed private. This is not an ATS certificate or a job decision.
